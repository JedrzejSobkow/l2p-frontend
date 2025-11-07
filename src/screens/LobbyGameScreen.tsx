import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import GameShell from '../components/games/GameShell';
import TicTacToeModule from '../components/games/ticTacToe/module';
import { useAuth } from '../components/AuthContext';
import { getCurrentLobby, type LobbyMember, type CurrentLobbyResponse } from '../services/lobby';
import {
  connectGameSocket,
  disconnectGameSocket,
  emitGetGameState,
  emitMakeMove,
  emitCreateGame,
  onGameStarted,
  offGameStarted,
  onMoveMade,
  offMoveMade,
  onGameState,
  offGameState,
  onGameEnded,
  offGameEnded,
  onGameError,
  offGameError,
  getGameSocket,
  type EngineConfig,
} from '../services/game';
import { useNavigate } from 'react-router-dom';

const LobbyGameScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lobbyMembers, setLobbyMembers] = useState<LobbyMember[]>([]);
  const [lobby, setLobby] = useState<CurrentLobbyResponse | null>(null);
  const [engineConfig, setEngineConfig] = useState<EngineConfig | undefined>(undefined);
  const [gameState, setGameState] = useState<any | null>(null);
  const [gameName, setGameName] = useState<string>('tictactoe');
  const [lastMove, setLastMove] = useState<{ index: number } | undefined>(undefined);
  const triedAutoCreateRef = useRef(false);
  const ensureJoinedRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lobbyRef = useRef<CurrentLobbyResponse | null>(null);
  const userIdRef = useRef<string | number | undefined>(user?.id);

  useEffect(() => {
    let mounted = true;
    // Load lobby members for player data
    (async () => {
      try {
        const l = await getCurrentLobby();
        console.log(l)
        if (!mounted) return;
        console.log('set')
        setLobbyMembers(l.members);
        setLobby(l);
      } catch (e) {
        console.error('Failed to load lobby for game view', e);
        // If not in a lobby, redirect back
        try { navigate('/lobby'); } catch {
          // ignore in tests
        }
      }
    })();

    // Connect and subscribe to game events
    connectGameSocket();

    const handleGameStarted = (ev: any) => {
      setGameName(ev.game_name || 'tictactoe');
      setGameState(ev.game_state);
      setLastMove(undefined);
    };
    const handleGameState = (ev: any) => {
      setGameState(ev.game_state);
      if (ev.engine_config) setEngineConfig(ev.engine_config);
      const lm = ev.game_state?.last_move;
      if (lm && typeof lm.row === 'number' && typeof lm.col === 'number' && Array.isArray(ev.game_state?.board)) {
        const dim = Array.isArray(ev.game_state.board[0]) ? ev.game_state.board.length : Math.max(1, Math.floor(Math.sqrt((ev.game_state.board as any[]).length)));
        setLastMove({ index: lm.row * dim + lm.col });
      } else {
        setLastMove(undefined);
      }
      // Once we know a game exists, ensure we join the server room by reconnecting once
      if (!ensureJoinedRef.current) {
        const sock = getGameSocket();
        if (sock && sock.connected) {
          ensureJoinedRef.current = true;
          sock.disconnect();
          setTimeout(() => sock.connect(), 200);
        }
      }
      // Stop polling if any
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    const handleMoveMade = (ev: any) => {
      setGameState(ev.game_state);
      const lm = ev.move_data;
      if (lm && typeof lm.row === 'number' && typeof lm.col === 'number' && Array.isArray(ev.game_state?.board)) {
        const dim = Array.isArray(ev.game_state.board[0]) ? ev.game_state.board.length : Math.max(1, Math.floor(Math.sqrt((ev.game_state.board as any[]).length)));
        setLastMove({ index: lm.row * dim + lm.col });
      } else {
        setLastMove(undefined);
      }
    };
    const handleGameEnded = (ev: any) => {
      setGameState(ev.game_state);
    };

    onGameStarted(handleGameStarted);
    onGameState(handleGameState);
    onMoveMade(handleMoveMade);
    onGameEnded(handleGameEnded);
    const handleGameError = (err: any) => {
      const msg = String(err?.error ?? '').toLowerCase();
      if (msg === 'no active game found' || msg.includes('no active game')) {
        const curLobby = lobbyRef.current;
        const uid = userIdRef.current;
        if (curLobby && String(curLobby.host_id) === String(uid) && !triedAutoCreateRef.current) {
          triedAutoCreateRef.current = true;
          const rawName = curLobby.game?.name || 'tictactoe';
          const slug = String(rawName).toLowerCase().replace(/[^a-z0-9]+/g, '');
        } else {
          // poll for state until host starts; also try to auto-create once lobby becomes available
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(() => {
              if (!triedAutoCreateRef.current) {
                const l = lobbyRef.current;
                const u = userIdRef.current;
                if (l && String(l.host_id) === String(u)) {
                  triedAutoCreateRef.current = true;
                  const raw = l.game?.name || 'tictactoe';
                  const s = String(raw).toLowerCase().replace(/[^a-z0-9]+/g, '');
                  return;
                }
              }
              emitGetGameState();
            }, 2000);
          }
        }
      }
    };
    onGameError(handleGameError);

    emitGetGameState();

    return () => {
      offGameStarted(handleGameStarted);
      offGameState(handleGameState);
      offMoveMade(handleMoveMade);
      offGameEnded(handleGameEnded);
      offGameError(handleGameError);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      disconnectGameSocket();
      mounted = false;
    };
  }, []);

  // Keep latest lobby/user in refs for event handlers
  useEffect(() => { lobbyRef.current = lobby; }, [lobby]);
  useEffect(() => { userIdRef.current = user?.id; }, [user]);

  const players = useMemo(() => {
    if (lobbyMembers.length === 0) return [] as Array<{ userId: string; nickname: string }>;
    const playerSymbols: Record<string, string> | undefined = gameState?.player_symbols;
    if (playerSymbols) {
      const withSymbols = lobbyMembers
        .filter(m => String(m.user_id) in playerSymbols)
        .map(m => ({
          userId: String(m.user_id),
          nickname: m.nickname,
          symbol: playerSymbols[String(m.user_id)]
        }));
      withSymbols.sort((a, b) => (a.symbol === 'X' ? -1 : 1) - (b.symbol === 'X' ? -1 : 1));
      return withSymbols.map(({ userId, nickname }) => ({ userId, nickname }));
    }
    return lobbyMembers.map(m => ({ userId: String(m.user_id), nickname: m.nickname }));
  }, [lobbyMembers, gameState]);

  const isMyTurn = useMemo(() => {
    if (!user || !gameState) return false;
    const cur = (gameState as any).current_turn_player_id;
    return String(cur) === String(user.id);
  }, [user, gameState]);

  const handleProposeMove = useCallback((move: any) => {
    if (!gameState) return;
    const board = (gameState as any).board;
    const dim = Array.isArray(board) ? (Array.isArray(board[0]) ? board.length : Math.max(1, Math.floor(Math.sqrt(board.length)))) : 3;
    const index = typeof move?.index === 'number' ? move.index : (typeof move?.position === 'number' ? move.position : undefined);
    if (typeof index !== 'number') return;
    const row = Math.floor(index / dim);
    const col = index % dim;
    emitMakeMove({ row, col });
  }, [gameState]);

  const module = TicTacToeModule;

  return (
    <main className="w-full max-w-screen-lg mx-auto py-8 px-10 sm:px-20">
      <GameShell
        module={module}
        state={gameState ?? { board: Array(9).fill(null), current_turn_player_id: user?.id ? String(user.id) : undefined }}
        players={players}
        localPlayerId={String(user?.id ?? '')}
        lastMove={lastMove}
        isMyTurn={isMyTurn}
        onProposeMove={handleProposeMove}
      />
    </main>
  );
};

export default LobbyGameScreen;
