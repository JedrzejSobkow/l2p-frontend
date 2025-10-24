import { useMemo, useState, type FC } from 'react'
import { FiChevronDown, FiSearch } from 'react-icons/fi'
import FriendCard, { type FriendProps } from './FriendCard'

type FriendsPanelProps = {
  friends?: FriendProps[]
  onFriendSelect?: (friend: FriendProps) => void
  title?: string
  className?: string
  selectedFriendId?: string | number
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const FriendsPanel: FC<FriendsPanelProps> = ({
  friends = [],
  onFriendSelect,
  title = 'Friends',
  className,
  selectedFriendId
}) => {
  const [showOnline, setShowOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { onlineFriends, offlineFriends } = useMemo(() => {
    const online: FriendProps[] = []
    const offline: FriendProps[] = []

    friends.forEach((friend) => {
      const normalizedStatus = (friend.status || 'Offline').trim()
      if (normalizedStatus === 'Offline') {
        offline.push(friend)
      } else {
        online.push(friend)
      }
    })

    return { onlineFriends: online, offlineFriends: offline }
  }, [friends])

  const selectedKey =
    selectedFriendId !== undefined && selectedFriendId !== null ? String(selectedFriendId) : undefined

  const renderFriend = (friend: FriendProps) => {
    const fallbackKey = `${friend.nickname}-${friend.status}`
    const key = friend.id !== undefined && friend.id !== null ? String(friend.id) : fallbackKey
    const isSelected = selectedKey ? key === selectedKey : false
    return (
      <FriendCard
        key={key}
        {...friend}
        isSelected={isSelected}
        onClick={() => {
          onFriendSelect?.(friend)
          friend.onClick?.()
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.98)]',
        className
      )}
    >
      <header className="border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </header>

      <div className="px-6 pb-2 pt-4">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-full border border-transparent bg-white/10 px-12 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-orange-400/60 focus:bg-white/5 focus:shadow-[0_0_0_3px_rgba(255,149,0,0.15)]"
          />
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-4">
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
              onlineFriends.map(renderFriend)
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
            {showOffline &&
              (offlineFriends.length > 0 ? (
                offlineFriends.map(renderFriend)
              ) : (
                <p className="text-sm text-white/50">No friends offline.</p>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default FriendsPanel
