import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../AuthContext'
import {
  getInitialChats,
  sendMessage as emitChatMessage,
  sendTyping as emitTyping,
  getMessages as fetchMessages,
  uploadImage,
  type UploadImageResponse,
  type ChatMessageDTO,
  type Conversation,
  type ConversationUpdatedEvent,
  type UserTypingEvent,
  onMessage,
  onUserTyping,
  offMessage,
  offUserTyping,
  getChatSocket,
  type LobbyInvite,
  onLobbyInviteReceived,
  offLobbyInviteReceived
} from '../../services/chat'
import { useFriends } from '../friends/FriendsContext'

export type ConversationTarget = {
  id: string
  nickname: string
  avatarUrl: string
}

type ConversationsState = {
  messagesById: Record<string, ChatMessage[]>
  targets: Record<string, ConversationTarget>
  typingById: Record<string, boolean>
  unreadById: Record<string, number>
  hasMoreById: Record<string,boolean>
  nextCursorById: Record<string,string | null>
}

export type ChatMessage = {
  id: string
  senderId: string
  senderNickname: string
  content?: string
  createdAt: string
  imageUrl?: string
  isMine: boolean
  type?: 'TEXT' | 'LOBBY_INVITE'
  temp_id?: string
  metadata?: {
    lobbyCode?: string
    lobbyName?: string
    gameName?: string
    maxPlayers?: number
    currentPlayers?: number
  }
}

const normalizeTimestamp = (timestamp: string) => {
  if (!timestamp) return timestamp
  // If the backend sends a timestamp without timezone info, assume UTC to avoid local parsing drift
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(timestamp)
  const candidate = hasTimezone ? timestamp : `${timestamp}Z`
  const date = new Date(candidate)
  if (Number.isNaN(date.getTime())) return timestamp
  return date.toISOString()
}

const mapDtoToChatMessage = (message: ChatMessageDTO): ChatMessage => {
  const result = {
    id: String(message.id),
    senderId: String(message.sender_id),
    senderNickname: message.sender_nickname,
    content: message.content,
    imageUrl: message.image_url,
    createdAt: normalizeTimestamp(message.created_at),
    isMine: message.is_mine,
    temp_id: message.temp_id
  }

  return result
}

type IncomingMessageListener = (payload: { conversationId: string}) => void

