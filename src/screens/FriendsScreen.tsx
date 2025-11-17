import { useEffect, useMemo, useState, type FC } from 'react'
import { useLocation } from 'react-router-dom'
import ChatWindow from '../components/chat/ChatWindow'
import FriendsPanel from '../components/friends/FriendsPanel'
import { useAuth } from '../components/AuthContext'
import { useChat } from '../components/chat/ChatProvider'
import { useFriends } from '../components/friends/FriendsContext'
import type { Friendship } from '../services/friends'
import ConfirmDialog from '../components/ConfirmDialog'

const currentUserIdFallback = 'current-user'
const normalizeId = (value: string | number) => String(value)

const FriendsScreen: FC = () => {
  const { friends, removeFriend } = useFriends()
  const location = useLocation()
  const initialFriendId =
    (location.state as { friendId?: string } | null)?.friendId ?? null

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(initialFriendId)
  const [removing, setRemoving] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'friends' | 'chat' | 'details'>(
    initialFriendId ? 'chat' : 'friends',
  )

  const { user } = useAuth()
  const {clearUnread,ensureConversation,getMessages,sendMessage,getTypingUsers,sendTyping} = useChat()
  const selectedFriend = useMemo(() => {
    if (!selectedFriendId) return null
    return friends.find((friend) => normalizeId(friend.friend_user_id) === selectedFriendId) ?? null
  }, [friends, selectedFriendId])

  useEffect(() => {
    const friendIdFromState =
      (location.state as { friendId?: string } | null)?.friendId
    if (friendIdFromState) {
      setSelectedFriendId(String(friendIdFromState))
      setActiveMobileTab('chat')
    }
  }, [location.state])

  useEffect(() => {
    if (!selectedFriendId && friends.length > 0) {
      setSelectedFriendId(normalizeId(friends[0].friend_user_id))
    }
  }, [friends, selectedFriendId])

  useEffect(() => {
    if (!selectedFriend) return
    const id = normalizeId(selectedFriend.friend_user_id)
    clearUnread(id)
    ensureConversation({
      id,
      nickname: selectedFriend.friend_nickname,
      avatarUrl: selectedFriend.friend_pfp_path,
    })
  }, [clearUnread,ensureConversation, selectedFriend])

  const activeMessages = selectedFriend
  ? getMessages(normalizeId(selectedFriend.friend_user_id))
  : []

  const handleSend = async ({ text, attachment }: { text: string; attachment?: File | null }) => {
    if (!selectedFriend) return
    await sendMessage(normalizeId(selectedFriend.friend_user_id), { text, attachment })
  }

  const handleSelectFriend = (friendId: string | number) => {
    setSelectedFriendId(normalizeId(friendId))
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
      await removeFriend(selectedFriend.friend_user_id)
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
    <div className="flex h-full flex-col gap-6 bg-[#0f0e17] px-6 py-8 text-white lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,320px)]">
      {/* Mobile tabs */}
      <div className="mb-4 flex lg:hidden">
        <button
          type="button"
          onClick={() => setActiveMobileTab('friends')}
          className={`flex-1 rounded-l-2xl text-sm font-semibold transition ${
            activeMobileTab === 'friends' ? 'bg-button text-headline' : 'bg-white/10 text-white/70'
          }`}
        >
          Friends
        </button>
        <button
          type="button"
          onClick={() => selectedFriend && setActiveMobileTab('chat')}
          disabled={!selectedFriend}
          className={`flex-1 text-sm font-semibold transition ${
            activeMobileTab === 'chat' ? 'bg-button text-headline' : 'bg-white/10 text-white/70'
          } ${!selectedFriend ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => selectedFriend && setActiveMobileTab('details')}
          disabled={!selectedFriend}
          className={`flex-1 rounded-r-2xl py-2 text-sm font-semibold transition ${
            activeMobileTab === 'details' ? 'bg-button text-headline' : 'bg-white/10 text-white/70'
          } ${!selectedFriend ? 'cursor-not-allowed opacity-40' : ''}`}
        >
          Details
        </button>
      </div>

      <div className={`order-1 w-full ${activeMobileTab === 'friends' ? 'block' : 'hidden'} lg:block`}>
        <FriendsPanel
          onFriendSelect={handleSelectFriend}
          title="Your Friends"
          className="h-full"
          selectedFriendId={selectedFriend?.friend_user_id}
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
              title={selectedFriend.friend_nickname}
              messages={activeMessages}
              currentUserId={user?.id != null ? String(user.id) : currentUserIdFallback}
              friendId={normalizeId(selectedFriend.friend_user_id)}
              friendAvatar={selectedFriend.friend_pfp_path}
              allowAttachments
              typingUsers={getTypingUsers(normalizeId(selectedFriend.friend_user_id))}
              onSend={handleSend}
              placeholder="Send a direct message..."
              onTyping={sendTyping}
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
        className={`order-2 w-full ${
          activeMobileTab === 'details' ? 'block' : 'hidden'
        } lg:order-3 lg:block`}
      >
        {selectedFriend ? (
          <FriendDetailsPanel friend={selectedFriend} onRemove={handleRemoveRequest} removing={removing} />
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
              You are about to remove <strong>{selectedFriend.friend_nickname}</strong> from your friends list.
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
  friend: Friendship
  onRemove: () => void
  removing?: boolean
}

const FriendDetailsPanel: FC<FriendDetailsPanelProps> = ({ friend, onRemove, removing }) => {
  const joinedAt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(friend.created_at),
      )
    } catch {
      return null
    }
  }, [friend.created_at])

  return (
    <aside className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.98)]">
      <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
        <img
          src={friend.friend_pfp_path || '/assets/images/pfp.png'}
          alt={friend.friend_nickname}
          className="h-20 w-20 rounded-full border border-white/10 object-cover shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        />
        <h2 className="mt-4 text-xl font-semibold text-white">{friend.friend_nickname}</h2>
        <span className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
          Friend
        </span>
        {joinedAt && (
          <span className="mt-1 text-xs text-white/50">Friends since {joinedAt}</span>
        )}
      </div>

      <div className="px-6 py-4">
        <p className="text-sm leading-relaxed text-white/70">
          {friend.friend_description || 'This player has not added a profile note yet.'}
        </p>
      </div>

      <div className="mt-auto space-y-3 px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={onRemove}
          className="w-full rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-red-400/60 hover:text-red-200 disabled:opacity-60 disabled:hover:border-white/20"
          disabled={removing}
        >
          {removing ? 'Removing...' : 'Remove from Friends'}
        </button>
      </div>
    </aside>
  )
}
