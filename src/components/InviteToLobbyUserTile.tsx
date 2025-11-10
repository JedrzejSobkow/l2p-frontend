import React from 'react';

interface InviteToLobbyUserTileProps {
  onInviteClick?: () => void;
  enabled?: boolean;
}

const InviteToLobbyUserTile: React.FC<InviteToLobbyUserTileProps> = ({ onInviteClick, enabled = true }) => {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-lg shadow-md border border-dashed ${
      enabled 
        ? 'bg-background-tertiary border-gray-500' 
        : 'bg-background-tertiary/50 border-gray-700'
    }`}>
      {/* Left Side: Empty Seat Text */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${enabled ? 'text-gray-400' : 'text-gray-600'}`}>
          Empty seat
        </span>
      </div>

      {/* Right Side: Invite Button */}
      <button
        onClick={onInviteClick}
        disabled={!enabled}
        className={`px-4 py-2 font-bold rounded-lg focus:outline-none transition-all ${
          enabled
            ? 'bg-highlight text-white hover:bg-highlight/90 cursor-pointer'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
        }`}
      >
        Invite
      </button>
    </div>
  );
};

export default InviteToLobbyUserTile;
