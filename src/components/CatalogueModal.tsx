import React from 'react';
import Modal from './Modal';

interface Game {
    gameDisplayName: string;
    gameName: string;
    src: string;
    supportedPlayers: number[];
}

interface CatalogueModalProps {
    isOpen: boolean;
    games: Game[];
    currentPlayerCount: number;
    onClose: () => void;
    onSelectGame?: (gameName: string) => void;
    isUserHost?: boolean;
}

const CatalogueModal: React.FC<CatalogueModalProps> = ({ 
    isOpen, 
    games, 
    currentPlayerCount, 
    onClose,
    onSelectGame,
    isUserHost = false
}) => {
    const isGameAvailable = (supportedPlayers: number[]) => {
        if (supportedPlayers.length === 0) return false
        const maxPlayers = Math.max(...supportedPlayers)
        return currentPlayerCount <= maxPlayers
    };

    const handleGameClick = (gameName: string, isAvailable: boolean) => {
        if (isAvailable && isUserHost && onSelectGame) {
            onSelectGame(gameName);
        }
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
                        const canSelect = isAvailable && isUserHost;
                        
                        return (
                            <div
                                key={index}
                                onClick={() => handleGameClick(gameItem.gameName, isAvailable)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-transform ${
                                    canSelect
                                        ? 'bg-background-secondary hover:bg-background-primary hover:scale-105 cursor-pointer'
                                        : isAvailable
                                        ? 'bg-background-secondary opacity-75 cursor-not-allowed'
                                        : 'bg-gray-600 opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <img
                                    src={gameItem.src}
                                    alt={gameItem.gameDisplayName}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <span className="text-sm font-medium text-headline text-center">
                                    {gameItem.gameDisplayName}
                                </span>
                                <span className="text-xs text-paragraph">
                                    {gameItem.supportedPlayers.join(', ')} player{gameItem.supportedPlayers.length > 1 ? 's' : ''}
                                </span>
                                {!isAvailable && (
                                    <span className="text-xs text-red-400 font-semibold">
                                        Not available
                                    </span>
                                )}
                                {isAvailable && !isUserHost && (
                                    <span className="text-xs text-gray-400 font-semibold">
                                        (Host only)
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
