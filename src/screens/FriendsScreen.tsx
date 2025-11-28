import { useEffect, useLayoutEffect, useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChatWindow from '../components/chat/ChatWindow'
import FriendsPanel from '../components/friends/FriendsPanel'
import { useChat } from '../components/chat/ChatProvider'
import { useFriends, type Friend } from '../components/friends/FriendsContext'
import ConfirmDialog from '../components/ConfirmDialog'
import { pfpImage } from '@assets/images'
import { useLobby } from '../components/lobby/LobbyContext'

const FriendsScreen: FC = () => {
  const { friendsById,friends, removeFriend } = useFriends()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentLobby, gameState,joinLobby } = useLobby()
  const initialFriendId =
    (location.state as { friendId?: string } | null)?.friendId ?? null

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(initialFriendId)
  const [removing, setRemoving] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'friends' | 'chat' | 'details'>(
    initialFriendId ? 'chat' : 'friends',
  )
  const {clearUnread,ensureConversation,getMessages,sendMessage,getTyping,sendTyping,loadMoreMessages,loadMessages,getHasMore} = useChat()
  const selectedFriend = useMemo(() => {
    if (!selectedFriendId) return null
    return friendsById[selectedFriendId]
  }, [friendsById, selectedFriendId])

  useEffect(() => {
    const state =
      (location.state as { friendId?: string, tab?: string } | null)
    if (state?.friendId) {
      setSelectedFriendId(state.friendId)
    }
    if (state?.tab && (state.tab === 'friends' || state.tab === 'chat' || state.tab === 'details')) {
      setActiveMobileTab(state.tab)
    }
  }, [location.state])

  useEffect(() => {
    if (!selectedFriendId && friends.length > 0) {
      setSelectedFriendId(friends[0].id)
    }
  }, [friends, selectedFriendId])

  useEffect(() => {
    if (!selectedFriend) return
    const id = selectedFriend.id
    clearUnread(id)
    ensureConversation(
      id,
      selectedFriend.nickname,
      selectedFriend.avatarUrl,
    )
    loadMessages(id)
  }, [clearUnread,ensureConversation,loadMessages, selectedFriend])

  const activeMessages = selectedFriend
  ? getMessages(selectedFriend.id)
  : []

  useLayoutEffect(() => {
    if (!selectedFriend) return
    if (activeMessages.length === 0) return
    clearUnread(selectedFriend.id)
  },[selectedFriend,activeMessages.length,clearUnread])

  const handleSend = async ({ text, attachment }: { text: string; attachment?: File }) => {
    if (!selectedFriend) return
    await sendMessage(selectedFriend.id, { text, attachment })
  }

  const handleSelectFriend = (friendId: string ) => {
    setSelectedFriendId(friendId)
    setActiveMobileTab('chat')
  }

  const handleRemoveRequest = () => {
    if (!selectedFriend) return
    setShowRemoveConfirm(true)
  }

  const handleConfirmRemove = async () => {
    if (!selectedFriend) return
    setRemoving(true)
    try {
      await removeFriend(selectedFriend.id)
      setSelectedFriendId(null)
      setShowRemoveConfirm(false)
    } catch (error) {
      console.error('Failed to remove friend', error)
    } finally {
      setRemoving(false)
    }
  }

  const handleCancelRemove = () => {
    if (removing) return
    setShowRemoveConfirm(false)
  }

  return (
    <div className="flex flex-col gap-4 bg-background px-6 py-8 text-white lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,320px)] h-[92dvh]">
      {currentLobby && (
        <div className="flex items-center justify-end md:hidden">
          <button
            type="button"
            onClick={() => navigate(gameState?.result === 'in_progress' ? '/lobby/ingame' : '/lobby')}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-background-secondary px-4 py-2 text-sm font-semibold text-headline transition hover:border-white/40 hover:bg-white/10"
          >
            {gameState?.result === 'in_progress' ? 'Back to game' : 'Return to lobby'}
          </button>
        </div>
      )}
      {/* Mobile tabs */}
      <div className="mb-4 lg:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/15 bg-white/5 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileTab === 'friends'}
            onClick={() => setActiveMobileTab('friends')}
            className={`rounded-xl px-3 py-2.5 text-base font-semibold transition-colors ${
              activeMobileTab === 'friends' ? 'bg-button text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Friends
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileTab === 'chat'}
            onClick={() => selectedFriend && setActiveMobileTab('chat')}
            disabled={!selectedFriend}
            className={`rounded-xl px-3 py-2.5 text-base font-semibold transition-colors ${
              activeMobileTab === 'chat' ? 'bg-button text-white' : 'text-white/70 hover:text-white'
            } ${!selectedFriend ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            Chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMobileTab === 'details'}
            onClick={() => selectedFriend && setActiveMobileTab('details')}
            disabled={!selectedFriend}
            className={`rounded-xl px-3 py-2.5 text-base font-semibold transition-colors ${
              activeMobileTab === 'details' ? 'bg-button text-white' : 'text-white/70 hover:text-white'
            } ${!selectedFriend ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            Details
          </button>
        </div>
      </div>

      <div className={`order-1 h-full w-full ${activeMobileTab === 'friends' ? 'block' : 'hidden'} lg:block`}>
        <FriendsPanel
          onFriendSelect={handleSelectFriend}
          title="Your Friends"
          className="h-full"
          selectedFriendId={selectedFriend?.id}
        />
      </div>
      <div
        className={`order-3 flex flex-col w-full h-full flex-1 min-h-0 ${
          activeMobileTab === 'chat' ? 'flex' : 'hidden'
        } lg:order-2 lg:flex`}
      >
        {selectedFriend ? (
          <>
            <ChatWindow
              messages={activeMessages}
              friendData={{
                id: selectedFriend.id,
                nickname: selectedFriend.nickname,
                avatarUrl: selectedFriend.avatarUrl
              }}
              hasMore={getHasMore(selectedFriend.id) ?? true}
              isTyping={getTyping(selectedFriend.id)}
              onSend={handleSend}
              onTyping={sendTyping}
              onLoadMore={() => loadMoreMessages(selectedFriend.id)}
            />
          </>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/15 bg-white/5 px-6 text-center">
            <p className="text-base font-medium text-white/80">Add some friends to start chatting.</p>
            <p className="mt-2 text-sm text-white/60">
              Your direct message history will appear here once you add someone to friends and pick them from the list.
            </p>
          </div>
        )}
      </div>
      <div
        className={`order-2 w-full h-full ${
          activeMobileTab === 'details' ? 'block' : 'hidden'
        } lg:order-3 lg:block`}
      >
        {selectedFriend ? (
          <FriendDetailsPanel 
          friend={selectedFriend} 
          onRemove={handleRemoveRequest} 
          removing={removing} 
          onLobbyJoin={selectedFriend.lobbyCode ? () => {
            if (selectedFriend.lobbyCode){
              joinLobby(selectedFriend.lobbyCode)
              navigate('/lobby')
            }
          }: undefined}
        />
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.85)] px-6 text-center text-sm text-white/60">
            Choose someone from the list to see their profile and quick actions.
          </div>
        )}
      </div>
      <ConfirmDialog
        open={showRemoveConfirm}
        title="Remove friend?"
        description={
          selectedFriend ? (
            <span>
              You are about to remove <strong>{selectedFriend.nickname}</strong> from your friends list.
            </span>
          ) : undefined
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        loading={removing}
      />
    </div>
  )
}

export default FriendsScreen

type FriendDetailsPanelProps = {
  friend: Friend
  onRemove: () => void
  onLobbyJoin?: () => void
  removing?: boolean
}

const FriendDetailsPanel: FC<FriendDetailsPanelProps> = ({ friend, onRemove,onLobbyJoin, removing }) => {
  // const joinedAt = useMemo(() => {
  //   try {
  //     return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
  //       new Date(friend.),
  //     )
  //   } catch {
  //     return null
  //   }
  // }, [friend.created_at])

  const statusInfo = useMemo(() => {
    const status = friend.userStatus;
    const gameName = friend.gameName;
    console.log(friend.description)

    switch (status) {
      case 'online':
        return {
          containerClass: 'bg-green-500/10 border-green-500/20 text-green-400',
          dotClass: 'bg-green-500',
          label: 'Online'
        }
      case 'in_game':
        return {
          containerClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          dotClass: 'bg-purple-500',
          label: gameName ? `Playing ${gameName}` : 'In Game'
        }
      case 'in_lobby':
        return {
          containerClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
          dotClass: 'bg-orange-500',
          label: 'In Lobby'
        }
      case 'offline':
      default:
        return {
          containerClass: 'bg-white/5 border-white/10 text-white/40',
          dotClass: 'bg-white/40',
          label: 'Offline'
        }
    }
  }, [friend.userStatus, friend.gameName])

  return (
    <aside className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-background-secondary">
      <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
        <img
          src={friend.avatarUrl || pfpImage}
          alt={friend.nickname}
          className="h-20 w-20 rounded-full border border-white/10 object-cover shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        />
        <h2 className="mt-4 text-xl font-semibold text-headline">{friend.nickname}</h2>

        <span className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.containerClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`} />
          {statusInfo.label}
        </span>

      </div>

      <div className="px-6 py-4">
        <p className="text-sm leading-relaxed text-white/70">
          {friend.description === null ? 'This player has not added a profile note yet.': friend.description}
        </p>
      </div>

      <div className="mt-auto space-y-3 px-6 pb-6 pt-2">
        {onLobbyJoin && (
          <button
            type="button"
            onClick={onLobbyJoin}
            className="w-full rounded-full border border-button px-4 py-3 text-sm font-semibold text-button transition hover:text-headline hover:bg-button disabled:opacity-60 disabled:hover:border-white/20"
          >
            Join to lobby
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="w-full rounded-full border border-red-500/50 px-4 py-3 text-sm font-semibold text-red-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-60"
          disabled={removing}
        >
          {removing ? 'Removing...' : 'Remove from Friends'}
        </button>
      </div>
    </aside>
  )
}
