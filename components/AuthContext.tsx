import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, LoginPayload, RegisterPayload } from '../src/services/auth'
import * as auth from '../src/services/auth'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await auth.getMe()
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (payload: LoginPayload) => {
    const me = await auth.login(payload)
    setUser(me)
    setStatus('authenticated')
  }

  const register = async (payload: RegisterPayload) => {
    await auth.register(payload)
  }

  const logout = async () => {
    await auth.logout()
    setUser(null)
    setStatus('unauthenticated')
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      status,
      login,
      register,
      logout,
    }),
    [user, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}


