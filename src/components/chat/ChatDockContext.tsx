import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatMessage } from './ChatWindow'
import { useChat } from './ChatProvider'
import { useAuth } from '../AuthContext'

export type ChatTarget = {
  id: string
  nickname: string
  avatarUrl?: string
  status?: string
}

export type ChatSession = {
  target: ChatTarget
  messages: ChatMessage[]
  minimized: boolean
}

type ChatDockState = {
  sessions: Record<string, ChatSession>
}

type ChatDockContextValue = {
  sessions: ChatSession[]
  openChat: (target: ChatTarget) => void
  closeChat: (targetId: string) => void
  minimizeChat: (targetId: string, minimized?: boolean) => void
  sendMessage: (targetId: string, payload: { text?: string; attachment?: File | null }) => Promise<void>
}

const ChatDockContext = createContext<ChatDockContextValue | undefined>(undefined)

export const ChatDockProvider = ({ children }: { children: ReactNode }) => {
  const chat = useChat()
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<ChatDockState>({ sessions: {} })

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ sessions: {} })
    }
  }, [isAuthenticated])

  const openChat = useCallback((target: ChatTarget) => {
    if (!isAuthenticated) return
    const id = String(target.id)
    setState((prev) => {
      const existing = prev.sessions[id]
      if (existing) {
        return { sessions: { ...prev.sessions, [id]: { ...existing, minimized: false } } }
      }
      const session: ChatSession = {
        target: { id, nickname: target.nickname, avatarUrl: target.avatarUrl, status: target.status },
        messages: [],
        minimized: false,
      }
      return { sessions: { ...prev.sessions, [id]: session } }
    })
    // schedule ensuring the conversation after render to avoid cross-render setState
    setTimeout(() => {
      chat.ensureConversation({ id, nickname: target.nickname, avatarUrl: target.avatarUrl })
    }, 0)
  }, [chat, isAuthenticated])

  const closeChat = useCallback((targetId: string) => {
    setState((prev) => {
      const copy = { ...prev.sessions }
      delete copy[String(targetId)]
      return { sessions: copy }
    })
  }, [])

  const minimizeChat = useCallback((targetId: string, minimized: boolean = true) => {
    setState((prev) => {
      const s = prev.sessions[String(targetId)]
      if (!s) return prev
      return { sessions: { ...prev.sessions, [String(targetId)]: { ...s, minimized } } }
    })
  }, [])

  const sendMessage = useCallback(
    async (targetId: string, payload: { text?: string; attachment?: File | null }) => {
      if (!isAuthenticated) return
      await chat.sendMessage(targetId, payload)
    },
    [chat, isAuthenticated],
  )

  const value = useMemo<ChatDockContextValue>(() => {
    const sessions = Object.values(state.sessions)
    return { sessions, openChat, closeChat, minimizeChat, sendMessage }
  }, [state.sessions, openChat, closeChat, minimizeChat, sendMessage])

  return <ChatDockContext.Provider value={value}>{children}</ChatDockContext.Provider>
}

export const useChatDock = () => {
  const ctx = useContext(ChatDockContext)
  if (!ctx) throw new Error('useChatDock must be used within ChatDockProvider')
  return ctx
}
