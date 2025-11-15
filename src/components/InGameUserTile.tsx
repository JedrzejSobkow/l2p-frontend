import React, { useRef, useEffect, useState } from 'react';
import { FaCrown, FaUserTimes } from 'react-icons/fa';
import { LuCrown } from 'react-icons/lu';

interface InGameUserTileProps {
  avatar: string;
  username: string;
  place: number;
  isHost: boolean;
  displayPassHost: boolean;
  displayKickOut: boolean;
  isYou: boolean;
  isCurrentTurn: boolean;
  onPassHost?: () => void;
  onKickOut?: () => void;
}

const InGameUserTile: React.FC<InGameUserTileProps> = ({
  avatar,
  username,
  place,
  isHost,
  displayPassHost,
  displayKickOut,
  isYou,
  isCurrentTurn,
  onPassHost,
  onKickOut,
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [username]);

  const truncateUsername = (name: string, maxLength: number = 10) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 1) + '...';
    }
    return name;
  };

  const displayUsername = isOverflowing ? truncateUsername(username) : username;

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 rounded-lg bg-background-tertiary shadow-md ${
        isCurrentTurn ? 'border border-2 border-yellow-500' : 'border border-2 border-gray-500'
      }`}
    >
      {/* Left Side: Place and Avatar */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-bold text-gray-500 flex-shrink-0">{place}.</span>
        <div className="relative w-12 h-12 flex-shrink-0">
          {isHost && (
            <FaCrown className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-yellow-500" size={24} />
          )}
          <img
            src={avatar}
            alt={`${username}'s avatar`}
            className="w-full h-full rounded-full"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            ref={textRef}
            className={`text-sm font-medium text-headline truncate ${isYou ? 'underline' : ''}`}
            title={username}
          >
            {displayUsername}
          </span>
        </div>
      </div>

      {/* Right Side: Buttons */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {displayPassHost && (
          <button
            onClick={onPassHost}
            className="focus:outline-none hover:scale-105 transition-transform cursor-pointer"
          >
            <LuCrown className="text-highlight" size={20} />
          </button>
        )}
        {displayKickOut && (
          <button
            onClick={onKickOut}
            className="focus:outline-none hover:scale-105 transition-transform cursor-pointer"
          >
            <FaUserTimes className="text-highlight" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default InGameUserTile;
