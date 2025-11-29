import { useCallback, useMemo, useState, type FC, type ChangeEvent, useEffect } from 'react'
import { FiCheck, FiChevronDown, FiLoader, FiSearch, FiUserPlus, FiX } from 'react-icons/fi'
import FriendCard from './FriendCard'
import { useChatDock } from '../chat/ChatDockContext'
import { useFriends, type Friend } from './FriendsContext'
import type { Friendship, FriendResult } from '../../services/friends'
import { usePopup } from '../PopupContext'
import { useChat } from '../chat/ChatProvider'
import { pfpImage } from '@assets/images'

type FriendsPanelProps = {
  onFriendSelect?: (friendId: string ) => void
  onFriendMessage?: (friendId: string ) => void
  onLobbyJoin?: (lobbyCode: string ) => void
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
  onLobbyJoin,
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
        setSearching(false)
        return
      }
      setSearching(true)
      try {
        const minDelay = new Promise((resolve) => setTimeout(resolve, 400))
        const [res] = await Promise.all([
          searchUsers(query),
          minDelay
        ])

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

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
  }

  useEffect(() => {
    if (mode === 'discover' && searchTerm.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        void runSearch(searchTerm)
      }, 300)
      return () => clearTimeout(timeoutId)
    }

    if (searchTerm.trim().length < 3) {
      setSearchResults([])
      setSearching(false)
    }
  }, [searchTerm, mode, runSearch])

  const filteredFriends = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query || mode === 'discover') return friends
    return friends.filter((friend) => friend.nickname.toLowerCase().includes(query))
  }, [friends, mode, searchTerm])

  const selectedKey = normalizeId(selectedFriendId)

  const markProcessing = (id: string, value: boolean) => {
    setProcessingMap((prev) => ({ ...prev, [id]: value }))
  }

  const handleAcceptRequest = async (friend: Friend) => {
    const id = friend.id
    if (!id) return
    markProcessing(id, true)
    try {
      await acceptRequest(id)
      showPopup({type: 'confirmation', message: `Friend request from ${friend.nickname} accepted.`})
    } catch (error) {
      console.error('Failed to accept friend request', error)
      showPopup({type: 'error', message: 'Failed to accept friend request. Please try again later.'})
    } finally {
      markProcessing(id, false)
    }
  }

  const handleDeclineRequest = async (friend: Friend) => {
    const id = normalizeId(friend.id)
    if (!id) return
    markProcessing(id, true)
    try {
      await declineRequest(friend.id)
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
      await sendRequest(user.user_id, user.nickname, user.pfp_path || '',user.description || '')
      showPopup({type: 'confirmation', message: `Friend request sent to ${user.nickname}.`})
      setSearchResults((prev) => prev.filter((item) => normalizeId(item.user_id) !== id))
    } catch (error: any) {
      console.error('Failed to send friend request', error)
      showPopup({type: 'error', message: error.message || 'Failed to send friend request. Please try again later.'})
    } finally {
      markProcessing(id, false)
    }
  }


  const renderFriend = (friend: Friend) => {
    const isSelected = selectedKey ? friend.id === selectedKey : false
    return (
      <FriendCard
        key={friend.id}
        {...friend}
        unreadCount={getUnread?.(friend.id) ?? 0}
        isSelected={isSelected}
        onClick={() => onFriendSelect?.(friend.id)}
        onMessage={onFriendMessage ? () => onFriendMessage(friend.id) : undefined}
        onLobbyJoin={onLobbyJoin ? () => {
          if (friend.lobbyCode){
            onLobbyJoin(friend.lobbyCode)
          }
        }: undefined}
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
                } else {
                  setMode('friends')
                }
              }}
              className={cn(
                'grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border transition ml-auto',
                mode === 'friends'
                  ? 'border-white/15 text-headline hover:border-button hover:text-button disabled:opacity-50'
                  : 'border-button text-button',
              )}
              title={mode === 'friends' ? 'Find new users' : 'Back to friends'}
              aria-label={mode === 'friends' ? 'Find new users' : 'Back to friends'}
            >
              <FiUserPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6 pt-4 scrollbar-default">
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
                className="flex w-full items-center justify-between border-b border-white/5 pb-2 text-left text-sm font-semibold uppercase tracking-wide transition-colors text-white/70 hover:text-white"
                aria-expanded={showIncoming}
              >
                <div className="flex items-center gap-2">
                  <span>Incoming Requests ({incomingRequests.length})</span>
                  {incomingRequests.length > 0 && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-bounce absolute inline-flex w-2.5 h-2.5 rounded-full bg-button"></span>

                    </span>
                  )}
                </div>

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
                      const id = request.id
                      const processing = !!(id && processingMap[id])
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={request.avatarUrl}
                              alt={request.nickname}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white">{request.nickname}</div>
                              {request.description && (
                                <div className="truncate text-xs text-white/60">{request.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptRequest(request)}
                              disabled={processing}
                              className={cn(
                                "grid h-9 w-9 place-items-center rounded-full transition-all",
                                "bg-button text-button-text-dark ",
                                "hover:-translate-y-0.5 ",
                                "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                              )}
                              aria-label={`Accept request from ${request.nickname}`}
                              title="Accept request"
                            >
                              {processing ? (
                                <FiLoader className="h-5 w-5 animate-spin" />
                              ) : (
                                <FiCheck className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeclineRequest(request)}
                              disabled={processing}
                              className={cn(
                                "grid h-9 w-9 place-items-center rounded-full border transition-all",
                                "border-red-500 bg-transparent text-red-500",
                                "hover:bg-red-500 hover:text-headline",
                                "disabled:cursor-not-allowed disabled:opacity-50"
                              )}
                              aria-label={`Decline request from ${request.nickname}`}
                              title="Decline request"
                            >
                              <FiX className="h-5 w-5" />
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
                      const id = request.id
                      const processing = !!(id && processingMap[id])
                      console.log(request)
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(31,30,43,0.95)] px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={request.avatarUrl}
                              alt={request.nickname}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                              <span className="truncate text-sm font-semibold text-headline">{request.nickname}</span>
                              {request.description && (
                                <div className="truncate text-xs text-white/60">{request.description}</div>
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
