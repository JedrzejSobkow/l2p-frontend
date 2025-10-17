import type { FC, FormEventHandler } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'

type LoginPageProps = {
  onSubmit?: FormEventHandler<HTMLFormElement>
}

const inputClass =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-orange-400/70 focus:outline-none focus:ring-2 focus:ring-orange-400/40'

const LoginPage: FC<LoginPageProps> = ({ onSubmit }) => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    if (onSubmit) return onSubmit(e)
    e.preventDefault()
    // For now, fake success by mocking the login flow
    login('user23283293')
    navigate('/', { replace: true })
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
            <span>Email or username</span>
            <input
              className={inputClass}
              name="identifier"
              type="text"
              autoComplete="username"
              required
            />
          </label>

          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Password</span>
            </div>
            <input
              className={inputClass}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
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
          >
            Sign in
          </button>
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
