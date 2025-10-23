import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

interface GameTileProps {
    gameName: string;
    imageSrc: string;
    description: string;
    onClick?: () => void;
}

const GameTile: React.FC<GameTileProps> = ({ gameName, imageSrc, description, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="flex flex-col md:flex-row items-center gap-8 p-4 rounded-2xl bg-background-secondary shadow-md border-2 border-highlight cursor-pointer hover:shadow-lg hover:bg-background-primary hover:scale-105 transition-transform transition-shadow"
        >
            {/* Game Image and Game Name */}
            <div className="w-32 flex-shrink-0 flex flex-col items-center">
                <img src={imageSrc} alt={gameName} className="w-full h-full rounded-lg object-cover" />
                <span className="text-sm font-medium text-headline mt-2 text-center">{gameName}</span>
            </div>
            <div className="flex-1 p-4">
                <p className="text-sm text-paragraph">{description}</p>
            </div>
            <div className="flex items-center justify-center text-highlight">
                <FaAngleRight size={40} />
            </div>
        </div>
    );
};

export default GameTile;
