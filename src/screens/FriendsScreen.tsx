import { useMemo, useState, type FC } from 'react'
import ChatWindow, { type ChatMessage } from '../components/friends/ChatWindow'
import FriendsPanel from '../components/friends/FriendsPanel'
import type { FriendProps } from '../components/friends/FriendCard'

const currentUserId = 'current-user'

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

const dmConversations: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'd1',
      senderId: '1',
      senderName: 'Alicia Frost',
      content: 'Ready for the match later?',
      createdAt: new Date()
    },
    {
      id: 'd2',
      senderId: currentUserId,
      senderName: 'You',
      content: 'Absolutely. Want to review strategies?',
      createdAt: new Date()
    }
  ],
  '2': [
    {
      id: 'd3',
      senderId: '2',
      senderName: 'Brandon Rivers',
      content: 'GGs earlier!',
      createdAt: new Date()
    }
  ],
  '5': [
    {
      id: 'd4',
      senderId: '5',
      senderName: 'Evelyn Park',
      content: 'Lobby is ready whenever you are!',
      createdAt: new Date()
    }
  ]
}

const FriendsScreen: FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<FriendProps | null>(friendsMock[0] ?? null)

  const selectedFriendKey = selectedFriend ? String(selectedFriend.id ?? selectedFriend.nickname) : undefined

  const activeMessages = useMemo<ChatMessage[]>(() => {
    if (!selectedFriendKey) {
      return []
    }
    return dmConversations[selectedFriendKey] ?? []
  }, [selectedFriendKey])

  const handleSend = async ({ text, attachment }: { text: string; attachment?: File | null }) => {
    if (!selectedFriendKey || !selectedFriend) {
      return
    }

    console.log('Sending direct message', {
      friendId: selectedFriendKey,
      friendName: selectedFriend.nickname,
      text,
      attachment
    })
  }

  const handleSelectFriend = (friend: FriendProps) => {
    setSelectedFriend(friend)
  }

  const handleRemoveFriend = () => {
    if (!selectedFriendKey || !selectedFriend) {
      return
    }
    console.log('Removing friend', { friendId: selectedFriendKey, friendName: selectedFriend.nickname })
    setSelectedFriend(null)
  }

  const handleJoinLobby = () => {
    if (!selectedFriend) {
      return
    }
    if (selectedFriend.lobbyId) {
      console.log('Joining lobby', { lobbyId: selectedFriend.lobbyId, host: selectedFriend.nickname })
    }
  }

  const handleReportFriend = () => {
    if (!selectedFriendKey || !selectedFriend) {
      return
    }
    console.log('Reporting friend', { friendId: selectedFriendKey, friendName: selectedFriend.nickname })
  }

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
      <div className="order-3 flex w-full flex-1 flex-col gap-4 lg:order-2">
        {selectedFriend ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Chat with {selectedFriend.nickname}</h1>
                <p className="text-sm text-white/60">Direct messages support attachments and voice invites.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFriend(null)}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-orange-400/50 hover:text-orange-200"
              >
                Close chat
              </button>
            </div>

            <ChatWindow
              title={selectedFriend.nickname}
              messages={activeMessages}
              currentUserId={currentUserId}
              allowAttachments
              onSend={handleSend}
              typingUsers={['Typing...']}
              placeholder="Send a direct message..."
            />
          </>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/15 bg-white/5 px-6 text-center">
            <p className="text-base font-medium text-white/80">Select a friend to start chatting.</p>
            <p className="mt-2 text-sm text-white/60">
              Your direct message history will appear here once you pick someone from the list.
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
    friend.favoriteGame ? { label: 'Favourite Game', value: friend.favoriteGame } : null,
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
