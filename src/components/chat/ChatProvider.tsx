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
  connectChatSocket,
  disconnectChatSocket,
  getConversations,
  sendMessage as emitChatMessage,
  sendTyping as emitTyping,
  getMessages as fetchMessages,
  uploadImage,
  type UploadImageResponse,
  type ChatMessageDTO,
  type Conversation,
  type ConversationUpdatedEvent,
  type UserTypingEvent,
  type ConversationHistoryPayload
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
}

const mapDtoToChatMessage = (message: ChatMessageDTO): ChatMessage => {
  return {
    id: String(message.id),
    senderId: String(message.sender_id),
    senderNickname: message.sender_nickname,
    content: message.content,
    imageUrl: message.image_url,
    createdAt: message.created_at,
    isMine: message.is_mine
  }
}

type IncomingMessageListener = (payload: { conversationId: string; target: ConversationTarget }) => void

type ChatContextValue = {
  getMessages: (friendId: string) => ChatMessage[]
  getTarget: (friendId: string) => ConversationTarget | undefined
  getUnread: (friendId: string) => number
  getTyping: (friendId: string) => boolean

  loadMessages: (friendId: string, beforeMessageId?: string) => Promise<void>
  loadMoreMessages: (friendId: string) => Promise<void>

  ensureConversation: (id: string, nickname?: string, avatarUrl?: string) => void
  sendMessage: (friendId: string, payload: { text?: string; attachment?: File }) => Promise<void>
  sendTyping: (friendId: string) => void
  clearUnread: (friendId: string) => void

  subscribeToIncomingMessages: (listener: IncomingMessageListener) => () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user,isAuthenticated } = useAuth()
  const {friends} = useFriends()
  const [state, setState] = useState<ConversationsState>({ messagesById: {}, targets: {}, typingById: {},unreadById: {},hasMoreById: {},nextCursorById: {}})
  const loadingConversationsRef = useRef<Set<string>>(new Set())
  const loadedConversationsRef = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const typingThrottleRef = useRef<Map<string, number>>(new Map())
  const incomingMessageListenersRef = useRef<Set<IncomingMessageListener>>(new Set())
  // useEffect(() => {
  //   if (!isAuthenticated)
  //     return

  //   setState(prev => {
  //     const targets = {...prev.targets}

  //     friends.forEach(friend => {
  //       if(!targets[friend.friend_user_id]){
  //         targets[friend.friend_user_id] = {
  //           id: friend.friend_user_id,
  //           nickname: friend.friend_nickname,
  //           avatarUrl: friend.friend_pfp_path || 
  //         }
  //       }
  //     })
  //     return {...prev,targets}
  //   })
  // },[friends,isAuthenticated])

  const getMessages = useCallback(
    (friendId: string) => state.messagesById[friendId] ?? [],
    [state.messagesById],
  )

  const getTarget = useCallback(
    (friendId: string) => {
      return state.targets[String(friendId)]},
    [state.targets],
  )

  const getTyping = useCallback(
    (friendId: string) => !!state.typingById[friendId],
    [state.typingById],
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

  const subscribeToIncomingMessages = useCallback(
    (listener: IncomingMessageListener) => {
      incomingMessageListenersRef.current.add(listener)
      return () => {
        incomingMessageListenersRef.current.delete(listener)
      }
    },
    [],
  )

  const loadInitialConversations = useCallback(async () => {
    // not sure if needed
    try {
      const result = await getConversations()
      const conversations = result?.conversations ?? []
      setState((prev) => {
        if (!conversations.length) return prev
        const targets = { ...prev.targets }
        conversations.forEach((conversation: Conversation) => {
          const id = conversation.friend_id
          const unreadCount = conversation.unread_count ?? 0
          if (unreadCount > 0) {
            prev.unreadById = {
              ...prev.unreadById,
              [id]: unreadCount,
            }
          }
          targets[id] = {
            id,
            nickname: conversation.friend_nickname,
            avatarUrl: conversation.friend_pfp_path ?? '',
          }
        })
        return {
          ...prev,
          targets,
        }
      })
    } catch (error) {
      console.error('Failed to load initial conversations', error)
    }
  }, [])

  // useEffect(() => {
  //   if (!isAuthenticated) return
  //   void loadInitialConversations()
  // }, [loadInitialConversations, isAuthenticated])

  const ensureConversation = useCallback(
  (id: string, nickname?: string, avatarUrl?: string) => {
    const key = String(id)
    setState((prev) => {
      const existing = prev.targets[key]
      const friend = friends.find(f => String(f.friend_user_id) === key)

      const finalNickname =
        nickname ??
        friend?.friend_nickname ??
        existing?.nickname ??
        'Unknown'

      const finalAvatar =
        avatarUrl ??
        friend?.friend_pfp_path ??
        existing?.avatarUrl ??
        ''

      const next: ConversationTarget = {
        id: key,
        nickname: finalNickname,
        avatarUrl: finalAvatar,
      }

      if (existing &&
          existing.nickname === finalNickname &&
          existing.avatarUrl === finalAvatar) {
        return prev
      }
      return {
        ...prev,
        targets: {
          ...prev.targets,
          [key]: next,
        },
      }
    })
  },
  [friends],
)

  const loadMessages = useCallback(
    async (friendId: string,beforeMessageId?: string) => {
      if (!beforeMessageId && loadedConversationsRef.current.has(friendId)){
        return
      }
      const res = await fetchMessages(friendId,beforeMessageId,10)
      const newMessages: ChatMessage[] = res.messages.map((message) => (
        mapDtoToChatMessage(message)
      )).reverse()
      setState((prev) => {
        const prevMessages = prev.messagesById[friendId] ?? []
        const existingIds = new Set(prevMessages.map((m)=> m.id))

        const dedupedNew = newMessages.filter((msg) => !existingIds.has(msg.id))
        const merged = beforeMessageId ? [...dedupedNew, ...prevMessages] : dedupedNew
        return {
          ...prev,
          messagesById: {
            ...prev.messagesById,
            [friendId]: merged
          },
          nextCursorById: {
            ...prev.nextCursorById,
            [friendId]: res.next_cursor
          },
          hasMoreById: {
            ...prev.hasMoreById,
            [friendId]: res.has_more
          },
        }
      })
      if (!beforeMessageId){
        loadedConversationsRef.current.add(friendId)
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
      ? existing.filter((msg) => 
        !msg.id.startsWith('temp') || 
        msg.senderId !== message.senderId || 
        msg.content !== message.content ||
        Boolean(msg.imageUrl) !== Boolean(message.imageUrl),
      )
      : existing

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
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: senderId,
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
          })
        } else {
          emitChatMessage({
            ...payloadBase,
            content: text || undefined,
          })
        }
      } catch (error) {
        console.error('Failed to send message', error)
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

  const handleIncomingMessage = useCallback(
    (payload: ChatMessageDTO) => {
      if (!payload) return
      const message = mapDtoToChatMessage(payload)
      if (message.isMine) return // if possible we could change sender_id on isMine messages
      
      ensureConversation(message.senderId, message.senderNickname)
      console.log(message.senderId)
      const target = getTarget(String(message.senderId))
      console.log(state.targets)
      appendMessage(message.senderId, message)
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
      incomingMessageListenersRef.current.forEach((listener) => {
        try {
          listener({conversationId: target.id, target})
        } catch(error) {
          console.error('Incoming message listener failed', error)
        }
      })
    }
  ,[appendMessage,ensureConversation,getTarget,state.targets])

  const handleConversationUpdated = useCallback(
    (payload: ConversationUpdatedEvent) => {

    }
  ,[])

  const handleTypingEvent = useCallback(
  (payload: UserTypingEvent) => {
    const conversationId = String(payload.user_id)
    const nickname = payload.nickname

    ensureConversation(conversationId, nickname)

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

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectChatSocket()
      return
    }
    const socket = connectChatSocket()

    const handleConnect = () => {
      // refresh state on reconnect to ensure latest data
      loadedConversationsRef.current.clear()
    }
    const handleDisconnect = () => {
      /* no-op */
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('message', handleIncomingMessage)
    socket.on('conversation_updated', handleConversationUpdated)
    socket.on('user_typing', handleTypingEvent)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('message', handleIncomingMessage)
      socket.off('conversation_updated', handleConversationUpdated)
      socket.off('user_typing', handleTypingEvent)
      disconnectChatSocket()
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated) return
    setState({ messagesById: {}, targets: {}, typingById: {},unreadById: {},hasMoreById: {}, nextCursorById: {} })
    loadingConversationsRef.current.clear()
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
      loadMessages,
      loadMoreMessages,
      ensureConversation,
      sendMessage,
      sendTyping,
      clearUnread,
      subscribeToIncomingMessages,
    }),
    [
      getMessages,
      getTarget,
      getUnread,
      getTyping,
      loadMessages,
      loadMoreMessages,
      ensureConversation,
      sendMessage,
      sendTyping,
      clearUnread,
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
