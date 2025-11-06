import React from 'react';

interface InviteToLobbyUserTileProps {
  onInviteClick?: () => void;
}

const InviteToLobbyUserTile: React.FC<InviteToLobbyUserTileProps> = ({ onInviteClick }) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-background-tertiary shadow-md border border-dashed border-gray-500">
      {/* Left Side: Empty Seat Text */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-400">Empty seat</span>
      </div>

      {/* Right Side: Invite Button */}
      <button
        onClick={onInviteClick}
        className="px-4 py-2 bg-highlight text-white font-bold rounded-lg focus:outline-none"
      >
        Invite
      </button>
    </div>
  );
};

export default InviteToLobbyUserTile;
