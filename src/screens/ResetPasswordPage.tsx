import { useState, type FormEventHandler } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { resetPassword } from '../services/auth'
  

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams()
  const initialToken = params.get('token') || ''
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const form = new FormData(e.currentTarget)
      const token = String(form.get('token') || initialToken || '')
      const password = String(form.get('password') || '')
      const confirm = String(form.get('confirmPassword') || '')
      if (!token) throw new Error('Missing reset token')
      if (password !== confirm) throw new Error('Passwords do not match')
      await resetPassword({ token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Failed to reset password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <div className="auth-card">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-6 space-y-2 text-center">
          <span className="auth-badge">
            Choose new password
          </span>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-desc">Enter the token from your email and a new password.</p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            Password updated. Redirecting to sign in…
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {!initialToken && (
              <label className="auth-label">
                <span>Reset token</span>
                <input
                  className='auth-input'
                  name="token"
                  type="text"
                  required
                />
              </label>
            )}

            <label className="auth-label">
              <span>New password</span>
              <input
                className='auth-input'
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
              <span>Confirm new password</span>
              <input
                className='auth-input'
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 auth-btn"
              disabled={submitting}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
            {error && (
              <p className="text-red-300 text-xs" role="alert">{error}</p>
            )}
            <p className="auth-note">
              Didn’t get a token? Check your spam folder or <Link className="auth-link" to="/forgot-password">request a new one</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
