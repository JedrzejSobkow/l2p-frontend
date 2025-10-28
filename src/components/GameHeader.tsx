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
        <div className="game-header flex flex-wrap w-full py-4 gap-4 items-center sm:flex-nowrap"> 
            <div className="game-header-icon w-full sm:w-auto flex justify-center sm:mr-4">
                <img src={path} alt={`${title} icon`} style={{ maxWidth: '150px', maxHeight: '150px' }} />
            </div>
            <div className="bg-background-secondary w-full h-auto p-6 rounded-lg flex flex-wrap items-center justify-center gap-4 sm:justify-between text-center mx-auto flex-col sm:flex-row min-w-[290px]">
                <div className="game-header-details max-w-[250px] mx-auto">
                    <h1 className="game-header-title text-3xl font-bold text-headline">{title}</h1>
                    <p className="game-header-info text-paragraph">
                        Minimum number of players: {minPlayers}<br />
                        Maximum number of players: {maxPlayers}<br />
                        Estimated playtime: {estimatedPlaytime}
                    </p>
                </div>
                <div className="game-header-actions mt-4 sm:mt-0 flex flex-wrap gap-3 justify-center mx-auto">
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
