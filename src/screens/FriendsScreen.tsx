import { useEffect, useMemo, useState, type FC } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import FriendsPanel from '../components/friends/FriendsPanel'
import { useAuth } from '../components/AuthContext'
import { useChat } from '../components/chat/ChatProvider'
import BackButton from '../components/BackButton'
import { useFriends } from '../components/friends/FriendsContext'
import type { Friendship } from '../services/friends'

const currentUserIdFallback = 'current-user'
const normalizeId = (value: string | number) => String(value)

const FriendsScreen: FC = () => {
  const { friends, removeFriend } = useFriends()
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  const { user } = useAuth()
  const chat = useChat()
  const selectedFriend = useMemo(() => {
    if (!selectedFriendId) return null
    return friends.find((friend) => normalizeId(friend.friend_user_id) === selectedFriendId) ?? null
  }, [friends, selectedFriendId])

  useEffect(() => {
    if (!selectedFriend && friends.length > 0) {
      setSelectedFriendId(normalizeId(friends[0].friend_user_id))
    }
  }, [friends, selectedFriend])

  useEffect(() => {
    if (!selectedFriend) return
    const id = normalizeId(selectedFriend.friend_user_id)
    chat.ensureConversation({
      id,
      nickname: selectedFriend.friend_nickname,
      avatarUrl: selectedFriend.friend_pfp_path,
    })
  }, [chat, selectedFriend])

  const activeMessages = useMemo(() => {
    if (!selectedFriend) return []
    return chat.getMessages(normalizeId(selectedFriend.friend_user_id))
  }, [chat, selectedFriend])

  const handleSend = async ({ text }: { text: string; attachment?: File | null }) => {
    if (!selectedFriend) return
    await chat.sendMessage(normalizeId(selectedFriend.friend_user_id), text)
  }

  const handleSelectFriend = (friend: Friendship) => {
    setSelectedFriendId(normalizeId(friend.friend_user_id))
  }

  const handleRemoveFriend = async () => {
    if (!selectedFriend) return
    setRemoving(true)
    try {
      await removeFriend(selectedFriend.friend_user_id)
      setSelectedFriendId(null)
    } catch (error) {
      console.error('Failed to remove friend', error)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-6rem)] flex-col gap-6 bg-[#0f0e17] px-6 py-8 text-white lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,320px)]">
      <div className="order-1 w-full">
        <FriendsPanel
          onFriendSelect={handleSelectFriend}
          title="Your Friends"
          className="h-full"
          selectedFriendId={selectedFriend?.friend_user_id}
        />
      </div>
      <div className="order-3 flex w-full h-full flex-1 flex-col min-h-0 gap-4 lg:order-2">
        {selectedFriend ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
              </div>
              <BackButton label='Go back'>
              </BackButton>
            </div>

            <ChatWindow
              title={selectedFriend.friend_nickname}
              messages={activeMessages}
              currentUserId={user?.id != null ? String(user.id) : currentUserIdFallback}
              allowAttachments
              onSend={handleSend}
              placeholder="Send a direct message..."
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
      <div className="order-2 w-full lg:order-3">
        {selectedFriend ? (
          <FriendDetailsPanel
            friend={selectedFriend}
            onRemove={handleRemoveFriend}
            removing={removing}
          />
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.85)] px-6 text-center text-sm text-white/60">
            Choose someone from the list to see their profile and quick actions.
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsScreen

type FriendDetailsPanelProps = {
  friend: Friendship
  onRemove: () => Promise<void> | void
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
