import { useState, type FormEventHandler } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { resetPassword } from '../src/services/auth'

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40'

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
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[rgba(12,11,24,0.9)] p-8 ">
        <BackButton className="mb-6" label="Back to home" />
        <div className="mb-6 space-y-2 text-center">
          <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Choose new password
          </span>
          <h1 className="text-3xl font-semibold text-white">Reset password</h1>
          <p className="text-sm text-white/60">Enter the token from your email and a new password.</p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            Password updated. Redirecting to sign in…
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!initialToken && (
              <label className="space-y-2 text-sm text-white/70">
                <span>Reset token</span>
                <input
                  className={inputClass}
                  name="token"
                  type="text"
                  required
                />
              </label>
            )}

            <label className="space-y-2 text-sm text-white/70">
              <span>New password</span>
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
              <span>Confirm new password</span>
              <input
                className={inputClass}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
              disabled={submitting}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </button>
            {error && (
              <p className="text-red-300 text-xs" role="alert">{error}</p>
            )}
            <p className="text-center text-xs text-white/50">
              Didn’t get a token? Check your spam folder or <Link className="text-orange-300 hover:text-orange-200 underline-offset-4 hover:underline" to="/forgot-password">request a new one</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage