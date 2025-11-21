import { useEffect, useState } from 'react'
import { FiMinus, FiX } from 'react-icons/fi'
import ChatWindow from './ChatWindow'
import { useChatDock } from './ChatDockContext'
import { useAuth } from '../AuthContext'
import { useChat } from './ChatProvider'
import { useLocation } from 'react-router'

const getMaxVisibleWindows = () => {
  if (typeof window === 'undefined') return 1
  const width = window.innerWidth
  if (width < 890) return 1
  if (width < 1300) return 2
  return 3
}
import { pfpImage } from '@assets/images'

const ChatDock = () => {
  const { sessions, minimizeChat, closeChat } = useChatDock()
  const { isAuthenticated } = useAuth()
  const chat = useChat()

  const [maxVisible, setMaxVisible] = useState<number>(() => getMaxVisibleWindows())
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setMaxVisible(getMaxVisibleWindows())
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!isAuthenticated) {
    return null
  }

  const openSessions = sessions.filter((s) => !s.minimized)
  const baseMinimized = sessions.filter((s) => s.minimized)

  const overflowCount = Math.max(0, openSessions.length - maxVisible)
  const overflow = overflowCount > 0 ? openSessions.slice(0, overflowCount) : []
  const visibleOpen = overflowCount > 0 ? openSessions.slice(overflowCount) : openSessions
  const minimized = [...baseMinimized, ...overflow]

  return (
    <div className={"pointer-events-none fixed inset-x-0 bottom-0 z-[30] flex-row-reverse items-end gap-1 hidden" + (location.pathname.startsWith('/friends') ? " hidden" : " md:flex")}>
      <div
        className={
          (minimized.length > 0 ? 'pointer-events-auto' : 'pointer-events-none') +
          ' flex min-w-[180px] flex-col flex-wrap gap-2 pr-1 pb-1'
        }
      >
        {minimized.reverse().map((s) => {
          const unread = chat.getUnread?.(s.target.id) ?? 0
          return (
            <button
              key={s.target.id}
              onClick={() => minimizeChat(s.target.id, false)}
              className="flex items-center gap-2 rounded-full border text-headline border-white/15 bg-[rgba(21,20,34,0.98)] hover:border-white/30 hover:text-white"
              title={s.target.nickname}
            >
              <span className="relative inline-flex">
                <img
                  src={s.target.avatarUrl || pfpImage}
                  alt={s.target.nickname}
                  className="h-15 w-15 rounded-full"
                />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-[rgba(21,20,34,0.98)] bg-orange-500 px-1 text-[10px] font-semibold leading-none text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </span>
              <span className="max-w-[80px] min-w-[80px] truncate">{s.target.nickname}</span>
            </button>
          )
        })}
      </div>
      <div className="pointer-events-auto flex max-w-full flex-row-reverse flex-wrap gap-3">
        {visibleOpen.map((s) => (
          <div
            key={s.target.id}
            className="relative w-[360px] max-w-[60vw]"
          >
            {/* controls */}
            <div className="pointer-events-auto absolute right-2 top-2 z-10 flex gap-2">
              <button
                className="chat-dock-control"
                title="Minimize"
                onClick={() => minimizeChat(s.target.id, true)}
              >
                <FiMinus className="h-5 w-5" />
              </button>
              <button
                className="chat-dock-control"
                title="Close"
                onClick={() => closeChat(s.target.id)}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <ChatWindow
              messages={chat.getMessages(s.target.id)}
              friendData={{
                id: s.target.id,
                nickname: s.target.nickname,
                avatarUrl: s.target.avatarUrl || ''
              }}
              isTyping={chat.getTyping(s.target.id)}
              isLoadingMessages={chat.getLoading(s.target.id)}
              onSend={async ({ text, attachment }) => chat.sendMessage(s.target.id, { text, attachment })}
              onTyping={chat.sendTyping}
              onLoadMore={() => chat.loadMoreMessages(s.target.id)}
              className="max-h-[450px] min-h-[450px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatDock
