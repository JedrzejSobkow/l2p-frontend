import { useEffect, type FC, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import FriendsPanel from './FriendsPanel'
import { useAuth } from '../AuthContext'
import { FaUserFriends } from 'react-icons/fa'
import { CgProfile } from 'react-icons/cg'
import { AiFillHome } from 'react-icons/ai'
import { useFriends } from './FriendsContext'
import { useChatDock } from '../chat/ChatDockContext'

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
  const handleContentClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  useEffect(() => {
    if (open) {
      void refreshFriends()
    }
  }, [open, refreshFriends])
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
        <div className="relative flex h-full flex-col bg-background-secondary">
          <div className="flex flex-col border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0 border-b-1 border-separator p-5">
              <img
                src={(user?.pfp_path ?  user.pfp_path : '/assets/images/pfp.png')}
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
            <div className='flex flex-row items-center justify-center gap-5'>
              <Link 
                to='/'
                className='slider-link'
                onClick={onClose}>
                  <AiFillHome className='w-8 h-8'></AiFillHome>
                  <span>Home</span>
              </Link>
              <Link 
                to='/profile'
                className='slider-link'
                onClick={onClose}
                >
                  <CgProfile className='w-8 h-8'></CgProfile>
                  <span>Profile</span>
              </Link>
              <Link 
                to='/friends' 
                className='slider-link'
                onClick={onClose}
                >
                  <FaUserFriends className='w-8 h-8'></FaUserFriends>
                  <span>Friends</span>
              </Link>
              
            </div>
          </div>
          <FriendsPanel
            onFriendSelect={(friendId) => {
              const friend = friends.find((val) => val.friend_user_id === friendId)
              if (friend)
                openChat({
                  id: String(friend?.friend_user_id),
                  nickname: friend?.friend_nickname,
                  avatarUrl: friend?.friend_pfp_path
                })
            }}
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
