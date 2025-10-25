import { type FC, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import FriendsPanel from './FriendsPanel'
import type { FriendProps } from './FriendCard'
import { useAuth } from '../AuthContext'

type FriendsSlideProps = {
  open: boolean
  onClose: () => void
  friends?: FriendProps[]
  onFriendSelect?: (friend: FriendProps) => void
  title?: string
  selectedFriendId?: string | number
}

const FriendsSlide: FC<FriendsSlideProps> = ({ open, onClose, friends, onFriendSelect, title, selectedFriendId }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const handleContentClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        onClick={handleContentClick}
      >
        <div className="relative flex h-full flex-col bg-[rgba(21,20,34,0.98)] shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full border border-transparent p-2 text-white/80 transition hover:border-white/30 hover:text-white"
            aria-label="Close friends panel"
          >
            <FiX className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={(user?.pfp_path ? '/src/assets' + user.pfp_path : '/assets/images/pfp.png')}
                alt={user?.nickname || 'User Avatar'}
                className="h-15 w-15 rounded-full border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-2xl font-semibold text-white">{user?.nickname || 'Guest'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { navigate('/friends'); onClose() }}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:border-orange-400/60 hover:text-orange-200"
              title="Open Friends page"
            >
              Open Friends
            </button>
          </div>
          <FriendsPanel
            friends={friends}
            onFriendSelect={onFriendSelect}
            title={title || 'Friends'}
            selectedFriendId={selectedFriendId}
            className="h-full rounded-none border-0"
          />
        </div>
      </aside>
    </>
  )
}

export default FriendsSlide
