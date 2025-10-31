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
  type ChatMessageDTO,
  type Conversation,
  type ConversationUpdatedEvent,
  type UserTypingEvent,
} from '../../services/chat'

export type ConversationTarget = {
  id: string
  nickname: string
  avatarUrl?: string
}

type ConversationsState = {
  messagesById: Record<string, ChatMessage[]>
  targets: Record<string, ConversationTarget>
  typingById: Record<string, string[]>
}

type ChatContextValue = {
  getMessages: (conversationId: string) => ChatMessage[]
  sendMessage: (conversationId: string, text: string) => Promise<void>
  ensureConversation: (target: ConversationTarget) => void
  setIncomingMessage: (conversationId: string, msg: ChatMessage) => void
  getTarget: (conversationId: string) => ConversationTarget | undefined
  getTypingUsers: (conversationId: string) => string[]
  sendTyping: (conversationId: string) => void
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
})

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user,isAuthenticated } = useAuth()
  const [state, setState] = useState<ConversationsState>({ messagesById: {}, targets: {}, typingById: {} })
  const loadingConversationsRef = useRef<Set<string>>(new Set())
  const loadedConversationsRef = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

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
      return {
        ...prev,
        messagesById: {
          ...prev.messagesById,
          [conversationId]: [...existing, message],
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
        console.log('Fetching conversation history for', conversationId)
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

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const me = user?.id != null ? normalizeId(user.id) : 'me'
      const nickname = user?.nickname ?? 'You'
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: me,
        senderName: nickname,
        avatarUrl: user?.pfp_path,
        content: trimmed,
        createdAt: new Date().toISOString(),
      }
      ensureConversation({ id: conversationId, nickname })
      appendMessage(conversationId, optimisticMessage)
      emitChatMessage({ friend_user_id: toApiId(conversationId), content: trimmed })
    },
    [appendMessage, ensureConversation, user?.id, user?.nickname, user?.pfp_path],
  )

  const setIncomingMessage = useCallback((conversationId: string, msg: ChatMessage) => {
    appendMessage(conversationId, msg)
  }, [appendMessage])

  const getMessages = useCallback(
    (conversationId: string) => state.messagesById[conversationId] ?? [],
    [state.messagesById],
  )

  const getTarget = useCallback((conversationId: string) => state.targets[conversationId], [state.targets])

  const getTypingUsers = useCallback(
    (conversationId: string) => state.typingById[conversationId] ?? [],
    [state.typingById],
  )

  const sendTyping = useCallback(
    (conversationId: string) => {
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
    [],
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
    if (!user) return
    void loadInitialConversations()
  }, [loadInitialConversations, user])

  useEffect(() => {
    if (!user) {
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

  const value = useMemo<ChatContextValue>(
    () => ({
      getMessages,
      sendMessage,
      ensureConversation,
      setIncomingMessage,
      getTarget,
      getTypingUsers,
      sendTyping,
    }),
    [ensureConversation, getMessages, getTarget, getTypingUsers, sendMessage, sendTyping, setIncomingMessage],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
