import React from 'react';
import { FaCrown, FaUserTimes } from 'react-icons/fa';
import { LuCrown } from 'react-icons/lu';

interface InLobbyUserTileProps {
  avatar: string;
  username: string;
  place: number;
  isReady: boolean;
  isHost: boolean;
  displayPassHost: boolean;
  displayKickOut: boolean;
  isYou: boolean;
  onCrownClick?: () => void;
  onKickClick?: () => void;
}

const InLobbyUserTile: React.FC<InLobbyUserTileProps> = ({ avatar, username, place, isReady, isHost, displayPassHost, displayKickOut, isYou, onCrownClick, onKickClick }) => {

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 rounded-lg bg-background-tertiary shadow-md ${
        isReady ? 'border border-2 border-green-500' : 'border border-2 border-red-500'
      }`}
    >
      {/* Left Side: Place and Avatar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-500">{place}.</span>
        <div className="relative w-12 h-12">
          {isHost && (
            <FaCrown className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-yellow-500" size={24} />
          )}
          <img
            src={avatar}
            alt={`${username}'s avatar`}
            className="w-full h-full rounded-full"
          />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-medium text-headline text-ellipsis overflow-hidden whitespace-nowrap ${isYou ? 'underline' : ''}`}>
            {username}
          </span>
        </div>
      </div>

      {/* Right Side: Buttons */}
      <div className="flex flex-col items-end gap-2">
        {displayPassHost && (
          <button onClick={onCrownClick} className="focus:outline-none">
            <LuCrown className="text-highlight" size={20} />
          </button>
        )}
        {displayKickOut && (
          <button onClick={onKickClick} className="focus:outline-none">
            <FaUserTimes className="text-highlight" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InLobbyUserTile;
