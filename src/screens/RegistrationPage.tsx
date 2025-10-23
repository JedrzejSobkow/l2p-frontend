import type { FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'

const RegistrationPage = () => {
  const navigate = useNavigate()
  const { register, login } = useAuth()
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
      const nickname  = String(form.get('nickname') || '')
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')
      const confirmPassword = String(form.get('confirmPassword') || '')
      const termsAccepted = form.get('terms') !== null
      if (!termsAccepted) throw new Error('You must accept the terms')
      if (password !== confirmPassword) throw new Error('Passwords do not match')
      await register({ nickname: nickname , email, password })
      await login({ email , password, remember: true })
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="auth-screen">
      <div className="auth-card-wide">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-8 space-y-2 text-center">
          <span className="auth-badge">
            Join the lobby
          </span>
          <h1 className="auth-title">Create your L2P account</h1>
          <p className="auth-desc">
            Start tracking your favourite games, join lobbies and challenge top rated players.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            <span>Nickname</span>
            <input
              className="auth-input"
              name="nickname"
              type="text"
              autoComplete="nickname"
              required
            />
            {fieldErrors.nickname && (
              <p className="text-red-300 text-xs" role="alert">{fieldErrors.nickname}</p>
            )}
          </label>

          <label className="auth-label">
            <span>Email address</span>
            <input
              className="auth-input"
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
            <label className="auth-label">
              <span>Password</span>
              <input
                className="auth-input"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              {fieldErrors.password && (
                <p className="text-red-300 text-xs" role="alert">{fieldErrors.password}</p>
              )}
            </label>
            <label className="auth-label">
              <span>Confirm password</span>
              <input
                className="auth-input"
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
              className="mt-0.5 auth-checkbox"
            />
            <span>
              I agree to the Terms of Service and confirm I have read the Privacy Policy. I understand
              that online matches may be recorded for moderation.
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 auth-btn"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
          {error && (
            <p className="text-red-300 text-xs mt-3" role="alert">{error}</p>
          )}
        </form>

        <p className="mt-6 auth-note">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegistrationPage

