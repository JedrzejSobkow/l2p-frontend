import { FiMinus, FiX } from 'react-icons/fi'
import ChatWindow, { type ChatMessage } from '../friends/ChatWindow'
import { useChatDock } from './ChatDockContext'
import { useAuth } from '../AuthContext'
import { useChat } from './ChatProvider'

const ChatDock = () => {
  const { sessions, minimizeChat, closeChat } = useChatDock()
  const { user } = useAuth()
  const chat = useChat()
  const currentUserId = user?.id != null ? String(user.id) : 'me'

  const openSessions = sessions.filter((s) => !s.minimized)
  const minimized = sessions.filter((s) => s.minimized)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-2 p-4">
      {/* Row of open chat windows */}
      <div className="pointer-events-auto flex max-w-full flex-row-reverse flex-wrap gap-3">
        {openSessions.map((s) => (
          <div
            key={s.target.id}
            className="relative w-[360px] max-w-[94vw]"
          >
            {/* controls */}
            <div className="pointer-events-auto absolute right-2 top-2 z-10 flex gap-2">
              <button
                className="rounded-full border border-white/20 p-1 text-white/80 hover:border-white/40 hover:text-white"
                title="Minimize"
                onClick={() => minimizeChat(s.target.id, true)}
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <button
                className="rounded-full border border-white/20 p-1 text-white/80 hover:border-white/40 hover:text-white"
                title="Close"
                onClick={() => closeChat(s.target.id)}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <ChatWindow
              title={s.target.nickname}
              messages={chat.getMessages(s.target.id) as ChatMessage[]}
              currentUserId={currentUserId}
              onSend={async ({ text }) => chat.sendMessage(s.target.id, text)}
              placeholder={`Message ${s.target.nickname}...`}
            />
          </div>
        ))}
      </div>

      {/* Minimized tray */}
      {minimized.length > 0 && (
        <div className="pointer-events-auto flex flex-row-reverse flex-wrap gap-2">
          {minimized.map((s) => (
            <button
              key={s.target.id}
              onClick={() => minimizeChat(s.target.id, false)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-[rgba(21,20,34,0.98)] px-3 py-2 text-xs text-white/80 hover:border-white/30 hover:text-white"
              title={s.target.nickname}
            >
              <img
                src={s.target.avatarUrl || '/assets/images/pfp.png'}
                alt={s.target.nickname}
                className="h-6 w-6 rounded-full"
              />
              <span className="max-w-[120px] truncate">{s.target.nickname}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChatDock
