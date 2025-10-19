import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User, LoginPayload, RegisterPayload } from '../src/services/auth'
import * as auth from '../src/services/auth'
import { onUnauthorized } from '../src/lib/http'

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

  // Flip to unauthenticated immediately on global 401
  useEffect(() => {
    onUnauthorized(() => {
      setUser(null)
      setStatus('unauthenticated')
    })
    return () => {
      onUnauthorized(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await auth.getMe()
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      } 
      catch {
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

  // Revalidate session on tab focus/visibility change (throttled)
  const lastCheckRef = useRef(0)
  useEffect(() => {
    const revalidate = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      const now = Date.now()
      if (now - lastCheckRef.current < 5 * 60_000 && status !== 'checking') return
      lastCheckRef.current = now
      try {
        const me = await auth.getMe()
        setUser(me)
        setStatus('authenticated')
      } catch {
        setUser(null)
        setStatus('unauthenticated')
      }
    }
    const onFocus = () => void revalidate()
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void revalidate()
    }
    if (typeof window !== 'undefined') window.addEventListener('focus', onFocus)
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus)
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [status])

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

