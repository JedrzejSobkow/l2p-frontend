import { FiMinus, FiX } from 'react-icons/fi'
import ChatWindow from './ChatWindow'
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-row-reverse items-end gap-1 p-5">
      {minimized.length > 0 && (
        <div className="pointer-events-auto flex flex-col flex-wrap gap-2 ">
          {minimized.map((s) => (
            <button
              key={s.target.id}
              onClick={() => minimizeChat(s.target.id, false)}
              className="flex items-center gap-2 rounded-full border text-headline border-white/15 bg-[rgba(21,20,34,0.98)] hover:border-white/30 hover:text-white"
              title={s.target.nickname}
            >
              <img
                src={s.target.avatarUrl || '/assets/images/pfp.png'}
                alt={s.target.nickname}
                className="h-15 w-15 rounded-full"
              />
              <span className="max-w-[80px] min-w-[80px] truncate">{s.target.nickname}</span>
            </button>
          ))}
        </div>
      )}
      <div className="pointer-events-auto flex max-w-full flex-row-reverse flex-wrap gap-3">
        {openSessions.map((s) => (
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
              title={s.target.nickname}
              messages={chat.getMessages(s.target.id)}
              currentUserId={currentUserId}
              typingUsers={chat.getTypingUsers(s.target.id)}
              onSend={async ({ text }) => chat.sendMessage(s.target.id, text)}
              onTyping={() => chat.sendTyping(s.target.id)}
              placeholder={`Message ${s.target.nickname}...`}
              className="max-h-[450px] min-h-[450px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatDock
