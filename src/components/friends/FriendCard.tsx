import { type FC, type MouseEvent } from 'react'
import { FiSend } from 'react-icons/fi'

type FriendStatus = 'Playing' | 'In Lobby' | 'Creating Lobby' | 'Online' | 'Offline'

export type FriendProps = {
  id?: string | number
  nickname: string
  status: FriendStatus
  description?: string
  lobbyId?: string
  avatarUrl?: string
  rank?: string
  favoriteGame?: string
  isSelected?: boolean
  onClick?: () => void
  onSpectate?: () => void
  onMessage?: () => void
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const FriendCard: FC<FriendProps> = ({
  nickname,
  status,
  avatarUrl,
  onClick,
  onSpectate,
  onMessage,
  isSelected
}) => {
  const normalized = (status || 'Offline').trim() as Exclude<FriendStatus, ' Creating Lobby'> | 'Creating Lobby'
  const colorClass =
    normalized === 'Online'
      ? 'text-green-300'
      : normalized === 'Offline'
      ? 'text-white/50'
      : 'text-orange-300'

  const showSpectate = normalized === 'Playing' || normalized === 'In Lobby'
  const handleCardClick = () => onClick?.()
  const handleSpectate = (e: MouseEvent) => {
    e.stopPropagation()
    onSpectate?.()
  }
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
          ? 'border-orange-400/70 bg-[rgba(45,44,63,0.95)] shadow-[0_12px_28px_rgba(255,149,0,0.18)]'
          : 'border-white/10 bg-[rgba(31,30,43,0.95)] hover:border-orange-400/40'
      )}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={avatarUrl || '/assets/images/pfp.png'}
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{nickname}</div>
          <div className={`truncate text-xs ${colorClass}`}>
            {normalized === 'Creating Lobby' ? 'Creating Lobby' : normalized}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showSpectate && (
          <button
            onClick={handleSpectate}
            className="rounded-full bg-button px-4 py-1.5 text-xs font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
          >
            Spectate
          </button>
        )}
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
