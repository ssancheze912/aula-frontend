import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  children: ReactNode
}

export default function PrivateRoute({ children }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Usuario Google sin username todavía
  if (user && !profile) return <Navigate to="/register/username" replace />

  return <>{children}</>
}
