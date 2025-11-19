import type { ButtonHTMLAttributes } from 'react'
import { FcGoogle } from 'react-icons/fc'

interface AuthGoogleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

const AuthGoogleButton = ({ label = 'Continue with Google', ...props }: AuthGoogleButtonProps) => {
  return (
    <button
      type="button"
      {...props}
      className={[
        'flex items-center justify-center gap-3 cursor-pointer rounded-2xl border border-white/15 bg-white/5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <FcGoogle className="h-10 w-10 rounded-2xl" />
      <span className='text-headline font-medium'>{label}</span>
    </button>
  )
}

export default AuthGoogleButton
