import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail } from '../services/authService'
import { isUsernameAvailable, createUserProfile } from '../services/userService'

interface FormState {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

function Field({
  id,
  label,
  type,
  value,
  autoComplete,
  onChange,
  error,
}: {
  id: string
  label: string
  type: string
  value: string
  autoComplete: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="text-red-600 text-xs">
          {error}
        </span>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = async (): Promise<boolean> => {
    const e: FormErrors = {}

    if (form.firstName.trim().length < 2) e.firstName = 'Debe tener al menos 2 caracteres'
    if (form.lastName.trim().length < 2) e.lastName = 'Debe tener al menos 2 caracteres'

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      e.username = 'Entre 3 y 20 caracteres: letras, números o _'

    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'

    const pwdIssues: string[] = []
    if (form.password.length < 8) pwdIssues.push('mínimo 8 caracteres')
    if (!/[A-Z]/.test(form.password)) pwdIssues.push('una mayúscula')
    if (!/[0-9]/.test(form.password)) pwdIssues.push('un número')
    if (pwdIssues.length > 0) e.password = `Debe tener: ${pwdIssues.join(', ')}`

    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden'

    if (!e.username) {
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
      const { user } = await registerWithEmail(form.email, form.password)
      await createUserProfile({
        uid: user.uid,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.toLowerCase(),
        email: form.email,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.firstName)}`,
        provider: 'email',
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use')
        setErrors({ email: 'Este correo ya está registrado' })
      else setErrors({ general: 'Error al registrar. Intenta de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear cuenta</h1>

        {errors.general && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Field
              id="firstName"
              label="Nombres"
              type="text"
              value={form.firstName}
              autoComplete="given-name"
              onChange={set('firstName')}
              error={errors.firstName}
            />
            <Field
              id="lastName"
              label="Apellidos"
              type="text"
              value={form.lastName}
              autoComplete="family-name"
              onChange={set('lastName')}
              error={errors.lastName}
            />
          </div>

          <Field
            id="username"
            label="Nombre de usuario"
            type="text"
            value={form.username}
            autoComplete="username"
            onChange={set('username')}
            error={errors.username}
          />

          <Field
            id="email"
            label="Correo electrónico"
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={set('email')}
            error={errors.email}
          />

          <Field
            id="password"
            label="Contraseña"
            type="password"
            value={form.password}
            autoComplete="new-password"
            onChange={set('password')}
            error={errors.password}
          />

          <Field
            id="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            value={form.confirmPassword}
            autoComplete="new-password"
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
