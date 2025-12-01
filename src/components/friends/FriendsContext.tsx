import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { pfpImage } from '@/assets/images'
import {
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getFriendsList,
  getFriendStatus,
  searchFriends,
  sendFriendRequest,
  type FriendResult,
  type Friendship,
  type FriendshipStatus,
  type SearchFriendsPayload,
} from '@/services/friends'
import { useAuth } from '../AuthContext'
import { 
  connectChatSocket, 
  offConversationUpdated, 
  offFriendRemoved, 
  offFriendRequestReceived, 
  offFriendStatusUpdated, 
  onConversationUpdated, 
  onFriendRemoved, 
  onFriendRequestReceived, 
  onFriendStatusUpdated, 
  getInitialChats,
  type UserStatus, 
  type ConversationUpdatedEvent,
  type FriendRequestReceivedPayload,
  type FriendStatusUpdatePayload,
  onInitialFriendStatuses,
  type Conversation,
  offInitialFriendStatuses,
  onFriendRequestAccepted,
  type FriendRequestAccepted,
  offFriendRequestAccepted
} from '@/services/chat'
import { useGlobalError } from '../GlobalErrorContext'
import { usePopup } from '../PopupContext'

export type Friend = {
  id: string,
  nickname: string,
  avatarUrl: string,
  description: string | null,
  friendShipStatus: FriendshipStatus,
  isRequester: boolean,
  userStatus?: UserStatus,
  lastMessageTime?: string,
  lastMessageIsMine?: boolean,
  lastMessageContent?: string,
  unreadCount?: number,
  gameName?: string,
  lobbyCode?: string,
  lobbyFilledSlots?: number,
  lobbyMaxSlots?: number,
}

type FriendsState = {
  friendsById: Record<string, Friend>
}

type FriendsContextValue = {
  isLoading: boolean
  friendsById: Record<string, Friend>
  friends: Friend[]
  incomingRequests: Friend[]
  outgoingRequests: Friend[]
  processingMap?: Record<string, boolean>
  sendRequest: (user: FriendResult) => Promise<void>
  acceptRequest: (friendId: number | string) => Promise<void>
  declineRequest: (friendId: number | string) => Promise<void>
  removeFriend: (friendId: number | string) => Promise<void>
  searchUsers: (query: string, page?: number, pageSize?: number) => Promise<SearchFriendsPayload>
}

