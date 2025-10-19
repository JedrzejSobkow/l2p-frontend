import type { FC, FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'


const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40'

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
      const username  = String(form.get('username') || '')
      const password = String(form.get('password') || '')
      const remember = form.get('remember') !== null
      await login({ username, password, remember })
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[rgba(12,11,24,0.9)] p-8 ">
          <BackButton className="mb-6" label="Back to home" />
        <div className="mb-8 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Welcome back
          </span>
          <h1 className="text-3xl font-semibold text-white">Log in to your account</h1>
          <p className="text-sm text-white/60">
            Track matches, join new lobbies, and stay on the leaderboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-white/70">
            <span>Username</span>
            <input
              className={inputClass}
              name="username"
              type="text"
              autoComplete="username"
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
              className={inputClass}
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
              className="h-4 w-4 rounded border-white/30 bg-transparent text-orange-400 focus:ring-orange-400/50"
            />
            <span>Stay signed in on this device</span>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          {error && (
            <p className="text-red-300 text-xs mt-3" role="alert">{error}</p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          Need an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-orange-300 underline-offset-4 transition hover:text-orange-200 hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage




