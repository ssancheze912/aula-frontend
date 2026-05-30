import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from '../services/authService'
import {
  isUsernameAvailable,
  createUserProfile,
  getUserProfile,
} from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import AulaLogoMark from '../components/AulaLogoMark'

const CREAM = '#fbf7ee'
const DARK_GREEN = '#1f4023'
const ACCENT_GREEN = '#4f8e4a'
const CORAL = '#c95636'
const YELLOW = '#fbefc2'

const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No existe una cuenta con ese correo',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Credenciales inválidas',
  'auth/email-already-in-use': 'Este correo ya está registrado',
  'auth/weak-password': 'La contraseña es muy débil',
  'auth/invalid-email': 'Formato de correo inválido',
  'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
  'auth/popup-closed-by-user': 'Ventana de Google cerrada. Intenta de nuevo',
  'auth/popup-blocked': 'El navegador bloqueó el popup',
  'auth/network-request-failed': 'Sin conexión. Verifica tu internet',
}

type Mode = 'login' | 'register'

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4"
        y="11"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

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

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AulaLogo({ dotColor = CORAL }: { dotColor?: string }) {
  return (
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
        aula<span style={{ color: dotColor }}>.</span>
      </span>
    </div>
  )
}

function LetterAvatar({
  letter,
  bg,
  border,
}: {
  letter: string
  bg: string
  border: string
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white"
      style={{
        backgroundColor: bg,
        width: '46px',
        height: '46px',
        border: `3px solid ${border}`,
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        fontSize: '14px',
      }}
    >
      {letter}
    </div>
  )
}

function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  autoComplete,
  placeholder,
  rightSlot,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  error?: string
  autoComplete?: string
  placeholder?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          color: '#3f4138',
          lineHeight: '20px',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#6e6b5e' }}
        >
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
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
      <div className="flex justify-between items-center mt-1.5 min-h-[16px]">
        <span
          id={error ? `${id}-error` : undefined}
          role={error ? 'alert' : undefined}
          className="text-xs"
          style={{ color: error ? '#dc2626' : 'transparent' }}
        >
          {error ?? ' '}
        </span>
        {rightSlot}
      </div>
    </div>
  )
}

