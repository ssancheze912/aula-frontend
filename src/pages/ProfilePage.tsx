import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/authService'
import { updateUserProfile, deleteAccount } from '../services/userService'
import { ApiError } from '../services/api'

const CREAM = '#fbf7ee'
const SIDEBAR_BG = '#f4ecdc'
const ACCENT_GREEN = '#4f8e4a'
const DARK_GREEN = '#2e5f30'
const DANGER = '#a4422a'
const INK = '#1a1f18'
const MUTED = '#6e6b5e'

const USERNAME_RE = /^\w{3,20}$/

type Section = 'perfil' | 'peligro'

/* --------------------------------- Iconos --------------------------------- */

type IconProps = { size?: number }
const svg = (size: number, path: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {path}
  </svg>
)

const BackIcon = ({ size = 16 }: IconProps) =>
  svg(size, <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />)
const UserIcon = ({ size = 16 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
const AlertIcon = ({ size = 16 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M12 3 2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
const CameraIcon = ({ size = 14 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </>
  )
const CheckIcon = ({ size = 16 }: IconProps) =>
  svg(size, <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)
const AtIcon = ({ size = 16 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )

/* --------------------------------- Campo ---------------------------------- */

function Field({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  hint,
  icon,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange?: (v: string) => void
  error?: string
  disabled?: boolean
  hint?: string
  icon?: React.ReactNode
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} style={{ fontWeight: 600, fontSize: '14px', color: '#3f4138' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="w-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
          style={{
            border: `1px solid ${error ? '#dc2626' : 'rgba(26,31,24,0.18)'}`,
            borderRadius: '14px',
            paddingLeft: icon ? '40px' : '15px',
            paddingRight: '15px',
            height: '48.5px',
            fontSize: '15px',
            color: disabled ? MUTED : INK,
            backgroundColor: disabled ? '#f4ecdc' : '#fff',
          }}
        />
      </div>
      {error ? (
        <span id={`${id}-error`} role="alert" className="text-xs" style={{ color: '#dc2626' }}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-xs" style={{ color: '#a39e8b' }}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="bg-white w-full"
      style={{ borderRadius: '24px', padding: '24px', boxShadow: '0px 6px 7px rgba(26,31,24,0.1), 0px 2px 2px rgba(26,31,24,0.06)' }}
      aria-label={title}
    >
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '16px', color: INK }}>{title}</h2>
      <div className="pt-5">{children}</div>
    </section>
  )
}

/* --------------------------- Modal eliminar cuenta ------------------------- */

function DeleteAccountModal({
  onClose,
  onConfirm,
  deleting,
  error,
}: {
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
  error: string
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose, deleting])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !deleting && onClose()}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(26,31,24,0.45)', border: 'none' }}
      />
      <div
        className="relative z-10 w-full max-w-md bg-white p-7"
        style={{ borderRadius: '20px', boxShadow: '0px 12px 40px rgba(31,64,35,0.18)' }}
      >
        <h2 id="delete-title" className="mb-2" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: '#b91c1c' }}>
          Eliminar tu cuenta
        </h2>
        <p className="mb-5" style={{ fontSize: '14px', lineHeight: '20px', color: MUTED }}>
          Esta acción es <strong>permanente</strong>. Se borrarán tu perfil, tu nombre de usuario y tu acceso. No se puede deshacer.
        </p>
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(26,31,24,0.18)', borderRadius: '14px', height: '48px', fontWeight: 600, fontSize: '15px', color: '#3f4138' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            aria-busy={deleting}
            className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-opacity"
            style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: '14px', height: '48px', fontWeight: 600, fontSize: '15px', opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Sidebar --------------------------------- */

function SettingsNavItem({
  icon,
  label,
  active,
  danger,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  danger?: boolean
  onClick: () => void
}) {
  const color = danger ? DANGER : active ? INK : MUTED
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="w-full flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      style={{
        backgroundColor: active ? '#fff' : 'transparent',
        boxShadow: active ? '0px 1px 1px rgba(26,31,24,0.06)' : 'none',
        borderRadius: '14px',
        padding: '10px 12px',
        color,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 600,
        fontSize: '14px',
      }}
    >
      <span style={{ display: 'inline-flex', color }}>{icon}</span>
      <span className="text-left">{label}</span>
    </button>
  )
}

/* --------------------------------- Página --------------------------------- */

const EMPTY = { firstName: '', lastName: '', username: '', avatarUrl: '', bio: '', link: '', university: '', career: '', year: '', country: '' }

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [section, setSection] = useState<Section>('perfil')
  const [form, setForm] = useState({ ...EMPTY })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAvatarInput, setShowAvatarInput] = useState(false)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const resetForm = () => {
    if (!profile) return
    setForm({
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      username: profile.username ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      bio: profile.bio ?? '',
      link: profile.link ?? '',
      university: profile.university ?? '',
      career: profile.career ?? '',
      year: profile.year ?? '',
      country: profile.country ?? '',
    })
    setErrors({})
    setSuccess(false)
  }

  useEffect(() => {
    if (profile) resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => () => { if (successTimer.current) clearTimeout(successTimer.current) }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }} aria-busy="true">
        <p style={{ color: MUTED }}>Cargando...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/register/username" replace />

  const setField = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setSuccess(false)
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (form.firstName.trim().length < 2) e.firstName = 'Mínimo 2 caracteres'
    if (form.lastName.trim().length < 2) e.lastName = 'Mínimo 2 caracteres'
    if (!USERNAME_RE.test(form.username)) e.username = '3-20 caracteres: letras, números o _'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSuccess(false)
    if (!validate()) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.toLowerCase(),
        avatarUrl: form.avatarUrl.trim(),
        bio: form.bio.trim(),
        link: form.link.trim(),
        university: form.university.trim(),
        career: form.career.trim(),
        year: form.year.trim(),
        country: form.country.trim(),
      })
      await refreshProfile()
      setSuccess(true)
      if (successTimer.current) clearTimeout(successTimer.current)
      successTimer.current = setTimeout(() => setSuccess(false), 4000)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErrors({ username: 'Este username ya está en uso' })
      else setErrors({ general: 'No se pudo guardar. Intentá de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount(user.uid)
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setDeleteError('No se pudo eliminar la cuenta. Intentá de nuevo.')
      setDeleting(false)
    }
  }

  const initials =
    (form.firstName.trim()[0] ?? '?').toUpperCase() + (form.lastName.trim()[0] ?? '').toUpperCase()
  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Tu perfil'
  const subtitle = `Estudiante${form.university.trim() ? ` · ${form.university.trim()}` : ''}`

  return (
    <main id="main-content" className="min-h-screen flex" style={{ backgroundColor: CREAM, fontFamily: "'Nunito', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{ width: '260px', backgroundColor: SIDEBAR_BG, borderRight: '1px solid rgba(26,31,24,0.08)', padding: '24px 17px 24px 16px' }}
        aria-label="Ajustes"
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-2 pb-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          style={{ color: MUTED, fontWeight: 600, fontSize: '14px' }}
        >
          <BackIcon /> Volver al inicio
        </button>

        <h1 className="px-2 pb-4" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: INK }}>
          Ajustes
        </h1>

        <nav className="flex flex-col gap-1">
          <SettingsNavItem icon={<UserIcon />} label="Perfil" active={section === 'perfil'} onClick={() => setSection('perfil')} />
          <SettingsNavItem icon={<AlertIcon />} label="Zona peligrosa" danger active={section === 'peligro'} onClick={() => setSection('peligro')} />
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex justify-center">
        <div className="w-full" style={{ maxWidth: '760px', padding: '36px 44px' }}>
          {section === 'perfil' && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '24px', color: INK }}>Perfil</h2>

              {/* Avatar + nombre */}
              <div className="flex items-center gap-6">
                <div className="relative shrink-0" style={{ width: '96px', height: '96px' }}>
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" className="rounded-full object-cover" style={{ width: '96px', height: '96px' }} referrerPolicy="no-referrer" />
                  ) : (
                    <div className="rounded-full flex items-center justify-center" style={{ width: '96px', height: '96px', backgroundColor: '#e8b43a', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '28px' }}>
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAvatarInput((s) => !s)}
                    aria-label="Cambiar avatar"
                    aria-expanded={showAvatarInput}
                    className="absolute flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    style={{ width: '32px', height: '32px', right: 0, bottom: 0, backgroundColor: ACCENT_GREEN, color: '#fff', borderRadius: '9999px', boxShadow: '0px 4px 3px rgba(0,0,0,0.1)' }}
                  >
                    <CameraIcon />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="truncate" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: INK }}>{fullName}</p>
                  <p className="truncate" style={{ fontSize: '14px', color: MUTED }}>{subtitle}</p>
                </div>
              </div>

              {showAvatarInput && (
                <Field id="avatarUrl" label="URL del avatar" value={form.avatarUrl} onChange={setField('avatarUrl')} hint="Pegá un enlace de imagen, o dejalo vacío para usar tus iniciales." />
              )}

              {errors.general && (
                <div role="alert" className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
                  {errors.general}
                </div>
              )}
              {success && (
                <div role="status" aria-live="polite" className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#eef5ec', border: '1px solid #bfe0b5', color: DARK_GREEN }}>
                  ✓ Perfil actualizado correctamente.
                </div>
              )}

              {/* Información personal */}
              <Card title="Información personal">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field id="firstName" label="Nombre" value={form.firstName} onChange={setField('firstName')} error={errors.firstName} />
                  <Field id="lastName" label="Apellido" value={form.lastName} onChange={setField('lastName')} error={errors.lastName} />
                  <Field id="username" label="Nombre de usuario" icon={<AtIcon />} value={form.username} onChange={setField('username')} error={errors.username} hint="3-20 caracteres: letras, números o _" />
                  <Field id="email" label="Correo electrónico" value={profile.email} disabled hint="El correo no se puede modificar." />
                  <div className="sm:col-span-2">
                    <Field id="bio" label="Bio" value={form.bio} onChange={setField('bio')} placeholder="Contanos algo sobre vos ✨" />
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="link" label="Enlace personal" value={form.link} onChange={setField('link')} placeholder="tusitio.github.io" />
                  </div>
                </div>
              </Card>

              {/* Datos académicos */}
              <Card title="Datos académicos">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field id="university" label="Universidad" value={form.university} onChange={setField('university')} placeholder="Universidad del Valle" />
                  <Field id="career" label="Carrera" value={form.career} onChange={setField('career')} placeholder="Ingeniería de Sistemas" />
                  <Field id="year" label="Año en curso" value={form.year} onChange={setField('year')} placeholder="3er año" />
                  <Field id="country" label="País" value={form.country} onChange={setField('country')} placeholder="Colombia" />
                </div>
              </Card>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  style={{ border: '1px solid rgba(26,31,24,0.18)', borderRadius: '14px', padding: '11px 21px', fontWeight: 600, fontSize: '15px', color: INK, backgroundColor: '#fff' }}
                >
                  Descartar cambios
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  aria-busy={saving}
                  className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity"
                  style={{ backgroundColor: ACCENT_GREEN, color: '#fff', borderRadius: '14px', padding: '10px 20px', fontWeight: 600, fontSize: '15px', boxShadow: `0px 2px 0px ${DARK_GREEN}`, opacity: saving ? 0.7 : 1 }}
                >
                  <CheckIcon />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}

          {section === 'peligro' && (
            <div className="flex flex-col gap-6">
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '24px', color: DANGER }}>Zona peligrosa</h2>
              <section className="bg-white w-full" style={{ borderRadius: '24px', padding: '24px', border: '1px solid #fecaca' }} aria-label="Eliminar cuenta">
                <h3 className="mb-1" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '16px', color: '#b91c1c' }}>Eliminar cuenta</h3>
                <p className="mb-4" style={{ fontSize: '14px', color: MUTED }}>
                  Borra tu perfil y tu acceso de forma permanente. Esta acción no se puede deshacer.
                </p>
                <button
                  type="button"
                  onClick={() => { setDeleteError(''); setShowDelete(true) }}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  style={{ backgroundColor: '#fff', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '14px', padding: '10px 18px', fontWeight: 600, fontSize: '15px' }}
                >
                  Eliminar mi cuenta
                </button>
              </section>
            </div>
          )}

        </div>
      </div>

      {showDelete && (
        <DeleteAccountModal onClose={() => setShowDelete(false)} onConfirm={handleDelete} deleting={deleting} error={deleteError} />
      )}
    </main>
  )
}
