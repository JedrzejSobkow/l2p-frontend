import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GameShell from "../components/games/GameShell";
import TicTacToeModule from "../components/games/ticTacToe/module";
import { useAuth } from "../components/AuthContext";
import { useLobby } from "../components/lobby/LobbyContext";
import LobbyChat from "../components/LobbyChat";
import InGameUserTile from "../components/InGameUserTile";
import GameResultModal from "../components/GameResultModal";
import KickPlayerModal from "../components/KickPlayerModal";
import LeaveModal from "../components/LeaveModal";
import { emitMakeMove } from "../services/game";
import { onKickedFromLobby, offKickedFromLobby } from "../services/lobby";
import { FaSignOutAlt } from "react-icons/fa";
import { getImage } from "../utils/imageMap";
import { pfpImage } from "@/assets/images";
import ClobberModule from "@/components/games/clobber/module";
import LudoModule from "@/components/games/ludo/module";

const LobbyInGameScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showPopup } = usePopup()
  const { gameState, members, currentLobby, messages, sendMessage, transferHost, kickMember, leaveLobby,} = useLobby();

  // Redirect user to home if they are not in a lobby
  useEffect(() => {
    if (!currentLobby) {
      navigate('/');
      showPopup({ message: 'You are not in a lobby.', type: 'error' });
    }
  }, [currentLobby, navigate]);

  const [lastMove, setLastMove] = useState<{ index: number } | undefined>(
    undefined
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [result, setResult] = useState<"win" | "draw">("draw");
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPassHostModalOpen, setIsPassHostModalOpen] = useState(false);
  const [passHostUsername, setPassHostUsername] = useState('');

  // Map game names to their respective modules
  const gameModules: Record<string, any> = {
    tictactoe: TicTacToeModule,
    clobber: ClobberModule,
    ludo: LudoModule,
  };


  useEffect(() => {
    if (gameState) {
      const lm = gameState?.last_move;
      if (
        lm &&
        typeof lm.row === "number" &&
        typeof lm.col === "number" &&
        Array.isArray(gameState?.board)
      ) {
        const dim = Array.isArray(gameState.board[0])
          ? gameState.board.length
          : Math.max(
              1,
              Math.floor(Math.sqrt((gameState.board as any[]).length))
            );
        setLastMove({ index: lm.row * dim + lm.col });
      } else {
        setLastMove(undefined);
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState?.result === "draw") {
      setResult("draw");
      setWinnerName(null);
      setIsModalOpen(true);
    } else if (gameState?.winner_identifier) {
      const winner = members.find((member) => String(member.identifier) === String(gameState.winner_identifier));
      setResult("win");
      setWinnerName(winner?.nickname ?? "Unknown player");
      setIsModalOpen(true);
    }
  }, [gameState, members]);

  const players = useMemo(() => {
    if (!members || members.length === 0) return [];
    const playerSymbols: Record<string, string> | undefined =
      gameState?.player_symbols;
    if (playerSymbols) {
      const withSymbols = members
        .filter(m => String(m.identifier) in playerSymbols)
        .map(m => ({
          userId: String(m.identifier),
          nickname: m.nickname,
          symbol: playerSymbols[String(m.identifier)],
          timeRemaining: gameState?.timing?.player_time_remaining?.[String(m.identifier)] ?? null,
        }));
      withSymbols.sort(
        (a, b) => (a.symbol === "X" ? -1 : 1) - (b.symbol === "X" ? -1 : 1)
      );
      return withSymbols.map(({ userId, nickname, timeRemaining }) => ({
        userId,
        nickname,
        timeRemaining,
      }));
    }
    return members.map(m => ({
      userId: String(m.identifier),
      nickname: m.nickname,
      timeRemaining: gameState?.timing?.player_time_remaining?.[String(m.identifier)] ?? null,
    }));
  }, [members, gameState]);

  const isMyTurn = useMemo(() => {
    if (!user || !gameState) return false;
    const cur = (gameState as any).current_turn_identifier;
    return String(cur) === String(user.id);
  }, [user, gameState]);

  const handleProposeMove = useCallback((moveData: any) => {
    emitMakeMove(moveData);
  }, []);

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      sendMessage(message); // Use sendMessage from LobbyContext
    }
  };

  const handlePassHost = (userId: number | string) => {
    const targetMember = members.find(m => String(m.identifier) === String(userId));
    if (targetMember) {
      setPassHostUsername(targetMember.nickname);
      setIsPassHostModalOpen(true);
    }
  };

  const confirmPassHost = () => {
    const targetMember = members.find(m => m.nickname === passHostUsername);
    if (targetMember) {
      transferHost(targetMember.identifier);
    }
    setIsPassHostModalOpen(false);
    setPassHostUsername('');
  };

  const handleKickOut = (username: string) => {
    setKickTarget(username);
    setIsKickModalOpen(true);
  };

  const confirmKickOut = () => {
    const targetMember = members.find((m) => m.nickname === kickTarget);
    if (targetMember) {
      kickMember(targetMember.identifier);
    }
    setIsKickModalOpen(false);
    setKickTarget(null);
  };

  const handleConfirmLeave = () => {
    leaveLobby();
  };

  // Dynamically select the module based on the selected game
  const module = useMemo(() => {
    if (!currentLobby?.selected_game) {
      return null; // Fallback if no game is selected
    }
    return gameModules[currentLobby.selected_game] || null; // Use the mapped module or fallback
  }, [currentLobby?.selected_game]);

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
            localPlayerId={String(user?.id ?? "")}
            lastMove={lastMove}
            isMyTurn={isMyTurn}
            onProposeMove={handleProposeMove}
          />
        </div>
        <div className="w-full lg:w-1/3 bg-background-secondary rounded-lg shadow-md p-3 px-10 sm:p-4 my-10">
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">
            Players
          </h3>
          <div className="flex flex-col gap-2">
            {members.map((member, index) => (
              <InGameUserTile
                key={member.identifier}
                avatar={
                  getImage(
                    "avatars",
                    "avatar" + member.pfp_path?.split("/").pop()?.split(".")[0]
                  ) || pfpImage
                }
                username={member.nickname}
                place={index + 1}
                isHost={currentLobby?.host_identifier === member.identifier}
                displayPassHost={currentLobby?.host_identifier === user?.id && user?.id !== member.identifier}
                displayKickOut={currentLobby?.host_identifier === user?.id && user?.id !== member.identifier}
                isYou={String(user?.id) === String(member.identifier)}
                isCurrentTurn={String(gameState?.current_turn_identifier) === String(member.identifier)}
                timeRemaining={players.find(p => p.userId === String(member.identifier))?.timeRemaining ?? null}
                onPassHost={() => handlePassHost(member.identifier)}
                onKickOut={() => handleKickOut(member.nickname)}
              />
            ))}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-4 mb-2">
            Chat
          </h3>
          <LobbyChat
            messages={messages.map((m) => ({
              username: m.nickname,
              text: m.content,
            }))}
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
      <PassHostModal
        username={passHostUsername}
        isOpen={isPassHostModalOpen}
        onConfirm={confirmPassHost}
        onCancel={() => setIsPassHostModalOpen(false)}
      />
      <KickPlayerModal
        isOpen={isKickModalOpen}
        username={kickTarget || ""}
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
