import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User, LoginPayload, RegisterPayload } from '../services/auth'
import * as auth from '../services/auth'
import { onUnauthorized } from '../lib/http'
import { usePopup } from '../components/PopupContext'
type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: Partial<User>) => Promise<User>
  deleteAccount: () => Promise<void>
  handleGoogleSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [googleWindow, setGoogleWindow] = useState<Window | null>(null)
  const {showPopup} = usePopup()

  const refreshUser = async () => {
    try {
      const me = await auth.getMe()
      setUser(me)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }

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
    if (user && googleWindow && !googleWindow.closed) {
      googleWindow.close()
      setGoogleWindow(null)
      window.location.reload(); //REFRESH SOCKETS AFTER GOOGLE AUTH
    } 
  }, [user, googleWindow])

  useEffect(() => {
    if (!googleWindow)return

    const iv = setInterval(async () => {
      if (googleWindow.closed){
        clearInterval(iv)
        try {
          await refreshUser()
        }
        catch {
          showPopup({type: 'error',message: 'Google sign-in failed. Try again.'})
        }
        return 
      }
      try {
        await refreshUser()
      }
      catch {

      }
    },1000)
    return () => clearInterval(iv)
  },[googleWindow, showPopup,refreshUser])

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const url = await auth.getGoogleAuthorizationUrl()
      const w = window.open(url, 'google_oauth', 'width=500,height=650')
      if (!w) {
        window.location.href = url
        return
      }
      setGoogleWindow(w)
    } catch (e) {
      showPopup({ type: 'error', message: 'Unable to start Google sign-in.' })
    }
  }, [showPopup])

  

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await auth.getMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          console.log("User is unauthenticated. Creating guest session...");
          try {
            // Wywołaj funkcję createGuestSession, aby utworzyć sesję gościa
            const guest = await auth.createGuestSession();
            console.log("Guest session created:", guest);
  
            // Ustaw dane gościa w stanie aplikacji
            setUser(guest);
            setStatus('authenticated');
          } catch (error) {
            console.error("Failed to create guest session:", error);
            setUser(null);
            setStatus('unauthenticated');
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Revalidate session on tab focus/visibility change (throttled)
  const lastCheckRef = useRef(0)
  useEffect(() => {
    const revalidate = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      const now = Date.now()
      if (now - lastCheckRef.current < 5 * 60_000 && status !== 'checking') return
      lastCheckRef.current = now
      await refreshUser()
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
  }, [status,refreshUser])

  const login = async (payload: LoginPayload) => {
    const me = await auth.login(payload)
    setUser(me)
    setStatus('authenticated')
  }

  const register = async (payload: RegisterPayload) => {
    await auth.register(payload)
  }

  const updateProfile = async (updates: Partial<User>) => {
    const updated = await auth.patchMe(updates)
    setUser(updated)
    return updated
  }

  const deleteAccount = async () => {
    await auth.deleteMe()
    setUser(null)
    setStatus('unauthenticated')
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
      updateProfile,
      deleteAccount,
      handleGoogleSignIn
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
