import { type FC, useMemo } from 'react'
import { FaUser, FaSignInAlt } from 'react-icons/fa'
import type { Friend } from './FriendsContext'
import type { UserStatus } from '@/services/chat'

export type FriendCardProps = Partial<Friend> & {
  isSelected?: boolean
  unreadCount?: number
  onClick?: () => void
  onLobbyJoin?: () => void
  onMessage?: () => void
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const FriendCard: FC<FriendCardProps> = ({
  nickname,
  avatarUrl,
  isSelected,
  lastMessageContent,
  lastMessageIsMine,
  gameName,
  userStatus,
  unreadCount,
  lobbyFilledSlots,
  lobbyMaxSlots,
  onClick,
  onMessage,
  onLobbyJoin
}) => {
  const handleCardClick = () => onClick?.()

  // Logika statusu (kolor kropki, kolor tekstu, etykieta)
  const statusInfo = useMemo(() => {
    switch (userStatus) {
      case 'online':
        return { dot: 'bg-green-500', textClass: 'text-green-500', label: 'Online' }
      case 'in_game':
        return { dot: 'bg-orange-500', textClass: 'text-orange-400', label: gameName ? `Playing ${gameName}` : 'In Game' }
      case 'in_lobby':
        return { dot: 'bg-orange-500', textClass: 'text-orange-400', label: 'In Lobby' }
      case 'offline':
      default:
        return { dot: 'bg-gray-500', textClass: 'text-white/40', label: 'Offline' }
    }
  }, [userStatus, gameName])

  const canJoinLobby = 
    userStatus === 'in_lobby' && 
    onLobbyJoin && 
    (lobbyFilledSlots ?? 0) < (lobbyMaxSlots ?? 0);

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition cursor-pointer',
        isSelected
          ? 'border-button bg-[rgba(45,44,63,0.95)]'
          : 'border-white/5 bg-[rgba(31,30,43,0.95)] hover:border-orange-400/40 hover:bg-[rgba(36,35,50,0.95)]'
      )}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* AVATAR + STATUS DOT */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover bg-background-dark"
          />
          
          <span className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[rgba(31,30,43,1)]",
            statusInfo.dot
          )} title={statusInfo.label} />

          {unreadCount ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-[rgba(21,20,34,0.95)] bg-orange-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </div>

        {/* TEXT CONTENT */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between">
             <div className="truncate text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                {nickname}
             </div>
          </div>

          <div className="truncate text-xs text-white/40">
            {/* Zawsze wyświetlamy status */}
            <span className={cn("font-medium", statusInfo.textClass)}>
              {statusInfo.label}
              {/* Dodajemy licznik slotów jeśli jesteśmy w lobby */}
              {userStatus === 'in_lobby' && lobbyMaxSlots ? ` (${lobbyFilledSlots}/${lobbyMaxSlots})` : ''}
            </span>

            {/* Jeśli jest wiadomość, dodajemy ją po separatorze */}
            {lastMessageContent && (
              <span className="ml-1.5">
                • {lastMessageIsMine ? 'You: ' : ''}{lastMessageContent}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canJoinLobby && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLobbyJoin!()
            }}
            className="grid h-8 w-8 place-items-center z-[20] rounded-full border border-green-500/40 text-green-400 transition hover:border-green-400 hover:bg-green-500 hover:text-white"
            aria-label="Join Lobby"
            title="Join Lobby"
          >
            <FaSignInAlt className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Przycisk Wiadomości */}
        {onMessage && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMessage()
            }}
            className="grid h-8 w-8 place-items-center z-[20] rounded-full border 
            transition-all border-button text-button hover:bg-button hover:text-headline"
            aria-label="Open Chat"
            title="Open Chat"
          >
            <FaUser className="h-3 w-3" /> 
          </button>
        )}
      </div>
    </div>
  )
}

export default FriendCard