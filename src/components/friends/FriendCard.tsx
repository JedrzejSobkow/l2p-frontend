import { type FC, useMemo } from 'react'
import { pfpImage } from '@assets/images'
import { FaUser, FaRegCommentDots } from 'react-icons/fa'
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
  onClick,
  onMessage,
}) => {
  const handleCardClick = () => onClick?.()

  // Logika do określenia koloru i tekstu statusu
  const statusInfo = useMemo(() => {
    console.log('User status:', userStatus)
    switch (userStatus) {
      case 'online':
        return { color: 'bg-green-500', text: 'Online' }
      case 'in_game':
        return { color: 'bg-purple-500', text: gameName ? `Playing ${gameName}` : 'In Game' }
      case 'in_lobby':
        return { color: 'bg-orange-500', text: 'In Lobby' }
      case 'offline':
      default:
        return { color: 'bg-gray-500', text: 'Offline' }
    }
  }, [userStatus])

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition cursor-pointer',
        isSelected
          ? 'border-orange-400/70 bg-[rgba(45,44,63,0.95)] shadow-[0_0_15px_rgba(251,146,60,0.1)]'
          : 'border-white/5 bg-[rgba(31,30,43,0.95)] hover:border-orange-400/40 hover:bg-[rgba(36,35,50,0.95)]'
      )}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* AVATAR + STATUS INDICATOR */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover bg-background-dark"
          />
          
          {/* Status Dot (Online/Offline/InGame) */}
          <span className={cn(
            "absolute bottom-0 right-0 h-3 w-3 text-green rounded-full border-2 border-[rgba(31,30,43,1)]",
            statusInfo.color
          )} title={statusInfo.text} />

          {/* Unread Badge */}
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
             {/* Opcjonalnie: czas ostatniej wiadomości mógłby być tutaj */}
          </div>

          <div className="truncate text-xs">
            {lastMessageContent ? (
              <span className={isSelected ? "text-headline" : "text-white/50 group-hover:text-white/70"}>
                {/* Dodaję ikonkę dymku jeśli to wiadomość, opcjonalnie */}
                {/* <FaRegCommentDots className="inline mr-1 mb-0.5" /> */}
                {lastMessageIsMine ? 'You: ' + lastMessageContent : lastMessageContent}
              </span>
            ) : (
              <span className={cn(
                "font-medium",
                statusInfo.text === 'Offline' ? "text-white/30" :statusInfo.text === 'Online' ? 'text-green-500': "text-orange-400/80"
              )}>
                {statusInfo.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        {onMessage && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMessage()
            }}
            className={cn(
              "grid h-8 w-8 place-items-center z-[20] rounded-full border transition-all",
              isSelected 
                ? "border-orange-400/60 text-orange-200 hover:bg-orange-500 hover:border-orange-500 hover:text-white"
                : "border-white/10 text-white/40 hover:border-orange-400/40 hover:text-orange-300 hover:bg-white/5"
            )}
            aria-label="Open Chat"
            title="Open Chat"
          >
            {/* Zmieniłem ikonę na bardziej pasującą do czatu, ale możesz przywrócić FaUser */}
            <FaRegCommentDots className="h-4 w-4" /> 
            {/* <FaUser className="h-3 w-3" /> */}
          </button>
        )}
      </div>
    </div>
  )
}

export default FriendCard