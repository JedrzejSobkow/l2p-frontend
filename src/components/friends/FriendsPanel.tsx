import { useCallback, useMemo, useState, type FC, type ChangeEvent } from 'react'
import { FiChevronDown, FiSearch, FiUserPlus } from 'react-icons/fi'
import FriendCard from './FriendCard'
import { useChatDock } from '../chat/ChatDockContext'
import { useFriends } from './FriendsContext'
import type { Friendship, FriendResult } from '../../services/friends'
import { usePopup } from '../PopupContext'
import { useChat } from '../chat/ChatProvider'
import { pfpImage } from '@assets/images'

type FriendsPanelProps = {
  onFriendSelect?: (friendId: string ) => void
  onFriendMessage?: (friendId: string ) => void
  title?: string
  className?: string
  selectedFriendId?: string | number
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
const normalizeId = (value: string | number | undefined | null) =>
  value !== undefined && value !== null ? String(value) : undefined

const FriendsPanel: FC<FriendsPanelProps> = ({
  onFriendSelect,
  onFriendMessage,
  title = 'Friends',
  className,
  selectedFriendId,
}) => {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    isLoading,
  } = useFriends()
  const {showPopup} = usePopup();
  const {getUnread} = useChat()

  const [mode, setMode] = useState<'friends' | 'discover'>('friends')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<FriendResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showFriendsList, setShowFriendsList] = useState(true)
  const [showIncoming, setShowIncoming] = useState(true)
  const [showOutgoing, setShowOutgoing] = useState(false)
  const [processingMap, setProcessingMap] = useState<Record<string, boolean>>({})
  
  const runSearch = useCallback(
    async (input: string) => {
      const query = input.trim()
      if (query.length < 3) {
        setSearchResults([])
        return
      }
      setSearching(true)
      try {
        const res = await searchUsers(query)
        if(searchResults !== res.users)
          setSearchResults(res.users ?? [])
      } catch (error) {
        console.error('Failed to search users', error)
      } finally {
        setSearching(false)
      }
    },
    [searchUsers],
  )

  const handleSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    if (mode === 'discover') {
      void runSearch(value)
    }
  }

  const filteredFriends = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query || mode === 'discover') return friends
    return friends.filter((friend) => friend.friend_nickname.toLowerCase().includes(query))
  }, [friends, mode, searchTerm])

  const selectedKey = normalizeId(selectedFriendId)

  const markProcessing = (id: string, value: boolean) => {
    setProcessingMap((prev) => ({ ...prev, [id]: value }))
  }

  const handleAcceptRequest = async (friend: Friendship) => {
    const id = normalizeId(friend.friend_user_id)
    if (!id) return
    markProcessing(id, true)
    try {
      await acceptRequest(friend.friend_user_id)
      showPopup({type: 'confirmation', message: `Friend request from ${friend.friend_nickname} accepted.`})
    } catch (error) {
      console.error('Failed to accept friend request', error)
      showPopup({type: 'error', message: 'Failed to accept friend request. Please try again later.'})
    } finally {
      markProcessing(id, false)
    }
  }

  const handleDeclineRequest = async (friend: Friendship) => {
    const id = normalizeId(friend.friend_user_id)
    if (!id) return
    markProcessing(id, true)
    try {
      await declineRequest(friend.friend_user_id)
    } catch (error) {
      console.error('Failed to decline friend request', error)
    } finally {
      markProcessing(id, false)
    }
  }

  const handleSendRequest = async (user: FriendResult) => {
    const id = normalizeId(user.user_id)
    if (!id) return
    markProcessing(id, true)
    try {
      await sendRequest(user.user_id)
      showPopup({type: 'confirmation', message: `Friend request sent to ${user.nickname}.`})
      setSearchResults((prev) => prev.filter((item) => normalizeId(item.user_id) !== id))
    } catch (error: any) {
      console.error('Failed to send friend request', error)
      showPopup({type: 'error', message: error.message || 'Failed to send friend request. Please try again later.'})
    } finally {
      markProcessing(id, false)
    }
  }


  const renderFriend = (friend: Friendship) => {
    // console.log('Rendering friend:', friend)
    const key = normalizeId(friend.friend_user_id) ?? friend.friendship_id.toString()
    const isSelected = selectedKey ? key === selectedKey : false
    return (
      <FriendCard
        unreadCount={getUnread?.(key) ?? 0}
        key={key}
        {...friend}
        isSelected={isSelected}
        onClick={() => onFriendSelect?.(friend.friend_user_id)}
        onMessage={()=> onFriendMessage?.(friend.friend_user_id)}
      />
    )
  }

  return (
    <>
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-3xl border border-separator bg-background-secondary',
        className,
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
                placeholder={mode === 'discover' ? 'Search users...' : 'Search friends...'}
                className="w-full rounded-2xl border border-transparent bg-white/10 px-8 pr-1.5 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-orange-400/60 focus:bg-white/5 "
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (mode === 'friends') {
                  setMode('discover')
                  if (searchTerm.trim().length >= 3) {
                    void runSearch(searchTerm)
                  }
                } else {
                  setMode('friends')
                }
              }}
              className={cn(
                'grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border transition ml-auto',
                mode === 'friends'
                  ? 'border-white/15 text-white/80 hover:border-orange-400/40 hover:text-white disabled:opacity-50'
                  : 'border-orange-400/60 text-orange-300 hover:border-orange-300 hover:text-orange-200',
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
              <p className="text-sm text-white/60">Type at least 3 characters to search for players.</p>
            )}
            {searchTerm.trim().length >= 3 && searching && (
              <p className="text-sm text-white/60">Searching...</p>
            )}
            {searchTerm.trim().length >= 3 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-white/60">No users found.</p>
            )}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((user) => {
                  const id = normalizeId(user.user_id) ?? user.nickname
                  const processing = !!(id && processingMap[id])
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.pfp_path || pfpImage}
                          alt="Avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{user.nickname}</div>
                          {user.description && (
                            <div className="truncate text-xs text-white/60">{user.description}</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-button px-4 py-1.5 text-xs font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)] disabled:opacity-60 disabled:hover:translate-y-0"
                        onClick={() => handleSendRequest(user)}
                        disabled={processing}
                      >
                        {processing ? 'Sending...' : 'Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <>
          <section>
              <button
                type="button"
                onClick={() => setShowFriendsList((prev) => !prev)}
                className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
                aria-expanded={showFriendsList}
              >
                <span>Friends ({filteredFriends.length})</span>
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${showFriendsList ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
              <div
                className={`space-y-3 overflow-hidden transition-all duration-300 ease-out ${
                  showFriendsList
                    ? 'mt-4 max-h-[1200px] opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                {!isLoading && filteredFriends.length === 0 && (
                  <p className="text-sm text-white/50">No friends yet. Add someone to start chatting.</p>
                )}
                {/* {isLoading && <p className="text-sm text-white/60">Loading friends...</p>} */}
                {filteredFriends.length > 0 && filteredFriends.map(renderFriend)}
              </div>
            </section>
            <section>
              <button
                type="button"
                onClick={() => setShowIncoming((prev) => !prev)}
                className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
                aria-expanded={showIncoming}
              >
                <span>Incoming Requests ({incomingRequests.length})</span>
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${showIncoming ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
              <div
                className={`space-y-3 overflow-hidden transition-all duration-300 ease-out ${
                  showIncoming ? 'mt-4 max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                {showIncoming &&
                  (incomingRequests.length > 0 ? (
                    incomingRequests.map((request) => {
                      const id = normalizeId(request.friend_user_id) ?? request.friendship_id.toString()
                      const processing = !!(id && processingMap[id])
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={request.friend_pfp_path || pfpImage}
                              alt={request.friend_nickname}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">{request.friend_nickname}</div>
                              {request.friend_description && (
                                <div className="truncate text-xs text-white/60">{request.friend_description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-full bg-button px-4 py-1.5 text-xs font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)] disabled:opacity-60 disabled:hover:translate-y-0"
                              onClick={() => handleAcceptRequest(request)}
                              disabled={processing}
                            >
                              {processing ? '...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-60"
                              onClick={() => handleDeclineRequest(request)}
                              disabled={processing}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-white/50">No pending requests.</p>
                  ))}
              </div>
            </section>

            <section>
              <button
                type="button"
                onClick={() => setShowOutgoing((prev) => !prev)}
                className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
                aria-expanded={showOutgoing}
              >
                <span>Sent Requests ({outgoingRequests.length})</span>
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${showOutgoing ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
              <div
                className={`space-y-3 overflow-hidden transition-all duration-300 ease-out ${
                  showOutgoing ? 'mt-4 max-h-[1200px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                {showOutgoing &&
                  (outgoingRequests.length > 0 ? (
                    outgoingRequests.map((request) => {
                      const id = normalizeId(request.friend_user_id) ?? request.friendship_id.toString()
                      const processing = !!(id && processingMap[id])
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={request.friend_pfp_path || pfpImage}
                              alt={request.friend_nickname}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">{request.friend_nickname}</div>
                              {request.friend_description && (
                                <div className="truncate text-xs text-white/60">{request.friend_description}</div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-60"
                            onClick={() => handleDeclineRequest(request)}
                            disabled={processing}
                          >
                            Cancel
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-white/50">You have no sent requests.</p>
                  ))}
              </div>
            </section>

            
          </>
        )}
      </div>
      
    </div>
    </>
  )
}

export default FriendsPanel
