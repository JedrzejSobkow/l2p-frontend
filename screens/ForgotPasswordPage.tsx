import { useState, type FormEventHandler } from 'react'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { forgotPassword } from '../src/services/auth'

const ForgotPasswordPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const form = new FormData(e.currentTarget)
      const email = String(form.get('email') || '')
      await forgotPassword({ email })
      setSent(true)
    } catch (err: any) {
      if (err?.fields && typeof err.fields === 'object') setFieldErrors(err.fields)
      setError(err?.message || 'Failed to send reset email')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-6 space-y-2 text-center">
          <span className="auth-badge">
            Reset access
          </span>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-desc">Enter your email and we’ll send a reset link.</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            If an account exists for that email, you’ll receive a link to reset your password shortly.
            <div className="mt-4 text-center">
              <Link to="/login" className="text-orange-300 hover:text-orange-200 underline-offset-4 hover:underline">Back to sign in</Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              <span>Email address</span>
              <input
                className='auth-input'
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              {fieldErrors.email && (
                <p className="text-red-300 text-xs" role="alert">{fieldErrors.email}</p>
              )}
            </label>

            <button
              type="submit"
              className="mt-2 auth-btn"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
            {error && (
              <p className="text-red-300 text-xs" role="alert">{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage

