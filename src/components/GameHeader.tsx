import React from 'react';
import { FaLink, FaPlus } from 'react-icons/fa';

interface GameHeaderProps {
    title: string;
    minPlayers: number;
    maxPlayers: number;
    estimatedPlaytime: string;
    path: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, minPlayers, maxPlayers, estimatedPlaytime, path }) => {
    return (
        <div className="game-header flex items-center w-full p-4 gap-4"> 
            <div className="game-header-icon mr-4">
                <img src={path} alt={`${title} icon`} style={{ maxWidth: '150px', maxHeight: '150px' }} />
            </div>
            <div className="bg-background-secondary w-full h-[150px] p-6 rounded-lg flex items-center justify-between ">
                <div className="game-header-details">
                    <h1 className="game-header-title text-3xl font-bold text-headline">{title}</h1>
                    <p className="game-header-info text-paragraph">
                        Minimum number of players: {minPlayers}<br />
                        Maximum number of players: {maxPlayers}<br />
                        Estimated playtime: {estimatedPlaytime}
                    </p>
                </div>
                <div className="game-header-actions ml-auto flex gap-3 justify-center">
                    <button className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15">
                        <FaLink /> Join
                    </button>
                    <button className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15">
                        <FaPlus /> New Lobby
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;
