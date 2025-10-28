import React from 'react';
import { FaCrown } from 'react-icons/fa';

interface InLobbyUserTileProps {
  avatar: string;
  username: string;
  status: 'ready' | 'not_ready';
  place: number;
  isReady: boolean;
  isHost: boolean;
  isMe: boolean;
}

const InLobbyUserTile: React.FC<InLobbyUserTileProps> = ({ avatar, username, status, place, isReady, isHost, isMe }) => {
  const statusColors = {
    ready: 'text-green-500',
    not_ready: 'text-red-500',
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg bg-background-secondary shadow-md max-w-[250px] ${
        isReady ? 'border border-2 border-green-500' : 'border border-2 border-red-500'
      }`}
    >
      {/* Place */}
      <span className="text-sm font-bold text-gray-500">{place}.</span>
      {/* Avatar with Crown */}
      <div className="relative w-12 h-12">
        {isHost && (
          <FaCrown className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-yellow-500" size={16} />
        )}
        <img
          src={avatar}
          alt={`${username}'s avatar`}
          className="w-full h-full rounded-full"
        />
      </div>
      {/* User Info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-headline">
          {username}
        </span>
      </div>
    </div>
  );
};

export default InLobbyUserTile;
