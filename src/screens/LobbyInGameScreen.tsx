import { useEffect, useMemo, useState, useCallback } from 'react';
import GameShell from '../components/games/GameShell';
import TicTacToeModule from '../components/games/ticTacToe/module';
import { useAuth } from '../components/AuthContext';
import { useLobby } from '../components/lobby/LobbyContext';
import LobbyChat from '../components/LobbyChat'; // Import LobbyChat
import { emitMakeMove, onMoveMade, offMoveMade, onGameEnded, offGameEnded } from '../services/game';
// import { useNavigate } from 'react-router-dom';

const LobbyInGameScreen = () => {
  const { user } = useAuth();
  const { gameState, members, setGameState, messages, sendMessage } = useLobby(); // Access messages and sendMessage
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

  useEffect(() => {
    const handleGameEnded = (data: { result: string; winner_id: number | null; game_state: any }) => {
      console.log('Game ended event received:', data);
      setGameState(data.game_state); // Update the final game state
    //   navigate('/lobby-test'); // Redirect to the lobby
    };

    onGameEnded(handleGameEnded);
    return () => {
      offGameEnded(handleGameEnded);
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

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendMessage(message); // Use sendMessage from LobbyContext
    }
  };

  const module = TicTacToeModule;

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
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
        <div className="w-full lg:w-1/3 bg-background-secondary rounded-lg shadow-md p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">Chat</h3>
          <LobbyChat 
            messages={messages.map(m => ({ username: m.nickname, text: m.content }))}
            onSendMessage={handleSendMessage}
            typingUsers={[]} // Typing indicator can be added if needed
          />
        </div>
      </div>
    </div>
  );
};

export default LobbyInGameScreen;