const FriendsContext = createContext<FriendsContextValue | undefined>(undefined)

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const {isAuthenticated} = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [state, setState] = useState<FriendsState>({ friendsById: {} })
  const { triggerError } = useGlobalError()
  const {showPopup} = usePopup()
  const [processingMap, setProcessingMap] = useState<Record<string, boolean>>({})

  const markProcessing = (id: string, value: boolean) => {
    setProcessingMap((prev) => ({ ...prev, [id]: value }))
  }

  const handleInitialFriendStatuses = useCallback((payload:{statuses:  FriendStatusUpdatePayload[]}) => {
    if (!Array.isArray(payload.statuses)) return
    payload.statuses.forEach((friend) => {
      const key = String(friend.user_id)
      setState((prev) => ({
        friendsById: {
          ...prev.friendsById,
          [key]: {
            ...prev.friendsById[key],
            id: key,
            userStatus: friend.status as UserStatus,
            gameName: friend.game_name,
            lobbyCode: friend.lobby_code,
            lobbyFilledSlots: friend.lobby_filled_slots,
            lobbyMaxSlots: friend.lobby_max_slots,
          }
        },
      }))
  })
},[])

  const loadInitialConversations = useCallback(async () => {
    console.log('Loading initial conversations...')
    try {
      const data = await getInitialChats(100)
      const normalized = Array.isArray(data.conversations)
      ? data.conversations
      : Array.isArray((data as any)?.conversations)
      ? ((data as any).conversations as Conversation[])
      : []

      normalized.forEach((conversation) => {
        const friendId = String(conversation.friend_id)
        setState((prev) => ({
          friendsById: {
            ...prev.friendsById,
            [friendId]: {
              ...prev.friendsById[friendId],
              lastMessageTime: conversation.last_message_time,
              lastMessageContent: conversation.last_message_content ?? '',
              lastMessageIsMine: conversation.last_message_is_mine,
              unreadCount: conversation.unread_count,
            }
          },
        }))
      })
    } catch (error) {
      console.error('Error fetching initial conversations:', error)
    }
  }, [])

  const loadInitialFriendships = useCallback(async () => {
    try {
      const data = await getFriendsList()
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.friendships)
        ? ((data as any).friendships as Friendship[])
        : []
      normalized.forEach((friendShip) => {
        const friend: Friend = {
          id: String(friendShip.friend_user_id),
          nickname: String(friendShip.friend_nickname),
          avatarUrl: friendShip.friend_pfp_path || pfpImage,
          description: friendShip.friend_description,
          friendShipStatus: friendShip.status,
          isRequester: Boolean(friendShip.is_requester),
        }
        setState((prev) => ({
          friendsById: {
            ...prev.friendsById,
            [friend.id]: {
              ...prev.friendsById[friend.id],
              ...
              friend},
          },
        }))
      })
    } catch (error) {
      console.error('Error fetching friends list:', error)
    }
  }, [])

  const handleConversationUpdated = useCallback((payload: ConversationUpdatedEvent) => {
    const friendId = String(payload.friend_id)
    setState((prev) => ({
      friendsById: {
        ...prev.friendsById,
        [friendId]: {
          ...prev.friendsById[friendId],
          nickname: payload.friend_nickname,
          lastMessageTime: payload.last_message_time,
          lastMessageContent: payload.last_message_content ?? '',
          lastMessageIsMine: payload.last_message_is_mine,
          unreadCount: (prev.friendsById[friendId]?.unreadCount || 0) + (payload.last_message_is_mine ? 0 : 1),
        }
      },
    }))
  }, [])

  const handleFriendRemoved = useCallback((payload: { friend_id: number | string }) => {
    const key = String(payload.friend_id)
    setState((prev) => {
      const newFriendsById = { ...prev.friendsById }
      delete newFriendsById[key]
      return { friendsById: newFriendsById }
    })
  }, [])

  const handleFriendRequestReceived = useCallback((payload: FriendRequestReceivedPayload) => {
    const key = String(payload.sender_id)
    setState((prev) => ({
      friendsById: {
        ...prev.friendsById,
        [key]: {
          ...prev.friendsById[key],
          id: key,
          nickname: payload.sender_nickname,
          avatarUrl: payload.sender_pfp_path || pfpImage,
          friendShipStatus: 'pending',
          isRequester: false,
        }
      },
    }))
    showPopup({ type: 'informative', message: `New friend request from ${payload.sender_nickname}.` })
  }, [])

  const handleFriendStatusUpdated = useCallback((payload: FriendStatusUpdatePayload) => {
    const key = String(payload.user_id)
    setState((prev) => ({
      friendsById: {
        ...prev.friendsById,
        [key]: {
          ...prev.friendsById[key],
          id: key,
          userStatus: payload.status as UserStatus,
          gameName: payload.game_name,
          lobbyCode: payload.lobby_code,
          lobbyFilledSlots: payload.lobby_filled_slots,
          lobbyMaxSlots: payload.lobby_max_slots,
        }
      },
    }))
  }, [])

  // const removeFriendship = useCallback((friend_user_id: number | string) => {
  //   const key = String(friend_user_id)
  //   setState((prev) => {
  //     const newFriendsById = { ...prev.friendsById }
  //     delete newFriendsById[key]
  //     return { friendsById: newFriendsById }
  //   })

  // }, [])

  const sendRequestHandler = useCallback(async (user: FriendResult) => {
    const { user_id: friendId, nickname, pfp_path: avatarUrl, description } = user
    const key = String(friendId)
    markProcessing(key, true)
    try {
      await sendFriendRequest(key)
      setState((prev) => ({
      friendsById: {
        ...prev.friendsById,
        [key]: {
          ...prev.friendsById[key],
          id: key,
          nickname: nickname,
          avatarUrl: avatarUrl || pfpImage,
          friendShipStatus: 'pending',
          isRequester: true,
          description: description || null,
        }
      },
    }))
      showPopup({ type: 'confirmation', message: `Friend request sent to ${nickname}.` })
    } catch (error: any) {
      showPopup({ type: 'error', message: error.message || 'Failed to send friend request. Please try again later.' })
      throw error
    } finally {
      markProcessing(key, false)
    }
  }, [])

  const acceptRequestHandler = useCallback(async (friend_user_id: number | string) => {
    const key = String(friend_user_id)
    try {
      markProcessing(key, true)
      await acceptFriendRequest(key)
      const status = await getFriendStatus(key)
      setState((prev) => ({
        friendsById: {
          ...prev.friendsById,
          [key]: {
            ...prev.friendsById[key],
            friendShipStatus: 'accepted',
            isRequester: false,
            userStatus: status.status as UserStatus,
            gameName: status.game_name,
            lobbyCode: status.lobby_code,
            lobbyFilledSlots: status.lobby_filled_slots,
            lobbyMaxSlots: status.lobby_max_slots,
          }
        },    
      }))
      showPopup({ type: 'confirmation', message: 'Friend request accepted.' })
    } catch (error) {
      showPopup({ type: 'error', message: 'Failed to accept friend request. Please try again later.' })
    } finally {
      markProcessing(key, false)
    }  
  }, [])

  const declineRequestHandler = useCallback(async (friend_user_id: number | string) => {
    const key = String(friend_user_id)
    try {
      markProcessing(key, true)
      await declineFriendRequest(friend_user_id)
      setState((prev) => {
        const newFriendsById = { ...prev.friendsById }
        delete newFriendsById[key]
        return { friendsById: newFriendsById }
      })
      
      showPopup({ type: 'confirmation', message: 'Friend request declined.' })
    } catch (error) {
      showPopup({ type: 'error', message: 'Failed to decline friend request. Please try again later.' })
      
    } finally {
      markProcessing(key, false)

    }
  }, [])

  const removeFriendHandler = useCallback(async (friend_user_id: number | string) => {
    try {
      await deleteFriend(friend_user_id)
      showPopup({ type: 'confirmation', message: 'Friend removed successfully.' })
      setState((prev) => {
        const key = String(friend_user_id)
        const newFriendsById = { ...prev.friendsById }
        delete newFriendsById[key]
        return { friendsById: newFriendsById }
      })
    }
    catch (error) {
      showPopup({ type: 'error', message: 'Failed to remove friend. Please try again later.' })
      throw error
    }
  }, [])

  const handleFriendRequestAccepted = useCallback(async (payload: FriendRequestAccepted) => {
    const key = String(payload.accepter_id)
    try {
      const friendStatus = await getFriendStatus(key)
      setState((prev) => ({
        friendsById: {
          ...prev.friendsById,
          [key]: {
            ...prev.friendsById[key],
            id: key,
            nickname: payload.accepter_nickname,
            avatarUrl: payload.accepter_pfp_path || pfpImage,
            friendShipStatus: 'accepted',
            isRequester: false,
            userStatus: friendStatus.status as UserStatus,
            gameName: friendStatus.game_name,
            lobbyCode: friendStatus.lobby_code,
            lobbyFilledSlots: friendStatus.lobby_filled_slots,
            lobbyMaxSlots: friendStatus.lobby_max_slots,
          }
        },
      }))
    } catch (error) {
      setState((prev) => ({
        friendsById: {
          ...prev.friendsById,
          [key]: {
            ...prev.friendsById[key],
            id: key,
            nickname: payload.accepter_nickname,
            avatarUrl: payload.accepter_pfp_path || pfpImage,
            friendShipStatus: 'accepted',
            isRequester: false,
          }
        },
      }))
    } finally {
      showPopup({ type: 'confirmation', message: `${payload.accepter_nickname} accepted your friend request.` })
    }
  }, [])

  const searchUsersHandler = useCallback(
    (query: string, page?: number, pageSize?: number) =>
      searchFriends(query, page ?? 1, pageSize ?? 20),
    [],
  )

  const { friends, incomingRequests, outgoingRequests } = useMemo(() => {
    const accepted: Friend[] = []
    const incoming: Friend[] = []
    const outgoing: Friend[] = []

    Object.values(state.friendsById).forEach((friend) => {
      if (friend.friendShipStatus === 'accepted') {
        accepted.push(friend)
      } else if (friend.friendShipStatus === 'pending') {
        if (friend.isRequester) {
          outgoing.push(friend)
        } else {
          incoming.push(friend)
        }
      }
    })

    accepted.sort((a, b) => {
      const statusPriority = (friend: Friend) => (friend.userStatus === 'offline' ? 1 : 0)
      const statusDiff = statusPriority(a) - statusPriority(b)
      if (statusDiff !== 0) return statusDiff

      const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
      const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
      return bTime - aTime
    })
    
    return {
      friends: accepted,
      incomingRequests: incoming,
      outgoingRequests: outgoing,
    }
  }, [state.friendsById])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    setIsLoading(true)
    let active = true

    const init = async () => {
      try {
        await Promise.all([loadInitialFriendships(), loadInitialConversations()])
        if (!active) return

        const socket = connectChatSocket()
        onConversationUpdated(handleConversationUpdated)
        onFriendRemoved(handleFriendRemoved)
        onFriendRequestReceived(handleFriendRequestReceived)
        onFriendStatusUpdated(handleFriendStatusUpdated)
        onInitialFriendStatuses(handleInitialFriendStatuses)
        onFriendRequestAccepted(handleFriendRequestAccepted)
      }
      catch (error: any) {
        console.error('Error initializing friends context:', error)
        if (error.status >= 500 || error.detail.message === 'Network Error') {
          if (active) {
            triggerError(
              "Friends Service Unavailable", 
              "We couldn't load your friends list at the moment. Please try refreshing.", 
              503
            )
          }
        }
      }
      finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    init()

    return () => {
      active = false
      offConversationUpdated(handleConversationUpdated)
      offFriendRemoved(handleFriendRemoved)
      offFriendRequestReceived(handleFriendRequestReceived)
      offFriendStatusUpdated(handleFriendStatusUpdated)
      offInitialFriendStatuses(handleInitialFriendStatuses)
      offFriendRequestAccepted(handleFriendRequestAccepted)
    }
  }, [isAuthenticated])

  const value: FriendsContextValue = useMemo(
    () => ({
      isLoading,
      friends,
      friendsById: state.friendsById,
      incomingRequests,
      outgoingRequests,
      processingMap: processingMap,
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
      state.friendsById,
      incomingRequests,
      isLoading,
      outgoingRequests,
      processingMap,
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