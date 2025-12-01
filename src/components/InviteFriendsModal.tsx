import React, { useState, useMemo } from 'react';
import { FiX, FiSearch, FiSend } from 'react-icons/fi';
import { useFriends } from './friends/FriendsContext';
import { pfpImage } from '@/assets/images';

type InviteFriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (friendId: string, lobbyCode: string) => void;
  lobbyCode: string;
};

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  lobbyCode,
}) => {
  const { friends, isLoading } = useFriends();
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Set<string | number>>(new Set());

  const filteredFriends = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return friends;
    return friends.filter((friend) =>
      friend.nickname.toLowerCase().includes(query)
    );
  }, [friends, searchTerm]);

  const handleInvite = (friendId: string, lobbyCode: string) => {
    onInvite(friendId, lobbyCode);
    setInvitedFriends((prev) => new Set(prev).add(friendId));
  };

  const handleClose = () => {
    setSearchTerm('');
    setInvitedFriends(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-2xl border border-separator bg-background-secondary p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Invite Friends</h2>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Lobby Code Info */}
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <p className="text-sm text-white/60">
            Lobby Code:{' '}
            <span className="font-bold text-white">
              {lobbyCode.slice(0, 3)}-{lobbyCode.slice(3)}
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-lg border border-transparent bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-orange-400/60 focus:bg-white/5"
          />
        </div>

        {/* Friends List */}
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading && (
            <p className="text-center text-sm text-white/60">Loading friends...</p>
          )}
          
          {!isLoading && filteredFriends.length === 0 && (
            <p className="text-center text-sm text-white/60">
              {searchTerm ? 'No friends found.' : 'No friends to invite.'}
            </p>
          )}

          {!isLoading &&
            filteredFriends.map((friend) => {
              const isInvited = invitedFriends.has(friend.id);
              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[rgba(31,30,43,0.95)] p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={friend.avatarUrl || pfpImage}
                      alt={friend.nickname}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {friend.nickname}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (lobbyCode)
                      handleInvite(friend.id, lobbyCode)
                    }}
                    disabled={isInvited}
                    className="flex items-center gap-2 rounded-full bg-button px-4 py-1.5 text-xs font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isInvited ? (
                      'Invited'
                    ) : (
                      <>
                        <FiSend size={14} />
                        Invite
                      </>
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
