import { useEffect, useState } from 'react'
import { FiMinus, FiX } from 'react-icons/fi'
import ChatWindow from './ChatWindow'
import { useChatDock } from './ChatDockContext'
import { useAuth } from '../AuthContext'
import { useChat } from './ChatProvider'
import { useLocation } from 'react-router'
import { pfpImage } from '@assets/images'
import { useFriends } from '../friends/FriendsContext'

const getMaxVisibleWindows = () => {
  if (typeof window === 'undefined') return 1
  const width = window.innerWidth
  if (width < 1024) return 1 
  if (width < 1400) return 2
  return 3
}

const ChatDock = () => {
  const { sessions, minimizeChat, closeChat } = useChatDock()
  const { isAuthenticated } = useAuth()
  const chat = useChat()
  const {friendsById} = useFriends()
  const location = useLocation()
  
  const [maxVisible, setMaxVisible] = useState<number>(() => getMaxVisibleWindows())

  useEffect(() => {
    const handleResize = () => setMaxVisible(getMaxVisibleWindows())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) return null

  const openSessions = sessions.filter((s) => !s.minimized)
  const minimizedSessions = sessions.filter((s) => s.minimized)


  const visibleOpen = openSessions.slice(0, maxVisible)
  const overflow = openSessions.slice(maxVisible) 
  
  const allMinimized = [...minimizedSessions, ...overflow]

  const shouldHide = location.pathname.startsWith('/friends')
  if (shouldHide) return null

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-[30] hidden items-end gap-4 md:flex">
      <div className="flex items-end gap-3">
        {visibleOpen.map((s) => {
          const friend = friendsById[s.id]
          return (
          <div 
            key={s.id} 
            className="pointer-events-auto flex w-[340px] flex-col overflow-hidden rounded-t-xl border border-white/10 bg-background-secondary shadow-2xl"
          >
            <div 
              className="flex h-10 items-center justify-between bg-white/5 px-3 py-1 backdrop-blur-md cursor-pointer transition hover:bg-white/10"
              onClick={() => minimizeChat(s.id, true)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={friend.avatarUrl}
                  alt={friend.nickname}
                  className="h-9 w-9 rounded-full border border-white/10 object-cover"
                />
                <div className="flex items-center gap-2 overflow-hidden">
                <div className={`h-2 w-2 rounded-full ${friend.userStatus === 'online' ? 'bg-green-500' : friend.userStatus === 'offline' ? 'bg-white/30' : 'bg-button'}`} />
                <span className="truncate text-sm font-bold text-white/90">{friend.nickname}</span>
              </div>
              </div>
              
              
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); minimizeChat(friend.id, true); }}
                  className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); closeChat(friend.id); }}
                  className="rounded p-1 text-white/50 hover:bg-red-500/20 hover:text-red-400"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[400px] bg-[rgba(21,20,34,0.95)]">
              <ChatWindow
                messages={chat.getMessages(friend.id)}
                friendData={{
                  id: friend.id,
                  nickname: friend.nickname,
                  avatarUrl: friend.avatarUrl || ''
                }}
                hasMore={chat.getHasMore(friend.id) ?? true}
                isTyping={chat.getTyping(friend.id)}
                onSend={async ({ text, attachment }) => chat.sendMessage(friend.id, { text, attachment })}
                onTyping={chat.sendTyping}
                onLoadMore={() => chat.loadMoreMessages(friend.id)}
                className="h-full" 
              />
            </div>
          </div>
        )})}
      </div>
      {allMinimized.length > 0 && (
        <div className="group pointer-events-auto flex flex-col-reverse gap-2 pb-4 pl-4 items-end">
          {allMinimized.map((s) => {
            const friend = friendsById[s.id]
            const unread = chat.getUnread(friend.id)
            return (
              <button
                key={friend.id}
                onClick={() => minimizeChat(friend.id, false)}
                className="relative flex h-12 items-center gap-3 rounded-l-full border-y border-l border-white/10 bg-background-secondary pl-1 pr-4 shadow-lg transition-all hover:bg-[rgba(36,35,50,0.95)]"
              >
                {/* Avatar Bubble */}
                <div className="relative flex-shrink-0">
                  <img
                    src={friend.avatarUrl || pfpImage}
                    alt={friend.nickname}
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
                    {friend.nickname}
                  </span>
                </div>
              </button>
            )
          })}
          
        </div>
      )}
    </div>
  )
}

export default ChatDock