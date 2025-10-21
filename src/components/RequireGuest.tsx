import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireGuest({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
        <div className="text-white/70">Loading…</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}

