import React from 'react';
import Modal from './Modal';

interface GameInfoModalProps {
    isOpen: boolean;
    gameName: string;
    gameRules: string;
    onClose: () => void;
}

const GameInfoModal: React.FC<GameInfoModalProps> = ({ isOpen, gameName, gameRules, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className="bg-background p-6 rounded-lg shadow-lg text-center max-w-md max-h-96 overflow-y-auto mx-4 sm:mx-0"
                style={{
                    outline: '2px solid var(--color-highlight)',
                }}
            >
                <h2 className="text-highlight text-xl font-bold mb-4">{gameName}</h2>
                <p className="text-paragraph mb-4">
                    {gameRules}
                </p>
                <button
                    onClick={onClose}
                    className="bg-highlight text-white px-4 py-2 rounded hover:scale-105 transition-transform"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default GameInfoModal;
