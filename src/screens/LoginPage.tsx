import type { FormEventHandler } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'
import { usePopup } from '../components/PopupContext'
import AuthGoogleButton from '../components/auth/AuthGoogleButton'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, googleAuth } = useAuth()
  const { showPopup} = usePopup()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const popupData = localStorage.getItem('popupData');
    if (popupData) {
      showPopup(JSON.parse(popupData));
      localStorage.removeItem('popupData');
    }
  }, []);

  const handleGoogleSignIn = useCallback(() => {
    if (typeof window === 'undefined') return
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      showPopup({ type: 'informative', message: 'Google sign-in is not configured yet.' })
      return
    }
    const google = (window as typeof window & { google?: any }).google
    if (!google?.accounts?.id) {
      showPopup({ type: 'informative', message: 'Google SDK not loaded. Try again in a moment.' })
      return
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        if (!response.credential) {
          showPopup({ type: 'error', message: 'Google sign-in was cancelled.' })
          return
        }
        try {
          await googleAuth(response.credential)
          navigate('/', { replace: true })
        } catch (error) {
          showPopup({ type: 'error', message: 'Google sign-in failed. Try again later.' })
        } finally {
          google.accounts.id.cancel?.()
        }
      },
    })
    google.accounts.id.prompt()
  }, [googleAuth, navigate, showPopup])

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData(e.currentTarget)
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')
      const remember = form.get('remember') !== null
      await login({ email, password, remember })
      navigate('/', { replace: true })
    } catch (err: any) {
      let message = ''
      if (err.message === 'LOGIN_USER_NOT_VERIFIED')
        message = 'User is not verified'
      else if (err.message === 'LOGIN_BAD_CREDENTIALS') {
        message = 'Invalid email or password'
      }
      else {
        message = 'Siggning in failed'
      }
      showPopup({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-8 space-y-2 text-center">
          <span className="auth-badge">
            Welcome back
          </span>
          <h1 className="auth-title">Log in to your account</h1>
          <p className="auth-desc">
            Track matches, join new lobbies, and stay on the leaderboard.
          </p>
        </div>


        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            <span>Email</span>
            <input
              className="auth-input"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Password</span>
            </div>
            <input
              className="auth-input"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Link to="/forgot-password" className="text-xs text-orange-300 hover:text-orange-200 underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </div>

          <label className="flex items-center gap-3 text-xs text-white/60">
            <input
              type="checkbox"
              name="remember"
              className="auth-checkbox"
            />
            <span>Stay signed in on this device</span>
          </label>

          <button
            type="submit"
            className="mt-2 auth-btn"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          {error && (
            <p className="text-red-300 text-xs mt-3" role="alert">{error}</p>
          )}
        </form>

        <p className="mt-3 auth-note">
          Need an account?{' '}
          <Link to="/register" className="auth-link">
            Create one now
          </Link>
        </p>
        <div className="mt-6 mb-3 flex items-center gap-3 text-xs uppercase tracking-wide text-white/40">
          <span className="h-px flex-1 bg-white/10" />
          <span>OR</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="mb-2 flex flex-col gap-3">
          <AuthGoogleButton
            label="Sign in with Google"
            disabled={submitting}
            onClick={handleGoogleSignIn}
          />
        </div>

        
      </div>
    </div>
  )
}

export default LoginPage


