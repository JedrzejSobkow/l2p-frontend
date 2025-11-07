import type { FormEventHandler } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../components/AuthContext'
import { ApiError } from '../lib/http'
import { usePopup } from '../components/PopupContext'

const RegistrationPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showPopup} = usePopup()
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({}); // Clear field errors at the start of submission
    try {
      const form = new FormData(e.currentTarget)
      const nickname  = String(form.get('nickname') || '')
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')
      const confirmPassword = String(form.get('confirmPassword') || '')

      const errors: Record<string,string> = {}
      const nicknamePattern = /^[a-zA-Z0-9_]*$/;

      if (!nicknamePattern.test(nickname)) {
        errors.nickname = 'Nickname can only contain letters, numbers, and underscores.';
      }
      if (!passwordPolicy.test(password)) {
        errors.password = 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords are not the same';
      }
      if (!nickname) {
        errors.nickname = 'Nickname is required';
      }
      if (!email) {
        errors.email = 'Email is required';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }
      await register({ nickname , email, password })
      showPopup({ type: 'confirmation', message: 'Registration successful! Please check your email to verify your account.' })
      navigate('/login', { replace: true })
     
    } catch (err: any) {
      if (err instanceof ApiError) {
        console.log(`ApiError message: ${err.message}`);
        console.log('ApiError detail:', err.detail); // Log the detail field
        if (err.detail) {
          fieldErrors[err.detail.field] = err.detail.message; // Set field-specific error
          setFieldErrors(fieldErrors);
        }
      } else {
        console.log('Unexpected error:', JSON.stringify(err, null, 2));
      }
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
              onInput={(e) => {
                const input = e.currentTarget;
                input.value = input.value.replace(/[^a-zA-Z0-9_]/g, ''); // Allow only letters, numbers, and underscores
              }}
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
                onInput={(e) => {
                  const confirmPasswordInput = document.querySelector<HTMLInputElement>('input[name="confirmPassword"]');
                  if (confirmPasswordInput) {
                    setPasswordsMatch(e.currentTarget.value === confirmPasswordInput.value);
                  }
                }}
              />
              {fieldErrors.password && (
                <p className="text-red-300 text-xs" role="alert">{fieldErrors.password}</p>
              )}
            </label>
            <label className="auth-label">
              <span>Confirm password</span>
              <input
                className={`auth-input ${!passwordsMatch ? 'border-red-500' : ''}`}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                onInput={(e) => {
                  const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
                  if (passwordInput) {
                    setPasswordsMatch(e.currentTarget.value === passwordInput.value);
                  }
                }}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-300 text-xs" role="alert">{fieldErrors.confirmPassword}</p>
              )}
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

