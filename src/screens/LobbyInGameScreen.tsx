import { useEffect, useMemo, useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import TicTacToeModule from '../components/games/ticTacToe/module';
import { useAuth } from '../components/AuthContext';
import { useLobby } from '../components/lobby/LobbyContext';
import { emitMakeMove, onMoveMade, offMoveMade } from '../services/game';

const LobbyInGameScreen = () => {
  const { user } = useAuth();
  const { gameState, members, setGameState } = useLobby();
  const [lastMove, setLastMove] = useState<{ index: number } | undefined>(undefined);

  useEffect(() => {
    if (gameState) {
      const lm = gameState?.last_move;
      if (lm && typeof lm.row === 'number' && typeof lm.col === 'number' && Array.isArray(gameState?.board)) {
        const dim = Array.isArray(gameState.board[0])
          ? gameState.board.length
          : Math.max(1, Math.floor(Math.sqrt((gameState.board as any[]).length)));
        setLastMove({ index: lm.row * dim + lm.col });
      } else {
        setLastMove(undefined);
      }
    }
  }, [gameState]);

  useEffect(() => {
    const handleMoveMade = (data: { game_state: any }) => {
      console.log('Move made event received:', data);
      setGameState(data.game_state); // Update game state when a move is made
    };

    onMoveMade(handleMoveMade);
    return () => {
      offMoveMade(handleMoveMade);
    };
  }, [setGameState]);

  const players = useMemo(() => {
    if (!members || members.length === 0) return [];
    const playerSymbols: Record<string, string> | undefined = gameState?.player_symbols;
    if (playerSymbols) {
      const withSymbols = members
        .filter(m => String(m.user_id) in playerSymbols)
        .map(m => ({ userId: String(m.user_id), nickname: m.nickname, symbol: playerSymbols[String(m.user_id)] }));
      withSymbols.sort((a, b) => (a.symbol === 'X' ? -1 : 1) - (b.symbol === 'X' ? -1 : 1));
      return withSymbols.map(({ userId, nickname }) => ({ userId, nickname }));
    }
    return members.map(m => ({ userId: String(m.user_id), nickname: m.nickname }));
  }, [members, gameState]);

  const isMyTurn = useMemo(() => {
    //console("TURN")
    //console(user)
    //console(gameState)
    if (!user || !gameState) return false;
    const cur = (gameState as any).current_turn_player_id;
    return String(cur) === String(user.id);
  }, [user, gameState]);

  const handleProposeMove = useCallback((move: any) => {
    if (!gameState) return;
    const board = (gameState as any).board;
    const dim = Array.isArray(board)
      ? Array.isArray(board[0])
        ? board.length
        : Math.max(1, Math.floor(Math.sqrt(board.length)))
      : 3;
    const index = typeof move?.index === 'number' ? move.index : move?.position;
    if (typeof index !== 'number') return;
    const row = Math.floor(index / dim);
    const col = index % dim;
    emitMakeMove({ row, col });
  }, [gameState]);

  const module = TicTacToeModule;

  return (
    <div className="w-full">
      <GameShell
        module={module}
        state={gameState ?? { board: Array(9).fill(null), current_turn_player_id: user?.id ? String(user.id) : undefined }}
        players={players}
        localPlayerId={String(user?.id ?? '')}
        lastMove={lastMove}
        isMyTurn={isMyTurn}
        onProposeMove={handleProposeMove}
      />
    </div>
  );
};

export default LobbyInGameScreen;