type ChatContextValue = {
  getMessages: (friendId: string) => ChatMessage[]
  getTarget: (friendId: string) => ConversationTarget | undefined
  getUnread: (friendId: string) => number
  getTyping: (friendId: string) => boolean
  getHasMore: (friendId: string) => boolean

  loadMessages: (friendId: string, beforeMessageId?: string) => Promise<void>
  loadMoreMessages: (friendId: string) => Promise<void>

  ensureConversation: (id: string) => void
  sendMessage: (friendId: string, payload: { text?: string; attachment?: File }) => Promise<void>
  sendTyping: (friendId: string) => void
  clearUnread: (friendId: string) => void
  clearState: (friendId: string) => void

  subscribeToIncomingMessages: (listener: IncomingMessageListener) => () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user,isAuthenticated } = useAuth()
  const {friendsById} = useFriends()
  const [state, setState] = useState<ConversationsState>({
    messagesById: {},
    targets: {},
    typingById: {},
    unreadById: {},
    hasMoreById: {},
    nextCursorById: {},
  })
  const loadedConversationsRef = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const typingThrottleRef = useRef<Map<string, number>>(new Map())
  const incomingMessageListenersRef = useRef<Set<IncomingMessageListener>>(new Set())

  const getMessages = useCallback(
    (friendId: string) => state.messagesById[friendId] ?? [],
    [state.messagesById],
  )

  const getTarget = useCallback(
    (friendId: string) => {
      return state.targets[String(friendId)]
    },
    [state.targets],
  )

  const getTyping = useCallback(
    (friendId: string) => !!state.typingById[friendId],
    [state.typingById],
  )
  const getHasMore = useCallback(
    (friendId: string) => {
      return state.hasMoreById[friendId]
    },
    [state.hasMoreById]
  )


  const getUnread = useCallback(
    (friendId: string) => state.unreadById[friendId] ?? 0,
    [state.unreadById],
  )

  const clearUnread = useCallback((friendId: string) => {
    setState(prev => ({
      ...prev,
      unreadById: {
        ...prev.unreadById,
        [friendId]: 0,
      },
    }))
  }, [])

  const clearState = useCallback((friendId: string) => {
    const id = String(friendId)

    setState((prev) => {
      const { [id]: _messages, ...restMessages } = prev.messagesById
      const { [id]: _target, ...restTargets } = prev.targets
      const { [id]: _typing, ...restTyping } = prev.typingById
      const { [id]: _unread, ...restUnread } = prev.unreadById
      const { [id]: _hasMore, ...restHasMore } = prev.hasMoreById
      const { [id]: _cursor, ...restCursors } = prev.nextCursorById

      return {
        ...prev,
        messagesById: restMessages,
        targets: restTargets,
        typingById: restTyping,
        unreadById: restUnread,
        hasMoreById: restHasMore,
        nextCursorById: restCursors,
      }
    })

    loadedConversationsRef.current.delete(id)
    typingThrottleRef.current.delete(id)

    const timeout = typingTimeoutRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      typingTimeoutRef.current.delete(id)
    }
  }, [])

  const subscribeToIncomingMessages = useCallback(
    (listener: IncomingMessageListener) => {
      incomingMessageListenersRef.current.add(listener)
      return () => {
        incomingMessageListenersRef.current.delete(listener)
      }
    },
    [],
  )

  const ensureConversation = useCallback(
  (id: string) => {
    const key = String(id)

    setState((prev) => {
      const existing = prev.targets[key]
      const friend = friendsById[key]
      if (!friend) return prev

      if (existing &&
          existing.nickname === friend.nickname &&
          existing.avatarUrl === friend.avatarUrl) {
        return prev
      }
      return {
        ...prev,
        targets: {
          ...prev.targets,
          [key]: {
            id: key,
            nickname: friend.nickname,
            avatarUrl: friend.avatarUrl || '',
          }
        }
      }
    })
  },
  [friendsById],
)

  const loadMessages = useCallback(
    async (friendId: string,beforeMessageId?: string) => {
      const id = String(friendId)
      if (!beforeMessageId && loadedConversationsRef.current.has(id)){
        return
      }
      try {
        const res = await fetchMessages(id,beforeMessageId,10)
        const newMessages: ChatMessage[] = res.messages.map((message) => (
          mapDtoToChatMessage(message)
        )).reverse()
        setState((prev) => {
          const prevMessages = prev.messagesById[id] ?? []
          const existingIds = new Set(prevMessages.map((m)=> m.id))

          const dedupedNew = newMessages.filter((msg) => !existingIds.has(msg.id))
          const merged = beforeMessageId ? [...dedupedNew, ...prevMessages] : [...prevMessages, ...dedupedNew]
          return {
            ...prev,
            messagesById: {
              ...prev.messagesById,
              [id]: merged
            },
            nextCursorById: {
              ...prev.nextCursorById,
              [id]: res.next_cursor
            },
            hasMoreById: {
              ...prev.hasMoreById,
              [id]: res.has_more
            },
          }
        })
        if (!beforeMessageId){
          loadedConversationsRef.current.add(id)
        }
      } 
      catch{

      }
    }
  ,[])

  const loadMoreMessages = useCallback(
    async (friendId: string) => {
      const cursor = state.nextCursorById[friendId]
      const hasMore = state.hasMoreById[friendId]

      if (!hasMore || cursor == null) return

      await loadMessages(friendId, cursor)
    },
    [state.nextCursorById, state.hasMoreById, loadMessages]
  )

  const appendMessage = useCallback((friendId: string, message: ChatMessage) => {
    setState((prev) => {
      const existing = prev.messagesById[friendId] ?? []
      if (existing.some((msg) => msg.id === message.id)){
        return prev
      }
      const sanitized = !message.id.startsWith('temp') 
      ? existing.filter((msg) => msg.id !== message.temp_id): existing
      return {
        ...prev,
        messagesById: {
          ...prev.messagesById,
          [friendId]: [...sanitized, message]
        }
      }
    })
  },[])

  const sendMessage = useCallback(
    async (friendId: string, payload: {text?: string, attachment?: File}) => {
      const text = payload.text?.trim()
      const file = payload.attachment

      if (!text && !file) return

      const senderId = user?.id ?? 'me'
      const senderNickname = user?.nickname ?? 'you'
      const now = new Date().toISOString()
      let tempImageUrl: string | undefined
      if (file) {
        tempImageUrl = URL.createObjectURL(file)
      }
      const optimisticMessage: ChatMessage = {
        id: `temp-${friendId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: String(senderId),
        senderNickname: senderNickname,
        content: text,
        imageUrl: tempImageUrl,
        isMine: true,
        createdAt: now,
      }
      appendMessage(friendId, optimisticMessage)

      const payloadBase = { friend_user_id: friendId }

      try {
        if (file) {
          const uploadDescriptor: UploadImageResponse = await uploadImage({
            friend_user_id: payloadBase.friend_user_id,
            filename: file.name,
            content_type: file.type || 'application/octet-stream',
          })

          const uploadResponse = await fetch(uploadDescriptor.upload_url, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload attachment (${uploadResponse.status})`)
          }

          emitChatMessage({
            ...payloadBase,
            content: text || undefined,
            image_path: uploadDescriptor.image_path,
            temp_id: optimisticMessage.id
          })
        } else {
          emitChatMessage({
            ...payloadBase,
            content: text || undefined,
            temp_id: optimisticMessage.id
          })
        }
      } catch (error) {
        setState((prev) => {
          const list = prev.messagesById[friendId] ?? []
          return {
            ...prev,
            messagesById: {
              ...prev.messagesById,
              [friendId]: list.filter((msg) => msg.id !== optimisticMessage.id),
            },
          }
        })
        throw error
      } finally {
        if (tempImageUrl) {
          const urlToRevoke = tempImageUrl
          setTimeout(() => URL.revokeObjectURL(urlToRevoke), 10_000)
        }
      }
    },
    [appendMessage, user?.id, user?.nickname, user?.pfp_path],
  )

  const sendTyping = useCallback(
    (friendId: string) => {
      const now = Date.now()
      const last = typingThrottleRef.current.get(friendId)

      if (last && now - last < 1000) {
        return
      }
      typingThrottleRef.current.set(friendId,now)
      emitTyping({friend_user_id: friendId})
    }
  ,[])

  const extractFriendId = (tempId: string) => {
    const match = /^temp-([^ -]+?)-/.exec(String(tempId))
  return match?.[1] ?? null
  }

  const handleIncomingMessage = useCallback(
    (payload: ChatMessageDTO) => {
      if (!payload) return
      const message = mapDtoToChatMessage(payload)
      if (message.isMine) {
        const friendId = extractFriendId(message.temp_id!)
        if (friendId)
          appendMessage(friendId, message)
        return
      }
      
      ensureConversation(message.senderId)

      
      if (!loadedConversationsRef.current.has(message.senderId)){
        void loadMessages(message.senderId)
      }
      else {
        appendMessage(message.senderId, message)
      }
      setState((prev) => {
        const currentUnread = prev.unreadById?.[message.senderId] ?? 0
        return {
          ...prev,
          unreadById: {
            ...prev.unreadById,
            [message.senderId]: currentUnread + 1,
          },
        }
      })
      const friend = friendsById[message.senderId]

      if (!friend) return
      incomingMessageListenersRef.current.forEach((listener) => {
        try {
          listener({conversationId: message.senderId})
        } catch(error) {
          console.error('Incoming message listener failed', error)
        }
      })
    }
  ,[appendMessage,ensureConversation,getTarget,friendsById,loadMessages])

  const handleConversationUpdated = useCallback(
    (payload: ConversationUpdatedEvent) => {

    }
  ,[])

  const handleTypingEvent = useCallback(
  (payload: UserTypingEvent) => {
    const conversationId = String(payload.user_id)

    ensureConversation(conversationId)
    setState((prev) => {
      if (prev.typingById[conversationId]) return prev

      return {
        ...prev,
        typingById: {
          ...prev.typingById,
          [conversationId]: true,
        },
      }
    })

    const prevTimeout = typingTimeoutRef.current.get(conversationId)
    if (prevTimeout) clearTimeout(prevTimeout)

    const timeout = setTimeout(() => {
      setState((prev) => {
        if (!prev.typingById[conversationId]) return prev

        return {
          ...prev,
          typingById: {
            ...prev.typingById,
            [conversationId]: false,
          },
        }
      })
      typingTimeoutRef.current.delete(conversationId)
    }, 3_000)

    typingTimeoutRef.current.set(conversationId, timeout)
  },
  [ensureConversation],
)

