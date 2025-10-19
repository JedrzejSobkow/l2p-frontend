import { useState, type FormEventHandler } from 'react'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { forgotPassword } from '../src/services/auth'

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40'

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
    <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[rgba(12,11,24,0.9)] p-8 ">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-6 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Reset access
          </span>
          <h1 className="text-3xl font-semibold text-white">Forgot your password?</h1>
          <p className="text-sm text-white/60">Enter your email and we’ll send a reset link.</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            If an account exists for that email, you’ll receive a link to reset your password shortly.
            <div className="mt-4 text-center">
              <Link to="/login" className="text-orange-300 hover:text-orange-200 underline-offset-4 hover:underline">Back to sign in</Link>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
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