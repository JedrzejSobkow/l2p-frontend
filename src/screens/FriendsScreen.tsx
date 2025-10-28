import { useMemo, useState, type FC, useEffect } from 'react'
import ChatWindow, { type ChatMessage } from '../components/chat/ChatWindow'
import FriendsPanel from '../components/friends/FriendsPanel'
import type { FriendProps } from '../components/friends/FriendCard'
import { useAuth } from '../components/AuthContext'
import { useChat } from '../components/chat/ChatProvider'
import BackButton from '../components/BackButton'

const currentUserIdFallback = 'current-user'

const friendsMock: FriendProps[] = [
  {
    id: '1',
    nickname: 'Alicia Frost',
    status: 'Online',
    description: 'Support main who loves strategy games and late-night ranked sessions.',
    avatarUrl: '/assets/images/pfp.png',
    rank: 'Diamond II',
    favoriteGame: 'Legends of Aether'
  },
  {
    id: '2',
    nickname: 'Brandon Rivers',
    status: 'Playing',
    description: 'Tactical shot-caller and team captain of our weekend squad.',
    avatarUrl: '/assets/images/pfp.png',
    rank: 'Platinum I',
    favoriteGame: 'Valor Siege'
  },
  {
    id: '3',
    nickname: 'Carmen Lee',
    status: 'Offline',
    description: 'Analyst, content creator, and certified achievement hunter.',
    avatarUrl: '/assets/images/pfp.png',
    rank: 'Gold III',
    favoriteGame: 'Starfarer Tactics'
  },
  {
    id: '4',
    nickname: 'Diego Martinez',
    status: 'Offline',
    description: 'Exploration-focused player with a knack for discovering secrets.',
    avatarUrl: '/assets/images/pfp.png',
    rank: 'Silver I',
    favoriteGame: 'Eclipse Frontier'
  },
  {
    id: '5',
    nickname: 'Evelyn Park',
    status: 'In Lobby',
    description: 'Our strategist. Always sets up the next lobby and keeps us coordinated.',
    avatarUrl: '/assets/images/pfp.png',
    rank: 'Immortal',
    favoriteGame: 'Valor Siege',
    lobbyId: 'LV-48219'
  }
]

const FriendsScreen: FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<FriendProps | null>(friendsMock[0] ?? null)

  const { user } = useAuth()
  const chat = useChat()
  const selectedFriendKey = selectedFriend ? String(selectedFriend.id ?? selectedFriend.nickname) : undefined

  useEffect(() => {
    if (selectedFriendKey && selectedFriend) {
      chat.ensureConversation({ id: selectedFriendKey, nickname: selectedFriend.nickname, avatarUrl: selectedFriend.avatarUrl })
    }
  }, [selectedFriendKey])

  const activeMessages = useMemo<ChatMessage[]>(() => {
    if (!selectedFriendKey) return []
    return chat.getMessages(selectedFriendKey) ?? []
  }, [selectedFriendKey, chat])

  const handleSend = async ({ text }: { text: string; attachment?: File | null }) => {
    if (!selectedFriendKey) return
    chat.sendMessage(selectedFriendKey, text)
  }

  const handleSelectFriend = (friend: FriendProps) => setSelectedFriend(friend)
  const handleRemoveFriend = () => {
    if (!selectedFriendKey || !selectedFriend) return
    console.log('Removing friend', { friendId: selectedFriendKey, friendName: selectedFriend.nickname })
  }
  const handleJoinLobby = () => { console.log('Join lobby') }
  const handleReportFriend = () => { console.log('Report friend') }

  return (
    <div className="flex h-full min-h-[calc(100vh-6rem)] flex-col gap-6 bg-[#0f0e17] px-6 py-8 text-white lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,320px)]">
      <div className="order-1 w-full">
        <FriendsPanel
          friends={friendsMock}
          onFriendSelect={handleSelectFriend}
          title="Your Friends"
          className="h-full"
          selectedFriendId={selectedFriend?.id}
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
              title={selectedFriend.nickname}
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
            onJoinLobby={handleJoinLobby}
            onReport={handleReportFriend}
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
  friend: FriendProps
  onRemove: () => void
  onJoinLobby: () => void
  onReport: () => void
}

const FriendDetailsPanel: FC<FriendDetailsPanelProps> = ({ friend, onRemove, onJoinLobby, onReport }) => {
  const normalizedStatus = (friend.status || 'Offline').trim()
  const statusStyles =
    normalizedStatus === 'Online'
      ? 'bg-green-500/20 text-green-200'
      : normalizedStatus === 'Offline'
      ? 'bg-white/15 text-white/60'
      : 'bg-orange-500/20 text-orange-200'

  const metaData = [
    friend.rank ? { label: 'Rank', value: friend.rank } : null,
    // friend.favoriteGame ? { label: 'Favourite Game', value: friend.favoriteGame } : null,
    friend.lobbyId && normalizedStatus === 'In Lobby'
      ? { label: 'Lobby', value: `#${friend.lobbyId}` }
      : null
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  const showJoinLobby = normalizedStatus === 'In Lobby' && Boolean(friend.lobbyId)

  return (
    <aside className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.98)]">
      <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
        <img
          src={friend.avatarUrl || '/assets/images/pfp.png'}
          alt={friend.nickname}
          className="h-20 w-20 rounded-full border border-white/10 object-cover shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
        />
        <h2 className="mt-4 text-xl font-semibold text-white">{friend.nickname}</h2>
        <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}>
          {normalizedStatus}
        </span>
      </div>

      <div className="px-6 py-4">
        <p className="text-sm leading-relaxed text-white/70">
          {friend.description || 'This player has not added a profile note yet.'}
        </p>

        {metaData.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            {metaData.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-white/50">{item.label}</span>
                <span className="font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3 px-6 pb-6 pt-2">
        {showJoinLobby && (
          <button
            type="button"
            onClick={onJoinLobby}
            className="w-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(255,149,0,0.35)] transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
          >
            Join Lobby
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="w-full rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-red-400/60 hover:text-red-200"
        >
          Remove from Friends
        </button>
        <button
          type="button"
          onClick={onReport}
          className="w-full rounded-full border border-transparent px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-red-500/40 hover:text-red-200"
        >
          Report User
        </button>
      </div>
    </aside>
  )
}
