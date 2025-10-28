import { useMemo, useState, type FC, type ChangeEvent } from 'react'
import { FiChevronDown, FiSearch, FiUserPlus } from 'react-icons/fi'
import FriendCard, { type FriendProps } from './FriendCard'
import { useChatDock } from '../chat/ChatDockContext'

type FriendsPanelProps = {
  friends?: FriendProps[]
  onFriendSelect?: (friend: FriendProps) => void
  title?: string
  className?: string
  selectedFriendId?: string | number
  // Optional handlers for future backend integration
  onSearchUsers?: (query: string) => Promise<FriendProps[]> | FriendProps[]
  onAddFriend?: (user: FriendProps) => Promise<void> | void
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const FriendsPanel: FC<FriendsPanelProps> = ({
  friends = [],
  onFriendSelect,
  title = 'Friends',
  className,
  selectedFriendId,
  onSearchUsers,
  onAddFriend,
}) => {
  const [showOnline, setShowOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [mode, setMode] = useState<'friends' | 'discover'>('friends')
  const [searchResults, setSearchResults] = useState<FriendProps[] | null>(null)
  const [searching, setSearching] = useState(false)

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchTerm(q)
    if (mode === 'discover') {
      if (!q.trim()) {
        setSearchResults(null)
        return
      }
      if (typeof onSearchUsers === 'function') {
        try {
          setSearching(true)
          const res = await onSearchUsers(q.trim())
          setSearchResults(res ?? [])
        } finally {
          setSearching(false)
        }
      }
    }
  }

  const { onlineFriends, offlineFriends } = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    const base = mode === 'friends' && q ? friends.filter(f => f.nickname.toLowerCase().includes(q)) : friends
    const online: FriendProps[] = []
    const offline: FriendProps[] = []

    base.forEach((friend) => {
      const normalizedStatus = (friend.status || 'Offline').trim()
      if (normalizedStatus === 'Offline') {
        offline.push(friend)
      } else {
        online.push(friend)
      }
    })

    return { onlineFriends: online, offlineFriends: offline }
  }, [friends, searchTerm, mode])

  const selectedKey = selectedFriendId !== undefined && selectedFriendId !== null ? String(selectedFriendId) : undefined
  const { openChat } = useChatDock()

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
        onMessage={() => {
          if (!friend.nickname) return
          openChat({ id: key, nickname: friend.nickname, avatarUrl: friend.avatarUrl,status: friend.status })
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-3xl border border-separator bg-background-secondary',
        className
      )}
    >
      <header className="border-b border-separator px-6 py-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-1">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search friends..."
                className="w-full rounded-2xl border border-transparent bg-white/10 px-8 pr-1.5 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-orange-400/60 focus:bg-white/5 "
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                if (mode === 'friends') {
                  setMode('discover')
                  if (searchTerm.trim() && typeof onSearchUsers === 'function') {
                    try {
                      setSearching(true)
                      const res = await onSearchUsers(searchTerm.trim())
                      setSearchResults(res ?? [])
                    } finally {
                      setSearching(false)
                    }
                  } else {
                    setSearchResults(null)
                  }
                } else {
                  setMode('friends')
                }
              }}
              className={cn(
                'grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border transition ml-auto',
                mode === 'friends'
                  ? 'border-white/15 text-white/80 hover:border-orange-400/40 hover:text-white disabled:opacity-50'
                  : 'border-orange-400/60 text-orange-300 hover:border-orange-300 hover:text-orange-200'
              )}
              title={mode === 'friends' ? 'Find new users' : 'Back to friends'}
              aria-label={mode === 'friends' ? 'Find new users' : 'Back to friends'}
            >
              <FiUserPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-4">
        {mode === 'discover' ? (
          <section>
            {!searchTerm.trim() && (
              <p className="text-sm text-white/60">Type in the search box to find new users.</p>
            )}
            {searchTerm.trim() && searching && (
              <p className="text-sm text-white/60">Searching...</p>
            )}
            {searchTerm.trim() && !searching && (searchResults?.length ?? 0) === 0 && (
              <p className="text-sm text-white/60">No users found.</p>
            )}
            {searchTerm.trim() && !searching && (searchResults?.length ?? 0) > 0 && (
              <div className="space-y-3">
                {searchResults!.map((u) => (
                  <div
                    key={String(u.id ?? `${u.nickname}-discover`)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.avatarUrl || '/assets/images/pfp.png'}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{u.nickname}</div>
                        <div className="truncate text-xs text-white/60">{(u.status || 'Offline')}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-button px-4 py-1.5 text-xs font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
                      onClick={() => onAddFriend?.(u)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export default FriendsPanel
