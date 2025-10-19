import type { FC, FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'

type RegistrationPageProps = {
  onSubmit?: FormEventHandler<HTMLFormElement>
}

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40'

const RegistrationPage: FC<RegistrationPageProps> = ({ onSubmit }) => {
  const navigate = useNavigate()
  const { register, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    if (onSubmit) return onSubmit(e)
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const form = new FormData(e.currentTarget)
      const username = String(form.get('username') || '')
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')
      const confirmPassword = String(form.get('confirmPassword') || '')
      const termsAccepted = form.get('terms') !== null
      if (!termsAccepted) throw new Error('You must accept the terms')
      if (password !== confirmPassword) throw new Error('Passwords do not match')
      await register({ username, email, password })
      // Auto sign-in after registration using the same credentials
      await login({ identifier: username, password, remember: true })
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[rgba(12,11,24,0.9)] p-8 ">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-8 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Join the lobby
          </span>
          <h1 className="text-3xl font-semibold text-white">Create your L2P account</h1>
          <p className="text-sm text-white/60">
            Start tracking your favourite games, join lobbies and challenge top rated players.
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
            {fieldErrors.nickname && (
              <p className="text-red-300 text-xs" role="alert">{fieldErrors.nickname}</p>
            )}
          </label>

          <label className="space-y-2 text-sm text-white/70">
            <span>Email address</span>
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            {fieldErrors.email && (
              <p className="text-red-300 text-xs" role="alert">{fieldErrors.email}</p>
            )}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-white/70">
              <span>Password</span>
              <input
                className={inputClass}
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              {fieldErrors.password && (
                <p className="text-red-300 text-xs" role="alert">{fieldErrors.password}</p>
              )}
            </label>
            <label className="space-y-2 text-sm text-white/70">
              <span>Confirm password</span>
              <input
                className={inputClass}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/60">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent text-orange-400 focus:ring-orange-400/50"
            />
            <span>
              I agree to the Terms of Service and confirm I have read the Privacy Policy. I understand
              that online matches may be recorded for moderation.
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
          {error && (
            <p className="text-red-300 text-xs mt-3" role="alert">{error}</p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-orange-300 underline-offset-4 transition hover:text-orange-200 hover:underline"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegistrationPage

