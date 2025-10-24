import { useMemo, useState } from 'react'
import { FiChevronDown, FiX } from 'react-icons/fi'
import FriendCard, { type FriendProps } from './FriendCard'

type FriendsPanelProps = {
  open: boolean
  onClose: () => void
  friends?: FriendProps[]
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ open, onClose, friends = [] }) => {
  const [showOnline, setShowOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(true)

  const { onlineFriends, offlineFriends } = useMemo(() => {
    const online: FriendProps[] = []
    const offline: FriendProps[] = []

    friends.forEach((friend) => {
      const normalized = (friend.status || 'Offline').trim()
      if (normalized === 'Offline') {
        offline.push(friend)
      } else {
        online.push(friend)
      }
    })

    return { onlineFriends: online, offlineFriends: offline }
  }, [friends])

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[rgba(21,20,34,0.98)] shadow-[0_0_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        onClick={handleContentClick}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <span className="text-lg font-semibold text-white">Friends</span>
          <button
            onClick={onClose}
            className="rounded-full border border-transparent p-2 text-white/80 transition hover:border-white/30 hover:text-white"
            aria-label="Close friends panel"
            type="button"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <section>
            <button
              type="button"
              onClick={() => setShowOnline((prev) => !prev)}
              className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
              aria-expanded={showOnline}
            >
              <span>Online ({onlineFriends.length})</span>
              <FiChevronDown className={`h-4 w-4 transition-transform ${showOnline ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <div
              className={`space-y-3 overflow-hidden transition-all duration-300 ease-out ${
                showOnline ? 'mt-4 max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
              }`}
            >
              {onlineFriends.length > 0 ? (
                onlineFriends.map((friend) => <FriendCard key={`${friend.nickname}-${friend.status}`} {...friend} />)
              ) : (
                <p className="text-sm text-white/50">No friends online right now.</p>
              )}
            </div>
          </section>

          <section>
            <button
              type="button"
              onClick={() => setShowOffline((prev) => !prev)}
              className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
              aria-expanded={showOffline}
            >
              <span>Offline ({offlineFriends.length})</span>
              <FiChevronDown className={`h-4 w-4 transition-transform ${showOffline ? 'rotate-0' : '-rotate-90'}`} />
            </button>
            <div
              className={`space-y-3 overflow-hidden transition-all duration-300 ease-out ${
                showOffline ? 'mt-4 max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
              }`}
            >
              {offlineFriends.length > 0 ? (
                offlineFriends.map((friend) => <FriendCard key={`${friend.nickname}-${friend.status}`} {...friend} />)
              ) : (
                <p className="text-sm text-white/50">No friends offline.</p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

export default FriendsPanel
