import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getFriendsList,
  searchFriends,
  sendFriendRequest,
  type Friendship,
  type SearchFriendsPayload,
} from '../../services/friends'
import { useAuth } from '../AuthContext'

type FriendsContextValue = {
  isLoading: boolean
  friendships: Friendship[]
  friends: Friendship[]
  incomingRequests: Friendship[]
  outgoingRequests: Friendship[]
  refreshFriends: () => Promise<void>
  sendRequest: (friend_user_id: number | string) => Promise<void>
  acceptRequest: (friend_user_id: number | string) => Promise<void>
  declineRequest: (friend_user_id: number | string) => Promise<void>
  removeFriend: (friend_user_id: number | string) => Promise<void>
  searchUsers: (query: string, page?: number, pageSize?: number) => Promise<SearchFriendsPayload>
}

const FriendsContext = createContext<FriendsContextValue | undefined>(undefined)

const normalizeId = (value: number | string) => String(value)

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const {isAuthenticated} = useAuth()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshFriends = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getFriendsList()
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.friendships)
        ? ((data as any).friendships as Friendship[])
        : []
      setFriendships(normalized)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setFriendships([])
      setIsLoading(false)
      return
    }
    void refreshFriends()
  }, [isAuthenticated, refreshFriends])

  const upsertFriendship = useCallback((entry: Friendship) => {
    setFriendships((prev) => {
      const key = normalizeId(entry.friendship_id ?? entry.friend_user_id)
      const idx = prev.findIndex(
        (item) => normalizeId(item.friendship_id ?? item.friend_user_id) === key,
      )
      if (idx === -1) {
        return [...prev, entry]
      }
      const copy = [...prev]
      copy[idx] = entry
      return copy
    })
    refreshFriends()
  }, [])

  const removeFriendship = useCallback((friend_user_id: number | string) => {
    const key = normalizeId(friend_user_id)
    setFriendships((prev) =>
      prev.filter((item) => normalizeId(item.friend_user_id) !== key),
    )
  }, [])

  const sendRequestHandler = useCallback(async (friend_user_id: number | string) => {
    await sendFriendRequest(friend_user_id)
    refreshFriends()
  }, [upsertFriendship])

  const acceptRequestHandler = useCallback(async (friend_user_id: number | string) => {
    await acceptFriendRequest(friend_user_id)
    refreshFriends()
  }, [upsertFriendship])

  const declineRequestHandler = useCallback(async (friend_user_id: number | string) => {
    await declineFriendRequest(friend_user_id)
    removeFriendship(friend_user_id)
  }, [removeFriendship])

  const removeFriendHandler = useCallback(async (friend_user_id: number | string) => {
    await deleteFriend(friend_user_id)
    removeFriendship(friend_user_id)
  }, [removeFriendship])

  const searchUsersHandler = useCallback(
    (query: string, page?: number, pageSize?: number) =>
      searchFriends(query, page ?? 1, pageSize ?? 20),
    [],
  )

  const { friends, incomingRequests, outgoingRequests } = useMemo(() => {
    const accepted: Friendship[] = []
    const incoming: Friendship[] = []
    const outgoing: Friendship[] = []

    friendships.forEach((entry) => {
      if (entry.status === 'accepted') {
        accepted.push(entry)
      } else if (entry.status === 'pending') {
        if (entry.is_requester) {
          outgoing.push(entry)
        } else {
          incoming.push(entry)
        }
      }
    })

    console.log({ accepted, incoming, outgoing })
    return {
      friends: accepted,
      incomingRequests: incoming,
      outgoingRequests: outgoing,
    }
  }, [friendships])

  const value: FriendsContextValue = useMemo(
    () => ({
      isLoading,
      friendships,
      friends,
      incomingRequests,
      outgoingRequests,
      refreshFriends,
      sendRequest: sendRequestHandler,
      acceptRequest: acceptRequestHandler,
      declineRequest: declineRequestHandler,
      removeFriend: removeFriendHandler,
      searchUsers: searchUsersHandler,
    }),
    [
      acceptRequestHandler,
      declineRequestHandler,
      friends,
      friendships,
      incomingRequests,
      isLoading,
      outgoingRequests,
      refreshFriends,
      removeFriendHandler,
      searchUsersHandler,
      sendRequestHandler,
    ],
  )

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
}

export const useFriends = () => {
  const ctx = useContext(FriendsContext)
  if (!ctx) {
    throw new Error('useFriends must be used within FriendsProvider')
  }
  return ctx
}
