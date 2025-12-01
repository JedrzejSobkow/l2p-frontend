import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <LoadingSpinner className="min-h-[calc(100vh-12rem)]" />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  
  return <>{children}</>
}

