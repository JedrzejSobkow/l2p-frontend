import React from 'react';
import Modal from './Modal';
import { MdClear } from 'react-icons/md';
import { getImage } from '../utils/imageMap';
import { noGameImage } from '@/assets/images';


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
    onClearGameSelection?: () => void;
    isUserHost?: boolean;
    selectedGameName?: string;
}

const CatalogueModal: React.FC<CatalogueModalProps> = ({ 
    isOpen, 
    games, 
    currentPlayerCount, 
    onClose,
    onSelectGame,
    onClearGameSelection,
    isUserHost = false,
    selectedGameName = undefined
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

    const handleClearClick = () => {
        if (isUserHost && onClearGameSelection) {
            onClearGameSelection();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center justify-center w-full">
                <div
                    className="bg-background p-4 sm:p-6 rounded-lg shadow-lg w-[95%] sm:w-full max-w-4xl max-h-[80vh] overflow-y-auto flex flex-col"
                    style={{
                        outline: '2px solid var(--color-highlight)',
                    }}
                >
                    <h2 className="text-highlight text-xl font-bold mb-4">Game Catalogue</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow overflow-visible p-2">
                        {/* Clear Game Selection Tile */}
                        <div
                            onClick={handleClearClick}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-transform ${
                                isUserHost
                                    ? 'bg-background-secondary border-2 border-dashed border-red-500 hover:border-red-400 hover:bg-red-500/10 hover:scale-105 cursor-pointer'
                                    : 'bg-gray-600 opacity-50 cursor-not-allowed border-2 border-dashed border-gray-500'
                            }`}
                        >
                            <MdClear className="text-4xl text-red-400" />
                            <span className="text-sm font-semibold text-red-400 text-center">
                                Clear Selection
                            </span>
                            {!isUserHost && (
                                <span className="text-xs text-gray-400 font-semibold">
                                    (Host only)
                                </span>
                            )}
                        </div>

                        {/* Game Tiles */}
                        {games.map((gameItem, index) => {
                            const isAvailable = isGameAvailable(gameItem.supportedPlayers);
                            const canSelect = isAvailable && isUserHost;
                            const isSelected = selectedGameName === gameItem.gameName;
                            
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleGameClick(gameItem.gameName, isAvailable)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                                        isSelected
                                            ? 'bg-background-secondary border-2 border-highlight ring-2 ring-highlight scale-105'
                                            : canSelect
                                            ? 'bg-background-secondary hover:bg-background-primary hover:scale-105 cursor-pointer'
                                            : isAvailable
                                            ? 'bg-background-secondary opacity-75 cursor-not-allowed'
                                            : 'bg-gray-600 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <img
                                        src={getImage('games', gameItem.gameName) || noGameImage}
                                        alt={gameItem.gameDisplayName}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <span className="text-sm font-medium text-headline text-center">
                                        {gameItem.gameDisplayName}
                                    </span>
                                    <span className="text-xs text-paragraph">
                                        {gameItem.supportedPlayers.join(', ')} player{gameItem.supportedPlayers.length > 1 ? 's' : ''}
                                    </span>
                                    {isSelected && (
                                        <span className="text-xs text-highlight font-bold">
                                            Selected
                                        </span>
                                    )}
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
            </div>
        </Modal>
    );
};

export default CatalogueModal;
