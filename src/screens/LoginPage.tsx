import type { FC, FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const form = new FormData(e.currentTarget)
      const email  = String(form.get('email') || '')
      const password = String(form.get('password') || '')
      const remember = form.get('remember') !== null
      await login({ email, password, remember })
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Sign in failed')
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
              type="text"
              autoComplete="email"
              required
            />
            {fieldErrors.username && (
              <p className="text-red-300 text-xs" role="alert">{fieldErrors.username}</p>
            )}
          </label>

          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Password</span>
              <Link to="/forgot-password" className="text-xs text-orange-300 hover:text-orange-200 underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              className="auth-input"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            {fieldErrors.password && (
              <p className="text-red-300 text-xs" role="alert">{fieldErrors.password}</p>
            )}
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

        <p className="mt-6 auth-note">
          Need an account?{' '}
          <Link to="/register" className="auth-link">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage




