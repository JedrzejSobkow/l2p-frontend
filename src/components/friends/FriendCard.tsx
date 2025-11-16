import { type FC, type MouseEvent } from 'react'
import { FiSend } from 'react-icons/fi'
import type { Friendship } from '../../services/friends'

export type FriendCardProps = Friendship & {
  isSelected?: boolean
  unreadCount?: number
  onClick?: () => void
  onMessage?: () => void
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')



const FriendCard: FC<FriendCardProps> = ({
  friend_nickname: nickname,
  friend_pfp_path: avatarUrl,
  isSelected,
  unreadCount,
  onClick,
  onMessage,
}) => {
  const handleCardClick = () => onClick?.()
  const handleMessage = (e: MouseEvent) => {
    e.stopPropagation()
    onMessage?.()
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition',
        isSelected
          ? 'border-orange-400/70 bg-[rgba(45,44,63,0.95)]'
          : 'border-white/10 bg-[rgba(31,30,43,0.95)] hover:border-orange-400/40'
      )}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <img
            src={avatarUrl || '/assets/images/pfp.png'}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          {unreadCount ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-[rgba(21,20,34,0.95)] bg-orange-500 px-1 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{nickname}</div>
          {/* <div className={`truncate text-xs ${colorClass}`}>
            {normalized === 'Creating Lobby' ? 'Creating Lobby' : normalized}
          </div> */}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleMessage}
          className="grid h-8 w-8 place-items-center rounded-full border border-orange-400/40 text-orange-300 transition hover:border-orange-300 hover:text-orange-200"
          aria-label="Message"
          title="Message"
        >
          <FiSend className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default FriendCard
