import React from 'react';

interface LobbyShortTileProps {
    title: string;
    occupiedSlots: number;
    totalSlots: number;
    creator: string;
    timeAgo: string;
    profileImagePath: string;
}

const LobbyTile: React.FC<LobbyShortTileProps> = ({ title, occupiedSlots, totalSlots, creator, timeAgo, profileImagePath }) => {
    return (
        <div className="bg-background-tertiary p-4 rounded-lg shadow-md text-white flex items-center">
            <img 
                src={profileImagePath} 
                alt={`${creator}'s profile`} 
                className="w-16 h-16 rounded-full mr-4" 
            />
            <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-sm">slots: {occupiedSlots}/{totalSlots}</p>
                <p className="text-sm">by: {creator}</p>
                <p className="text-xs text-gray-400">{timeAgo}</p>
            </div>
        </div>
    );
};

export default LobbyTile;
