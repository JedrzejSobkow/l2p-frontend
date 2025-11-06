import React from 'react';
import Modal from './Modal';

interface Game {
    gameName: string;
    src: string;
    supportedPlayers: number[];
}

interface CatalogueModalProps {
    isOpen: boolean;
    games: Game[];
    currentPlayerCount: number;
    onClose: () => void;
}

const CatalogueModal: React.FC<CatalogueModalProps> = ({ isOpen, games, currentPlayerCount, onClose }) => {
    const isGameAvailable = (supportedPlayers: number[]) => {
        return supportedPlayers.includes(currentPlayerCount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto flex flex-col"
                style={{
                    outline: '2px solid var(--color-highlight)',
                }}
            >
                <h2 className="text-highlight text-xl font-bold mb-4">Game Catalogue</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow overflow-y-auto">
                    {games.map((gameItem, index) => {
                        const isAvailable = isGameAvailable(gameItem.supportedPlayers);
                        return (
                            <div
                                key={index}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer transition-transform ${
                                    isAvailable
                                        ? 'bg-background-secondary hover:bg-background-primary hover:scale-105'
                                        : 'bg-gray-600 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <img
                                    src={gameItem.src}
                                    alt={gameItem.gameName}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <span className="text-sm font-medium text-headline text-center">
                                    {gameItem.gameName}
                                </span>
                                <span className="text-xs text-paragraph">
                                    {gameItem.supportedPlayers.join(', ')} player{gameItem.supportedPlayers.length > 1 ? 's' : ''}
                                </span>
                                {!isAvailable && (
                                    <span className="text-xs text-red-400 font-semibold">
                                        Not available
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center mt-4 pt-4">
                    <button
                        onClick={onClose}
                        className="bg-highlight text-white px-4 py-2 rounded hover:scale-105 transition-transform"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CatalogueModal;
