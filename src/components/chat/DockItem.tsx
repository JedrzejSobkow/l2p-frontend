import { useMemo } from 'react';
import { useFriends } from '../friends/FriendsContext';
import { useChat } from './ChatProvider';
import { useChatDock } from './ChatDockContext';
import ChatWindow from './ChatWindow';
import { FiMinus, FiX, FiLoader } from 'react-icons/fi';
import { pfpImage } from '@assets/images';

type DockItemProps = {
  userId: string;
  minimized: boolean;
};

export const DockItem = ({ userId, minimized }: DockItemProps) => {
  const { friendsById, isLoading: friendsLoading } = useFriends();
  const { getMessages, getHasMore, getTyping, sendMessage, sendTyping, loadMoreMessages, getUnread } = useChat();
  const { minimizeChat, closeChat } = useChatDock();

  const userData = useMemo(() => {
    if (friendsById[userId]) {
      return {
        id: userId,
        nickname: friendsById[userId].nickname,
        avatarUrl: friendsById[userId].avatarUrl,
        status: friendsById[userId].userStatus,
        isOnline: friendsById[userId].userStatus === 'online'
      };
    }
    return null;
  }, [userId, friendsById,]);

  if (!userData) {
    if (friendsLoading) {
      if (minimized) {
        return (
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-white/10">
             <div className="h-8 w-8 rounded-full bg-white/10" />
          </div>
        );
      }
      return (
        <div className="flex w-[340px] flex-col overflow-hidden rounded-t-xl border border-white/10 bg-background-secondary h-[400px] animate-pulse">
           <div className="h-10 bg-white/5 border-b border-white/5" />
           <div className="flex-1 bg-white/5 opacity-50 flex items-center justify-center">
              <FiLoader className="animate-spin text-white/20" />
           </div>
        </div>
      );
    }
    return null; 
  }

  if (minimized) {
    const unread = getUnread(userData.id) || 0;
    return (
      <button
        key={userData.id}
        onClick={() => minimizeChat(userData.id, false)}
        className="relative flex h-12 items-center gap-3 rounded-l-full border-y border-l border-white/10 bg-background-secondary pl-1 pr-4 shadow-lg transition-all hover:bg-[rgba(36,35,50,0.95)]"
        >
        {/* Avatar Bubble */}
        <div className="relative flex-shrink-0">
            <img
            src={userData.avatarUrl || pfpImage}
            alt={userData.nickname}
            className="h-10 w-10 rounded-full border-2 border-background-secondary object-cover"
            />
            {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-button text-[10px] font-bold text-headline shadow-sm">
                {unread > 9 ? '9+' : unread}
            </span>
            )}
        </div>

        <div className="w-0 overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-20 group-hover:opacity-100">
            <span className="block truncate text-left text-sm font-medium text-white pr-2">
            {userData.nickname}
            </span>
        </div>
        </button>
    );
  }

  return (
    <div className="pointer-events-auto flex w-[340px] flex-col overflow-hidden rounded-t-xl border border-white/10 bg-background-secondary shadow-2xl">
      <div 
        className="flex h-10 items-center justify-between bg-white/5 px-3 py-1 backdrop-blur-md cursor-pointer transition hover:bg-white/10"
        onClick={() => minimizeChat(userId, true)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`h-2 w-2 rounded-full ${userData.isOnline ? 'bg-green-500' : 'bg-white/30'}`} />
          <span className="truncate text-sm font-bold text-white/90">{userData.nickname}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                minimizeChat(userId, true); 
            }} 
            className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <FiMinus className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { 
                    e.stopPropagation(); 
                    closeChat(userId); 
                }} 
            className="rounded p-1 text-white/50 hover:bg-red-500/20 hover:text-red-400">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-[400px] bg-[rgba(21,20,34,0.95)]">
        <ChatWindow
          messages={getMessages(userId)}
          friendData={userData}
          hasMore={getHasMore(userId) ?? true}
          isTyping={getTyping(userId)}
          onSend={async (payload) => sendMessage(userId, payload)}
          onTyping={() => sendTyping(userId)}
          onLoadMore={() => loadMoreMessages(userId)}
          className="h-full rounded-none border-0"
        />
      </div>
    </div>
  );
};