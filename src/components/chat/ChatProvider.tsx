import { createContext, useContext, useMemo, useState, type ReactNode, useCallback } from 'react'
import type { ChatMessage } from './ChatWindow'
import { useAuth } from '../AuthContext'

export type ConversationTarget = {
  id: string
  nickname: string
  avatarUrl?: string
}

type ConversationsState = {
  messagesById: Record<string, ChatMessage[]>
  targets: Record<string, ConversationTarget>
}

type ChatContextValue = {
  getMessages: (conversationId: string) => ChatMessage[]
  sendMessage: (conversationId: string, text: string) => Promise<void> | void
  ensureConversation: (target: ConversationTarget) => void
  setIncomingMessage: (conversationId: string, msg: ChatMessage) => void
  getTarget: (conversationId: string) => ConversationTarget | undefined
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [state, setState] = useState<ConversationsState>({ messagesById: {}, targets: {} })

  const ensureConversation = useCallback((target: ConversationTarget) => {
    setState((prev) => {
      const id = String(target.id)
      if (prev.targets[id]) return prev
      return {
        messagesById: { ...prev.messagesById, [id]: prev.messagesById[id] ?? [] },
        targets: { ...prev.targets, [id]: { id, nickname: target.nickname, avatarUrl: target.avatarUrl } },
      }
    })
  }, [])

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const me = user?.id != null ? String(user.id) : 'me'
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        senderId: me,
        senderName: 'You',
        avatarUrl: user?.pfp_path,
        content: text,
        createdAt: new Date().toISOString(),
      }
      setState((prev) => {
        const list = prev.messagesById[conversationId] ?? []
        return { ...prev, messagesById: { ...prev.messagesById, [conversationId]: [...list, msg] } }
      })
      // TODO: integrate with WebSocket/HTTP send
    },
    [user?.id],
  )

  const setIncomingMessage = useCallback((conversationId: string, msg: ChatMessage) => {
    setState((prev) => {
      const list = prev.messagesById[conversationId] ?? []
      return { ...prev, messagesById: { ...prev.messagesById, [conversationId]: [...list, msg] } }
    })
  }, [])

  const getMessages = useCallback(
    (conversationId: string) => state.messagesById[conversationId] ?? [],
    [state.messagesById],
  )

  const getTarget = useCallback((conversationId: string) => state.targets[conversationId], [state.targets])

  const value = useMemo<ChatContextValue>(
    () => ({ getMessages, sendMessage, ensureConversation, setIncomingMessage, getTarget }),
    [getMessages, sendMessage, ensureConversation, setIncomingMessage, getTarget],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}

