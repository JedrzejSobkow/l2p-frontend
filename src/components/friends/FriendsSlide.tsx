import { useEffect, type FC, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import FriendsPanel from './FriendsPanel'
import { useAuth } from '../AuthContext'
import { FaUserFriends } from 'react-icons/fa'
import { CgProfile } from 'react-icons/cg'
import { AiFillHome } from 'react-icons/ai'
import { useFriends } from './FriendsContext'
import { useChatDock } from '../chat/ChatDockContext'
import { pfpImage } from '@assets/images'
import { useLobby } from '../lobby/LobbyContext'
import { usePopup } from '../PopupContext'

type FriendsSlideProps = {
  open: boolean
  onClose: () => void
  title?: string
  selectedFriendId?: string | number
}

const FriendsSlide: FC<FriendsSlideProps> = ({ open, onClose, title, selectedFriendId }) => {
  const { user } = useAuth()
  const { openChat} = useChatDock()
  const { refreshFriends,friends } = useFriends()
  const { currentLobby } = useLobby();
  const { showPopup } = usePopup();
  const navigate = useNavigate()
  const handleContentClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleNavigation = (event: MouseEvent, path: string) => {
    if (currentLobby) {
      event.preventDefault();
      showPopup({
        type: 'informative',
        message: 'Please leave the lobby before navigating to another page.',
      });
    }
  };

  const friendSelect = (friendId: string | number) => {
    const normalizedId = String(friendId)
    const friend = friends.find((val) => String(val.friend_user_id) === normalizedId)
    if (!friend) {
      onClose()
      return
    }

    const isSmallScreen =
      typeof window !== 'undefined' ? window.innerWidth < 768 : false

    if (isSmallScreen) {
      navigate('/friends', { state: { friendId: normalizedId } })
    } else {
      openChat({
        id: normalizedId,
        nickname: friend.friend_nickname,
        avatarUrl: friend.friend_pfp_path,
      })
    }
    onClose()
  }

  useEffect(() => {
    if (open) {
      void refreshFriends()
    }
  }, [open, refreshFriends])
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
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
        <div className="relative flex h-full flex-col bg-background-secondary">
          <div className="flex flex-col border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 border-b-1 border-separator p-5">
              <img
                src={(user?.pfp_path ?  user.pfp_path : pfpImage)}
                alt={user?.nickname || 'User Avatar'}
                className="h-15 w-15 rounded-full border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-2xl font-semibold text-headline">{user?.nickname || 'Guest'}</div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="flex w-8 h-8 items-center justify-center rounded-full ml-auto border border-transparent text-button transition hover:border-white/30"
                aria-label="Close friends panel"
              >
                <FiX className="h-8 w-8" />
              </button>
            </div>
            <div className="flex flex-row items-center justify-center gap-5">
              <Link
                to="/"
                className="slider-link"
                onClick={(event) => handleNavigation(event, '/')}
              >
                <AiFillHome className="w-8 h-8" />
                <span>Home</span>
              </Link>
              <Link
                to="/profile"
                className="slider-link"
                onClick={(event) => handleNavigation(event, '/profile')}
              >
                <CgProfile className="w-8 h-8" />
                <span>Profile</span>
              </Link>
              <Link
                to="/friends"
                className="slider-link"
                onClick={(event) => handleNavigation(event, '/friends')}
              >
                <FaUserFriends className="w-8 h-8" />
                <span>Friends</span>
              </Link>
              
            </div>
          </div>
          <FriendsPanel
            onFriendSelect={friendSelect}
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
