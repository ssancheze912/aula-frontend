import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isUsernameAvailable, createUserProfile } from '../services/userService'
import AulaLogoMark from '../components/AulaLogoMark'

const CREAM = '#fbf7ee'
const ACCENT_GREEN = '#4f8e4a'
const CORAL = '#c95636'

function AtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

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
        style={{ backgroundColor: CREAM, fontFamily: "'Nunito', sans-serif" }}
        aria-live="polite"
        aria-busy="true"
      >
        <p style={{ color: '#6e6b5e' }}>Cargando...</p>
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
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: CREAM, fontFamily: "'Nunito', sans-serif" }}
    >
      <div
        className="w-full max-w-md bg-white p-8"
        style={{
          border: '1px solid rgba(26, 31, 24, 0.12)',
          borderRadius: '20px',
          boxShadow: '0px 8px 32px rgba(31, 64, 35, 0.06)',
        }}
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2">
            <AulaLogoMark size={32} />
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: '22.4px',
                color: '#1a1f18',
                lineHeight: '33.6px',
              }}
            >
              aula<span style={{ color: CORAL }}>.</span>
            </span>
          </div>
        </div>

        <h1
          className="text-center mb-2"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '26px',
            lineHeight: '36px',
            color: '#1a1f18',
          }}
        >
          Elegí tu nombre de usuario
        </h1>
        <p
          className="text-center mb-7"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '15px',
            lineHeight: '22px',
            color: '#6e6b5e',
          }}
        >
          Hola, {user.displayName ?? user.email}. Solo falta elegir un username único para completar
          tu registro.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label
              htmlFor="username"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#3f4138',
                lineHeight: '20px',
                marginBottom: '6px',
              }}
            >
              Nombre de usuario
            </label>
            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#6e6b5e' }}
              >
                <AtIcon />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                autoComplete="username"
                placeholder="sofia_m"
                aria-describedby={error ? 'username-error' : 'username-hint'}
                aria-invalid={!!error}
                className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
                style={{
                  border: `1px solid ${error ? '#dc2626' : 'rgba(26, 31, 24, 0.18)'}`,
                  borderRadius: '14px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  fontSize: '15px',
                  fontFamily: "'Nunito', sans-serif",
                  color: '#1a1f18',
                  height: '48.5px',
                }}
              />
            </div>
            <div className="mt-1.5 min-h-[16px]">
              {error ? (
                <span
                  id="username-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: '#dc2626' }}
                >
                  {error}
                </span>
              ) : (
                <span id="username-hint" className="text-xs" style={{ color: '#a39e8b' }}>
                  3-20 caracteres: letras, números o guión bajo
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity"
            style={{
              backgroundColor: ACCENT_GREEN,
              color: '#fff',
              height: '53.5px',
              borderRadius: '16px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '17px',
              lineHeight: '25.5px',
              boxShadow: '0px 2px 0px #2e5f30',
              opacity: submitting ? 0.7 : 1,
              marginTop: '8px',
            }}
          >
            {submitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </main>
  )
}
