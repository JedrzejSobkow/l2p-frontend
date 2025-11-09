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
import type { ChatMessage } from './ChatWindow'
import { useAuth } from '../AuthContext'
import {
  connectChatSocket,
  disconnectChatSocket,
  getConversations,
  getMessages as fetchChatHistory,
  sendMessage as emitChatMessage,
  sendTyping as emitTyping,
  uploadImage,
  type UploadImageResponse,
  type ChatMessageDTO,
  type Conversation,
  type ConversationUpdatedEvent,
  type UserTypingEvent,
} from '../../services/chat'
import { withAssetsPrefix } from '../../services/auth'

export type ConversationTarget = {
  id: string
  nickname: string
  avatarUrl?: string
}

type ConversationsState = {
  messagesById: Record<string, ChatMessage[]>
  targets: Record<string, ConversationTarget>
  typingById: Record<string, string[]>
  unreadById?: Record<string, number>
}

type ChatContextValue = {
  getMessages: (conversationId: string) => ChatMessage[]
  sendMessage: (conversationId: string, payload: { text?: string; attachment?: File | null }) => Promise<void>
  ensureConversation: (target: ConversationTarget) => void
  setIncomingMessage: (conversationId: string, msg: ChatMessage) => void
  getTarget: (conversationId: string) => ConversationTarget | undefined
  getTypingUsers: (conversationId: string) => string[]
  sendTyping: (conversationId: string) => void
  clearUnread?: (conversationId: string) => void
  getUnread?: (conversationId: string) => number
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

const normalizeId = (value: string | number) => String(value)
const isNumericId = (value: string) => /^\d+$/.test(value)
const toApiId = (value: string): string | number => (isNumericId(value) ? Number(value) : value)

const mapDtoToChatMessage = (dto: ChatMessageDTO): ChatMessage => ({
  id: String(dto.id),
  senderId: normalizeId(dto.sender_id),
  senderName: dto.sender_nickname,
  avatarUrl: undefined,
  content: dto.content ?? '',
  createdAt: dto.created_at,
  imageUrl: withAssetsPrefix(dto.image_url ?? undefined),
})

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user,isAuthenticated } = useAuth()
  const [state, setState] = useState<ConversationsState>({ messagesById: {}, targets: {}, typingById: {},unreadById: {}})
  const loadingConversationsRef = useRef<Set<string>>(new Set())
  const loadedConversationsRef = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const typingThrottleRef = useRef<Map<string, number>>(new Map())

  const replaceMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setState((prev) => ({
      ...prev,
      messagesById: { ...prev.messagesById, [conversationId]: messages },
    }))
  }, [])

  const appendMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setState((prev) => {
      const existing = prev.messagesById[conversationId] ?? []
      if (existing.some((msg) => msg.id === message.id)) {
        return prev
      }
      const sanitized = !message.id.startsWith('temp-')
        ? existing.filter(
            (msg) =>
              !msg.id.startsWith('temp-') ||
              msg.senderId !== message.senderId ||
              msg.content !== message.content ||
              Boolean(msg.imageUrl) !== Boolean(message.imageUrl),
          )
        : existing
      return {
        ...prev,
        messagesById: {
          ...prev.messagesById,
          [conversationId]: [...sanitized, message],
        },
      }
    })
  }, [])

  const fetchConversationHistory = useCallback(
    async (conversationId: string, force: boolean = false) => {
      if (!force && loadedConversationsRef.current.has(conversationId)) return
      if (loadingConversationsRef.current.has(conversationId)) return
      loadingConversationsRef.current.add(conversationId)
      try {
        const history = await fetchChatHistory(toApiId(conversationId))
        const transformed = history.messages.map(mapDtoToChatMessage).reverse()
        replaceMessages(conversationId, transformed)
        loadedConversationsRef.current.add(conversationId)
      } catch (error) {
        console.error('Failed to load conversation history', error)
      } finally {
        loadingConversationsRef.current.delete(conversationId)
      }
    },
    [replaceMessages],
  )

  const ensureConversation = useCallback((target: ConversationTarget) => {
    const id = normalizeId(target.id)
    setState((prev) => {
      if (prev.targets[id]) return prev
      return {
        messagesById: { ...prev.messagesById, [id]: prev.messagesById[id] ?? [] },
        targets: {
          ...prev.targets,
          [id]: { id, nickname: target.nickname, avatarUrl: target.avatarUrl },
        },
        typingById: { ...prev.typingById },
      }
    })
    void fetchConversationHistory(id)
  }, [fetchConversationHistory])

  const setIncomingMessage = useCallback((conversationId: string, msg: ChatMessage) => {
    appendMessage(conversationId, msg)
  }, [appendMessage])

  const getMessages = useCallback(
    (conversationId: string) => state.messagesById[conversationId] ?? [],
    [state.messagesById],
  )
  
  const clearUnread = useCallback((conversationId: string) => {
    console.log('Clearing unread for', conversationId)
    setState((prev) => {
      if (!prev.unreadById || !(conversationId in prev.unreadById)) return prev
      const updatedUnread = { ...prev.unreadById }
      delete updatedUnread[conversationId]
      return {
        ...prev,
        unreadById: updatedUnread,
      }
    })
  }, [])

  const getUnread = useCallback(
    (conversationId: string) => state.unreadById?.[conversationId] ?? 0,
    [state.unreadById],
  )

  const getTarget = useCallback((conversationId: string) => state.targets[conversationId], [state.targets])

  const getTypingUsers = useCallback(
    (conversationId: string) => state.typingById[conversationId] ?? [],
    [state.typingById],
  )

  const sendMessage = useCallback(
    async (conversationId: string, payload: { text?: string; attachment?: File | null }) => {
      const text = payload.text?.trim() ?? ''
      const file = payload.attachment ?? null
      if (!text && !file) return

      const me = user?.id != null ? normalizeId(user.id) : 'me'
      const nickname = user?.nickname ?? 'You'
      const now = new Date().toISOString()
      let tempImageUrl: string | undefined
      if (file) {
        tempImageUrl = URL.createObjectURL(file)
      }
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: me,
        senderName: nickname,
        avatarUrl: user?.pfp_path,
        content: text,
        imageUrl: tempImageUrl,
        createdAt: now,
      }
      const currentTarget = getTarget(conversationId)
      ensureConversation(
        currentTarget ?? {
          id: conversationId,
          nickname,
        },
      )
      appendMessage(conversationId, optimisticMessage)

      const payloadBase = { friend_user_id: toApiId(conversationId) }

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
          const list = prev.messagesById[conversationId] ?? []
          return {
            ...prev,
            messagesById: {
              ...prev.messagesById,
              [conversationId]: list.filter((msg) => msg.id !== optimisticMessage.id),
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
    [appendMessage, ensureConversation, getTarget, user?.id, user?.nickname, user?.pfp_path],
  )

  const sendTyping = useCallback(
    (conversationId: string) => {
      const now = Date.now()
      const last = typingThrottleRef.current.get(conversationId)
      if (last && now - last < 1000) {
        return
      }
      typingThrottleRef.current.set(conversationId, now)
      emitTyping({ friend_user_id: toApiId(conversationId) })
    },
    [],
  )

  const handleIncomingMessage = useCallback(
    (payload: ChatMessageDTO) => {
      if (!payload) return
      if (payload.is_mine) {
        // Server will trigger conversation update which refreshes history.
        return
      }
      
      const conversationId = normalizeId(payload.sender_id)
      ensureConversation({ id: conversationId, nickname: payload.sender_nickname })
      appendMessage(conversationId, mapDtoToChatMessage(payload))
      setState((prev) => {
        const currentUnread = prev.unreadById?.[conversationId] ?? 0
        return {
          ...prev,
          unreadById: {
            ...prev.unreadById,
            [conversationId]: currentUnread + 1,
          },
        }
      })
      
    },
    [appendMessage, ensureConversation],
  )

  const handleConversationUpdated = useCallback(
    (payload: ConversationUpdatedEvent) => {
      const conversationId = normalizeId(payload.friend_id)
      ensureConversation({
        id: conversationId,
        nickname: payload.friend_nickname,
        avatarUrl: payload.friend_pfp_path ?? undefined,
      })
      void fetchConversationHistory(conversationId, true)
    },
    [ensureConversation, fetchConversationHistory],
  )

  const handleTypingEvent = useCallback(
    (payload: UserTypingEvent) => {
      const conversationId = normalizeId(payload.user_id)
      const nickname = payload.nickname
      ensureConversation({ id: conversationId, nickname })
      setState((prev) => {
        const existing = prev.typingById[conversationId] ?? []
        if (existing.includes(nickname)) return prev
        return {
          ...prev,
          typingById: {
            ...prev.typingById,
            [conversationId]: [...existing, nickname],
          },
        }
      })
      const prevTimeout = typingTimeoutRef.current.get(conversationId)
      if (prevTimeout) clearTimeout(prevTimeout)
      const timeout = setTimeout(() => {
        setState((prev) => {
          const existing = prev.typingById[conversationId]
          if (!existing) return prev
          const filtered = existing.filter((name) => name !== nickname)
          if (filtered.length === existing.length) return prev
          return {
            ...prev,
            typingById: {
              ...prev.typingById,
              [conversationId]: filtered,
            },
          }
        })
        typingTimeoutRef.current.delete(conversationId)
      }, 3_000)
      typingTimeoutRef.current.set(conversationId, timeout)
    },
    [ensureConversation],
  )

  const loadInitialConversations = useCallback(async () => {
    try {
      const result = await getConversations()
      const conversations = result?.conversations ?? []
      setState((prev) => {
        if (!conversations.length) return prev
        const targets = { ...prev.targets }
        conversations.forEach((conversation: Conversation) => {
          const id = normalizeId(conversation.friend_id)
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
            avatarUrl: conversation.friend_pfp_path ?? undefined,
          }
        })
        return {
          ...prev,
          targets,
        }
      })
    } catch (error) {
      console.error('Failed to load conversations', error)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    void loadInitialConversations()
  }, [loadInitialConversations, isAuthenticated])

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
  }, [handleConversationUpdated, handleIncomingMessage, handleTypingEvent, user])

  useEffect(() => {
    if (isAuthenticated) return
    setState({ messagesById: {}, targets: {}, typingById: {},unreadById: {} })
    loadingConversationsRef.current.clear()
    loadedConversationsRef.current.clear()
    typingThrottleRef.current.clear()
    typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout))
    typingTimeoutRef.current.clear()
  }, [isAuthenticated])

  const value = useMemo<ChatContextValue>(
    () => ({
      getMessages,
      sendMessage,
      ensureConversation,
      setIncomingMessage,
      getTarget,
      getTypingUsers,
      sendTyping,
      clearUnread,
      getUnread,
    }),
    [getUnread,ensureConversation, getMessages, getTarget, getTypingUsers, sendMessage, sendTyping, setIncomingMessage,clearUnread],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