interface AuthPageProps {
  mode: Mode
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const isRegister = mode === 'register'

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && profile) navigate('/dashboard', { replace: true })
  }, [user, profile, navigate])

  const setField = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = async (): Promise<boolean> => {
    const e: Record<string, string> = {}

    if (isRegister) {
      if (form.firstName.trim().length < 2) e.firstName = 'Mínimo 2 caracteres'
      if (form.lastName.trim().length < 2) e.lastName = 'Mínimo 2 caracteres'
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
        e.username = '3-20 caracteres: letras, números o _'
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'

    if (isRegister) {
      const issues: string[] = []
      if (form.password.length < 8) issues.push('8 caracteres')
      if (!/[A-Z]/.test(form.password)) issues.push('una mayúscula')
      if (!/[0-9]/.test(form.password)) issues.push('un número')
      if (issues.length > 0) e.password = `Debe tener: ${issues.join(', ')}`
      if (form.password !== form.confirmPassword)
        e.confirmPassword = 'Las contraseñas no coinciden'
    } else if (form.password.length === 0) {
      e.password = 'Contraseña requerida'
    }

    if (isRegister && !e.username) {
      const available = await isUsernameAvailable(form.username)
      if (!available) e.username = 'Este username ya está en uso'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!(await validate())) return
    setLoading(true)
    try {
      if (isRegister) {
        const { user: newUser } = await registerWithEmail(form.email, form.password)
        await createUserProfile({
          uid: newUser.uid,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.toLowerCase(),
          email: form.email,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.firstName)}`,
          provider: 'email',
        })
        // Refrescar el perfil en el contexto para que PrivateRoute no rebote
        // a /register/username (flujo exclusivo de Google).
        await refreshProfile()
      } else {
        await loginWithEmail(form.email, form.password)
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setErrors({ general: FIREBASE_MESSAGES[code] ?? 'Error. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setErrors({})
    setLoading(true)
    try {
      const { user: gUser } = await loginWithGoogle()
      const existingProfile = await getUserProfile(gUser.uid)
      navigate(existingProfile ? '/dashboard' : '/register/username', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setErrors({ general: FIREBASE_MESSAGES[code] ?? 'Error al iniciar con Google' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex"
      style={{ backgroundColor: CREAM, fontFamily: "'Nunito', sans-serif" }}
    >
      <aside
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: DARK_GREEN, flex: '469 0 0' }}
        aria-hidden="true"
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            backgroundColor: ACCENT_GREEN,
            width: '320px',
            height: '320px',
            right: '-100px',
            top: '-100px',
            opacity: 0.25,
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            backgroundColor: YELLOW,
            width: '256px',
            height: '256px',
            left: '-50px',
            bottom: '-50px',
            opacity: 0.2,
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 flex items-center gap-2">
          <AulaLogoMark size={36} color="#8fbe83" />
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: '24px',
              color: CREAM,
            }}
          >
            aula<span style={{ color: CORAL }}>.</span>
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: '52px',
              lineHeight: '1.05',
              letterSpacing: '-1.5px',
              color: CREAM,
            }}
          >
            <span className="block">Tu sala</span>
            <span className="block">de estudio</span>
            <span className="block" style={{ color: YELLOW }}>
              te espera.
            </span>
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <LetterAvatar letter="S" bg="#4f8e4a" border={DARK_GREEN} />
              <LetterAvatar letter="M" bg="#8fbe83" border={DARK_GREEN} />
              <LetterAvatar letter="C" bg={CORAL} border={DARK_GREEN} />
              <LetterAvatar letter="D" bg="#4e89a8" border={DARK_GREEN} />
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: '#dedacb',
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${DARK_GREEN}`,
                  color: '#3f4138',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '12.8px',
                }}
              >
                +2396
              </div>
            </div>
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  color: CREAM,
                }}
              >
                2.400+ estudiantes
              </span>
              <span
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 400,
                  fontSize: '13px',
                  color: '#8fbe83',
                }}
              >
                ya estudian con su gente ✨
              </span>
            </div>
          </div>
        </div>

        <p
          className="relative z-10"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '12px',
            color: 'rgba(251, 247, 238, 0.5)',
          }}
        >
          © {new Date().getFullYear()} aula · hecho con ☕ en Latinoamérica
        </p>
      </aside>

      <div
        className="flex-1 flex items-center justify-center px-6 py-12 lg:px-20 lg:py-12"
        style={{ minWidth: 0, flex: '600 0 0' }}
      >
        <div className="w-full max-w-[440px]">
          <div className="flex justify-center mb-8">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded">
              <AulaLogo />
            </Link>
          </div>

          <h1
            className="text-center mb-3"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: '30px',
              lineHeight: '45px',
              color: '#1a1f18',
            }}
          >
            {isRegister ? '¡Bienvenida a aula!' : '¡Hola otra vez!'}
          </h1>
          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '15px',
              lineHeight: '22.5px',
              color: '#6e6b5e',
            }}
          >
            {isRegister
              ? 'Crea tu cuenta y empezá a estudiar con tu gente.'
              : 'Ingresá para volver a tu sala.'}
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
            {errors.general && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-2 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                }}
              >
                {errors.general}
              </div>
            )}

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="firstName"
                    label="Nombres"
                    icon={<UserIcon />}
                    value={form.firstName}
                    onChange={setField('firstName')}
                    error={errors.firstName}
                    autoComplete="given-name"
                    placeholder="Sofía"
                  />
                  <Field
                    id="lastName"
                    label="Apellidos"
                    icon={<UserIcon />}
                    value={form.lastName}
                    onChange={setField('lastName')}
                    error={errors.lastName}
                    autoComplete="family-name"
                    placeholder="Martínez"
                  />
                </div>
                <Field
                  id="username"
                  label="Nombre de usuario"
                  icon={<AtIcon />}
                  value={form.username}
                  onChange={setField('username')}
                  error={errors.username}
                  autoComplete="username"
                  placeholder="sofia_m"
                />
              </>
            )}

            <Field
              id="email"
              label="Correo electrónico"
              type="email"
              icon={<MailIcon />}
              value={form.email}
              onChange={setField('email')}
              error={errors.email}
              autoComplete="email"
              placeholder="sofia@universidad.edu"
            />

            <Field
              id="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              icon={<LockIcon />}
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                  style={{
                    color: '#6e6b5e',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 500,
                    fontSize: '12px',
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  {showPassword ? 'Ocultar' : 'Ver'} contraseña
                </button>
              }
            />

            {isRegister && (
              <Field
                id="confirmPassword"
                label="Confirmar contraseña"
                type={showPassword ? 'text' : 'password'}
                icon={<LockIcon />}
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                error={errors.confirmPassword}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            )}

            {!isRegister && (
              <div className="flex justify-between items-center mb-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded focus:ring-emerald-500"
                    style={{
                      accentColor: ACCENT_GREEN,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#6e6b5e',
                    }}
                  >
                    Recordarme
                  </span>
                </label>
                <button
                  type="button"
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: ACCENT_GREEN,
                  }}
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
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
                opacity: loading ? 0.7 : 1,
                marginTop: '8px',
              }}
            >
              {loading
                ? isRegister
                  ? 'Creando cuenta...'
                  : 'Ingresando...'
                : isRegister
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(26, 31, 24, 0.12)' }} />
            <span
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '13px',
                color: '#a39e8b',
              }}
            >
              o continuá con
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(26, 31, 24, 0.12)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 hover:bg-gray-50 transition-colors"
            style={{
              backgroundColor: '#fff',
              border: '1px solid rgba(26, 31, 24, 0.18)',
              borderRadius: '14px',
              height: '44.5px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '15px',
              color: '#1a1f18',
            }}
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p
            className="text-center mt-6"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px',
              color: '#6e6b5e',
            }}
          >
            {isRegister ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
            <Link
              to={isRegister ? '/login' : '/register'}
              className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: '16px',
                color: ACCENT_GREEN,
              }}
            >
              {isRegister ? 'Iniciá sesión' : 'Registrate gratis'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
