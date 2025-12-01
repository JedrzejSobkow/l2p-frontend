import React from "react";
import Modal from "./Modal";

interface GameResultModalProps {
  isOpen: boolean;
  winnerName: string | null;
  result: "win" | "draw";
  onReturnToLobby: () => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  winnerName,
  result,
  onReturnToLobby,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onReturnToLobby}>
      <div
        className="bg-background p-6 rounded-lg shadow-lg text-center mx-4 sm:mx-0"
        style={{
          outline: "2px solid var(--color-highlight)",
        }}
      >
        <h2 className="text-highlight text-xl font-bold mb-4">
          {result === "win" ? `${winnerName} wins!` : "It's a draw!"}
        </h2>
        <p className="text-paragraph mb-4">
          {result === "win"
            ? `${winnerName} has won the game.`
            : "The game ended in a draw."}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onReturnToLobby}
            className="bg-highlight text-white px-4 py-2 rounded hover:scale-105 transition-transform"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GameResultModal;
