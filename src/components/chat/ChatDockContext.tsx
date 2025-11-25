import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatMessage } from './ChatProvider'
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
  sendMessage: (targetId: string, payload: { text?: string; attachment?: File }) => Promise<void>
}

const toSessionId = (id: string | number) => {
  return `u:${String(id)}`
}

const ChatDockContext = createContext<ChatDockContextValue | undefined>(undefined)

export const ChatDockProvider = ({ children }: { children: ReactNode }) => {
  const {subscribeToIncomingMessages,sendMessage,clearUnread,ensureConversation,loadMessages} = useChat()
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<ChatDockState>({ sessions: {} })

  useEffect(() => {
    if (!isAuthenticated) {
      setState({ sessions: {} })
    }
  }, [isAuthenticated])

  const upsertSession = useCallback(
    (target: ChatTarget, options?: { minimized?: boolean; addOnly?: boolean }) => {
      const id = String(target.id)
      const key = toSessionId(id)
      let shouldClear= false
      setState((prev) => {
        const existing = prev.sessions[key]

        if (existing) {
          if (!existing.minimized){
            shouldClear = true
          }
          const mergedTarget: ChatTarget = {
            id,
            nickname: target.nickname ?? existing.target.nickname,
            avatarUrl: target.avatarUrl ?? existing.target.avatarUrl,
            status: target.status ?? existing.target.status,
          }
          const desiredMinimized = options?.minimized ?? existing.minimized
          const allowMinimizedChange = !options?.addOnly || options.minimized === undefined
          const nextMinimized = allowMinimizedChange ? desiredMinimized : existing.minimized
          const targetChanged =
            mergedTarget.nickname !== existing.target.nickname ||
            mergedTarget.avatarUrl !== existing.target.avatarUrl ||
            mergedTarget.status !== existing.target.status

          if (!targetChanged && nextMinimized === existing.minimized) {
            return prev
          }

           return {
            sessions: {
              ...prev.sessions,
              [key]: { ...existing, target: mergedTarget, minimized: nextMinimized },
            },
            }
        }
        return {
          sessions: {
            ...prev.sessions,
            [key]: {
              target: { id, nickname: target.nickname, avatarUrl: target.avatarUrl, status: target.status },
              messages: [],
              minimized: options?.minimized ?? false,
            },
          },
        }
      }
    )
    if(shouldClear){
      clearUnread(target.id)
    }
    },
    [clearUnread],
  )
  //         const updated: ChatSession = {
  //           ...existing,
  //           target: mergedTarget,
  //           minimized: nextMinimized,
  //         }

  //         // Move this session to the end to mark it as most recently interacted
  //         const { [id]: _removed, ...rest } = prev.sessions
  //         return {
  //           sessions: {
  //             ...rest,
  //             [id]: updated,
  //           },
  //         }
  //       }

  //       const created: ChatSession = {
  //         target: { id, nickname: target.nickname, avatarUrl: target.avatarUrl, status: target.status },
  //         messages: [],
  //         minimized: options?.minimized ?? false,
  //       }

  //       return {
  //         sessions: {
  //           ...prev.sessions,
  //           [id]: created,
  //         },
  //       }
  //     })
  //   },
  //   [],
  // )

  const openChat = useCallback((target: ChatTarget) => {
    if (!isAuthenticated) return
    const id = String(target.id)
    ensureConversation(id, target.nickname, target.avatarUrl)
    clearUnread(id)
    upsertSession(target, { minimized: false })
    // schedule ensuring the conversation after render to avoid cross-render setState

    loadMessages(id)
  }, [isAuthenticated, upsertSession,clearUnread,ensureConversation])

  const closeChat = useCallback((targetId: string) => {
    setState((prev) => {
      const copy = { ...prev.sessions }
      delete copy[String(toSessionId(targetId))]
      return { sessions: copy }
    })
  }, [])

  const minimizeChat = useCallback((targetId: string, minimized: boolean = true) => {
    if (!minimized) {
      clearUnread(String(targetId))
    }
    setState((prev) => {
      const id = toSessionId(targetId)
      const existing = prev.sessions[id]
      if (!existing) return prev

      const updated: ChatSession = { ...existing, minimized }
      const { [id]: _removed, ...rest } = prev.sessions
      return { sessions: { ...rest, [id]: updated } }
    })
  }, [clearUnread])

  useEffect(() => {
    if (!subscribeToIncomingMessages) return
    const unsubscribe = subscribeToIncomingMessages(({target }) => {
      upsertSession(
        {
          id: target.id,
          nickname: target.nickname,
          avatarUrl: target.avatarUrl,
        },
        { minimized: true, addOnly: true },
      )
    })
    return unsubscribe
  }, [subscribeToIncomingMessages, upsertSession])

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
