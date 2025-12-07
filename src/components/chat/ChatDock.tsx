import { useEffect, useState } from 'react'
import { FiMinus, FiX } from 'react-icons/fi'
import ChatWindow from './ChatWindow'
import { useChatDock } from './ChatDockContext'
import { useAuth } from '../AuthContext'
import { useChat } from './ChatProvider'
import { useLocation } from 'react-router'
import { pfpImage } from '@assets/images'
import { useFriends } from '../friends/FriendsContext'
import { useLobby } from '../lobby/LobbyContext'
import { DockItem } from './DockItem'

const getMaxVisibleWindows = () => {
  if (typeof window === 'undefined') return 1
  const width = window.innerWidth
  if (width < 1024) return 1 
  if (width < 1400) return 2
  return 3
}

const ChatDock = () => {
  const { sessions } = useChatDock()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  const [maxVisible, setMaxVisible] = useState<number>(() => getMaxVisibleWindows())

  useEffect(() => {
    const handleResize = () => setMaxVisible(getMaxVisibleWindows())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) return null

  const openSessions = sessions.filter((s) => !s.minimized)
  const baseMinimized = sessions.filter((s) => s.minimized)

  const overflowCount = Math.max(0, openSessions.length - maxVisible)
  const overflow = overflowCount > 0 ? openSessions.slice(0, overflowCount) : []
  const visibleOpen = overflowCount > 0 ? openSessions.slice(overflowCount) : openSessions
  const minimized = [...baseMinimized, ...overflow]

  const shouldHide = location.pathname.startsWith('/friends')
  if (shouldHide) return null

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-[30] hidden items-end gap-4 md:flex">
      <div className="flex items-end gap-3">
        {visibleOpen.map((s) => (
          <DockItem
            key={s.id}
            userId={s.id}
            minimized={s.minimized}
          />
        ))}
      </div>
      {minimized.length > 0 && (
        <div className="group pointer-events-auto flex flex-col-reverse gap-2 pb-4 pl-4 items-end">
          {minimized.map((s) => 
            <DockItem
              key={s.id}
              userId={s.id}
              minimized={true}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default ChatDock