const handleReceivedLobbyInvite = useCallback(
    (payload: LobbyInvite) => {
      // 1. Ensure conversation exists with the inviter
      const inviterId = String(payload.inviter_id)
      ensureConversation(inviterId)

      // 2. Create a synthetic message object
      const inviteMessage: ChatMessage = {
        id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        senderId: inviterId,
        senderNickname: payload.inviter_nickname,
        content: `Invited you to play ${payload.game_name}`,
        createdAt: new Date().toISOString(),
        isMine: false,
        type: 'LOBBY_INVITE',
        metadata: {
          lobbyCode: payload.lobby_code,
          lobbyName: payload.lobby_name,
          gameName: payload.game_name,
          currentPlayers: payload.current_players,
          maxPlayers: payload.max_players
        }
      }

      // 3. Append to message history
      // Note: If conversation isn't loaded yet, loadMessages might be safer, 
      // but appending directly works for immediate feedback.
      if (!loadedConversationsRef.current.has(inviterId)){
         void loadMessages(inviterId)
      } else {
         appendMessage(inviterId, inviteMessage)
      }

      // 4. Update unread count
      setState((prev) => {
        const currentUnread = prev.unreadById?.[inviterId] ?? 0
        return {
          ...prev,
          unreadById: {
            ...prev.unreadById,
            [inviterId]: currentUnread + 1,
          },
        }
      })
      
      // 5. Notify listeners (e.g. for popups/toasts elsewhere)
      incomingMessageListenersRef.current.forEach((listener) => {
        try {
          listener({ conversationId: inviterId })
        } catch (error) {
          console.error('Incoming listener failed', error)
        }
      })
    },
    [ensureConversation, appendMessage, loadMessages]
  )

  useEffect(() => {
    if (!isAuthenticated) return
    const socket = getChatSocket()
    if (!socket) return

    onMessage(handleIncomingMessage)
    onUserTyping(handleTypingEvent)
    onLobbyInviteReceived(handleReceivedLobbyInvite)

    return () => {
      offMessage(handleIncomingMessage)
      offUserTyping(handleTypingEvent)
      offLobbyInviteReceived(handleReceivedLobbyInvite)
    }
  }, [handleTypingEvent,handleIncomingMessage,handleConversationUpdated])

  useEffect(() => {
    if (isAuthenticated) return
    setState({
      messagesById: {},
      targets: {},
      typingById: {},
      unreadById: {},
      hasMoreById: {},
      nextCursorById: {},
    })
    loadedConversationsRef.current.clear()
    typingThrottleRef.current.clear()
    typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
    typingTimeoutRef.current.clear()
  }, [isAuthenticated])

  const value = useMemo<ChatContextValue>(
    () => ({
      getMessages,
      getTarget,
      getUnread,
      getTyping,
      getHasMore,
      loadMessages,
      loadMoreMessages,
      ensureConversation,
      sendMessage,
      sendTyping,
      clearUnread,
      clearState,
      subscribeToIncomingMessages,
    }),
    [
      getMessages,
      getTarget,
      getUnread,
      getTyping,
      getHasMore,
      loadMessages,
      loadMoreMessages,
      ensureConversation,
      sendMessage,
      sendTyping,
      clearUnread,
      clearState,
      subscribeToIncomingMessages,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
