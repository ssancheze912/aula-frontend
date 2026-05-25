import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isUsernameAvailable, createUserProfile } from '../services/userService'

export default function UsernameSetupPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
  if (profile) return <Navigate to="/dashboard" replace />

  const validate = (value: string): string => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value))
      return 'Entre 3 y 20 caracteres: letras, números o _'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate(username)
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const available = await isUsernameAvailable(username)
      if (!available) {
        setError('Este username ya está en uso')
        return
      }
      await createUserProfile({
        uid: user.uid,
        firstName: user.displayName?.split(' ')[0] ?? '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') ?? '',
        username: username.toLowerCase(),
        email: user.email ?? '',
        avatarUrl:
          user.photoURL ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
        provider: 'google',
      })
      await refreshProfile()
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Error al guardar el perfil. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Elige tu nombre de usuario</h1>
        <p className="text-gray-500 text-sm mb-6">
          Hola, {user.displayName ?? user.email}. Solo falta elegir un username único para
          completar tu registro.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              autoComplete="username"
              aria-describedby={error ? 'username-error' : 'username-hint'}
              aria-invalid={!!error}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {error ? (
              <span id="username-error" role="alert" className="text-red-600 text-xs">
                {error}
              </span>
            ) : (
              <span id="username-hint" className="text-gray-400 text-xs">
                3-20 caracteres: letras, números o guión bajo
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {submitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </main>
  )
}
