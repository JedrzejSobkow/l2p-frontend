import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../components/games/GameShell';
import TicTacToeModule from '../components/games/ticTacToe/module';
import { useAuth } from '../components/AuthContext';
import { useLobby } from '../components/lobby/LobbyContext';
import LobbyChat from '../components/LobbyChat';
import InGameUserTile from '../components/InGameUserTile';
import GameResultModal from '../components/GameResultModal';
import KickPlayerModal from '../components/KickPlayerModal';
import LeaveModal from '../components/LeaveModal';
import { emitMakeMove, emitGetGameState, onMoveMade, offMoveMade, onGameEnded, offGameEnded, onGameState, offGameState } from '../services/game';
import { onKickedFromLobby, offKickedFromLobby } from '../services/lobby';
import { FaSignOutAlt } from 'react-icons/fa';
import { getImage } from '../utils/imageMap';

const LobbyInGameScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameState, members, currentLobby, setGameState, messages, sendMessage, transferHost, kickMember, leaveLobby, clearError, error } = useLobby();

  // Redirect user to home if they are not in a lobby
  useEffect(() => {
    if (!currentLobby) {
      navigate('/', { state: { message: 'You are not in a lobby.', type: 'error' } });
    }
  }, [currentLobby, navigate]);

  const [lastMove, setLastMove] = useState<{ index: number } | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [result, setResult] = useState<"win" | "draw">("draw");
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  useEffect(() => {
    if (error?.error_code === 'KICKED') {
      clearError();
      navigate('/', { state: { message: 'You have been kicked from the game', type: 'error' } });
    }
  }, [error, navigate, clearError]);

  useEffect(() => {
    const handleKickedFromLobby = (data: { lobby_code: string; message: string }) => {
      console.log('Kicked from lobby:', data);
      navigate('/', { state: { message: data.message || 'You have been kicked from the game', type: 'error' } });
    };

    onKickedFromLobby(handleKickedFromLobby);
    return () => {
      offKickedFromLobby(handleKickedFromLobby);
    };
  }, [navigate]);

  useEffect(() => {
    // Emit get_game_state on page load
    // emitGetGameState();

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
    };

    onGameEnded(handleGameEnded);
    return () => {
      offGameEnded(handleGameEnded);
    };
  }, [setGameState]);

  useEffect(() => {
    const handleGameState = (data: { game_state: any }) => {
      console.log('Game state event received in GAME:', data);
      setGameState(data.game_state); // Update the game state in the context
        console.log(gameState)
    //   if (data.game_state.result !== 'in_progress') {
    //     navigate('/lobby'); // Redirect to lobby if the game is not in progress
    //   }
    };

    onGameState(handleGameState); // Listen for the game_state event
    return () => {
      offGameState(handleGameState); // Clean up the listener
    };
  }, [setGameState, navigate, gameState]);

  useEffect(() => {
    if (gameState?.result === "draw") {
      setResult("draw");
      setWinnerName(null);
      setIsModalOpen(true);
    } else if (gameState?.winner_id) {
      const winner = members.find((member) => String(member.user_id) === String(gameState.winner_id));
      setResult("win");
      setWinnerName(winner?.nickname ?? "Unknown player");
      setIsModalOpen(true);
    }
  }, [gameState, members]);

  const players = useMemo(() => {
    if (!members || members.length === 0) return [];
    const playerSymbols: Record<string, string> | undefined = gameState?.player_symbols;
    if (playerSymbols) {
      const withSymbols = members
        .filter(m => String(m.user_id) in playerSymbols)
        .map(m => ({
          userId: String(m.user_id),
          nickname: m.nickname,
          symbol: playerSymbols[String(m.user_id)],
          timeRemaining: gameState?.timing?.player_time_remaining?.[String(m.user_id)] ?? null,
        }));
      withSymbols.sort((a, b) => (a.symbol === 'X' ? -1 : 1) - (b.symbol === 'X' ? -1 : 1));
      return withSymbols.map(({ userId, nickname, timeRemaining }) => ({ userId, nickname, timeRemaining }));
    }
    return members.map(m => ({
      userId: String(m.user_id),
      nickname: m.nickname,
      timeRemaining: gameState?.timing?.player_time_remaining?.[String(m.user_id)] ?? null,
    }));
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

  const handlePassHost = (userId: number | string) => {
    transferHost(userId);
  };

  const handleKickOut = (username: string) => {
    setKickTarget(username);
    setIsKickModalOpen(true);
  };

  const confirmKickOut = () => {
    const targetMember = members.find(m => m.nickname === kickTarget);
    if (targetMember) {
      kickMember(targetMember.user_id);
    }
    setIsKickModalOpen(false);
    setKickTarget(null);
  };

  const handleConfirmLeave = () => {
    leaveLobby();
    navigate('/');
  };

  const module = TicTacToeModule;

  if (!gameState) {
    return <div>Loading game state...</div>; // Show a loading state until gameState is available
  }

  return (
    <div className="w-full">
      {/* Top Bar with Leave Button */}
      <div className="flex justify-start px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-red-700 hover:scale-105 transition-transform focus:outline-none"
        >
          <FaSignOutAlt size={20} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <GameShell
            module={module}
            state={gameState} // Use the updated gameState directly
            players={players}
            localPlayerId={String(user?.id ?? '')}
            lastMove={lastMove}
            isMyTurn={isMyTurn}
            onProposeMove={handleProposeMove}
          />
        </div>
        <div className="w-full lg:w-1/3 bg-background-secondary rounded-lg shadow-md p-3 px-10 sm:p-4 my-10">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">Players</h3>
          <div className="flex flex-col gap-2">
            {members.map((member, index) => (
              <InGameUserTile
                key={member.user_id}
                avatar={
                  getImage('avatars', 'avatar' + member.pfp_path?.split('/').pop()?.split('.')[0]) || 'avatar'
                }
                username={member.nickname}
                place={index + 1}
                isHost={currentLobby?.host_id === member.user_id}
                displayPassHost={currentLobby?.host_id === user?.id && user?.id !== member.user_id}
                displayKickOut={currentLobby?.host_id === user?.id && user?.id !== member.user_id}
                isYou={String(user?.id) === String(member.user_id)}
                isCurrentTurn={String(gameState?.current_turn_player_id) === String(member.user_id)}
                timeRemaining={players.find(p => p.userId === String(member.user_id))?.timeRemaining ?? null}
                onPassHost={() => handlePassHost(member.user_id)}
                onKickOut={() => handleKickOut(member.nickname)}
              />
            ))}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-4 mb-2">Chat</h3>
          <LobbyChat 
            messages={messages.map(m => ({ username: m.nickname, text: m.content }))}
            onSendMessage={handleSendMessage}
            typingUsers={[]} // Typing indicator can be added if needed
          />
        </div>
      </div>
      <GameResultModal
        isOpen={isModalOpen}
        winnerName={winnerName}
        result={result}
        onReturnToLobby={() => navigate("/lobby")}
      />
      <KickPlayerModal
        isOpen={isKickModalOpen}
        username={kickTarget || ''}
        onConfirm={confirmKickOut}
        onCancel={() => setIsKickModalOpen(false)}
      />
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onConfirm={handleConfirmLeave}
        onCancel={() => setIsLeaveModalOpen(false)}
      />
    </div>
  );
};

export default LobbyInGameScreen;
