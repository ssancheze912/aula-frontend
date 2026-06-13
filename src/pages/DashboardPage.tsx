import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/authService'
import {
  createRoom,
  getMyRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  type RoomSummary,
} from '../services/roomService'
import { ApiError } from '../services/api'
import AulaLogoMark from '../components/AulaLogoMark'

const CREAM = '#fbf7ee'
const SIDEBAR_BG = '#f4ecdc'
const ACCENT_GREEN = '#4f8e4a'
const DARK_GREEN = '#2e5f30'
const CORAL = '#c95636'
const INK = '#1a1f18'
const MUTED = '#6e6b5e'

const NAME_MIN = 3
const NAME_MAX = 50

/* ----------------------------- Iconos (inline) ---------------------------- */

type IconProps = { size?: number }

function PlusIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RoomsIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8l-4 4 4 4M6 12h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 .9-1.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.4.9H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5.9z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DotsIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </svg>
  )
}

function ChatIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function VideoIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ScreenIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ------------------------------- Modal crear ------------------------------ */

function CreateRoomModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (room: RoomSummary) => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setError(`El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const room = await createRoom(trimmed)
      onCreated(room)
    } catch {
      setError('No se pudo crear la sala. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-room-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(26, 31, 24, 0.45)', border: 'none' }}
      />
      <div
        className="relative z-10 w-full max-w-md bg-white p-7"
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(26, 31, 24, 0.12)',
          boxShadow: '0px 12px 40px rgba(31, 64, 35, 0.18)',
        }}
      >
        <h2
          id="create-room-title"
          className="mb-2"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: INK }}
        >
          Crear sala de estudio
        </h2>
        <p className="mb-5" style={{ fontSize: '14px', color: MUTED }}>
          Ponle un nombre a tu sala. Vas a entrar como administrador.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="room-name"
            style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#3f4138', marginBottom: '6px' }}
          >
            Nombre de la sala
          </label>
          <input
            id="room-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Cálculo II — repaso parcial"
            aria-invalid={!!error}
            aria-describedby={error ? 'room-name-error' : undefined}
            maxLength={NAME_MAX}
            className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
            style={{
              border: `1px solid ${error ? '#dc2626' : 'rgba(26, 31, 24, 0.18)'}`,
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '15px',
              color: INK,
              height: '48.5px',
            }}
          />
          <div className="mt-1.5 min-h-[16px]">
            {error && (
              <span id="room-name-error" role="alert" className="text-xs" style={{ color: '#dc2626' }}>
                {error}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              style={{
                backgroundColor: '#fff',
                border: '1px solid rgba(26, 31, 24, 0.18)',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                color: '#3f4138',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity"
              style={{
                backgroundColor: ACCENT_GREEN,
                color: '#fff',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                boxShadow: `0px 2px 0px ${DARK_GREEN}`,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creando...' : 'Crear sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ------------------------- Modal: unirse por ID (US-08) ------------------- */

function JoinRoomModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = id.trim()
    if (!trimmed) {
      setError('Ingresá el ID de la sala.')
      return
    }
    setChecking(true)
    setError('')
    try {
      // Valida la existencia antes de navegar (US-08).
      await getRoom(trimmed)
      navigate(`/room/${trimmed}`)
    } catch (err) {
      setChecking(false)
      setError(
        err instanceof ApiError && err.status === 404
          ? 'Sala no encontrada. Verificá el ID.'
          : 'No se pudo validar la sala. Intentá de nuevo.'
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-room-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(26, 31, 24, 0.45)', border: 'none' }}
      />
      <div
        className="relative z-10 w-full max-w-md bg-white p-7"
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(26, 31, 24, 0.12)',
          boxShadow: '0px 12px 40px rgba(31, 64, 35, 0.18)',
        }}
      >
        <h2
          id="join-room-title"
          className="mb-2"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: INK }}
        >
          Unirse a una sala
        </h2>
        <p className="mb-5" style={{ fontSize: '14px', color: MUTED }}>
          Pegá el ID que te compartió el anfitrión para entrar como invitado.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="join-room-id"
            style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#3f4138', marginBottom: '6px' }}
          >
            ID de la sala
          </label>
          <input
            id="join-room-id"
            ref={inputRef}
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value)
              setError('')
            }}
            placeholder="p. ej. 8Kd2f9aZ..."
            aria-invalid={!!error}
            aria-describedby={error ? 'join-room-error' : undefined}
            className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
            style={{
              border: `1px solid ${error ? '#dc2626' : 'rgba(26, 31, 24, 0.18)'}`,
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '15px',
              color: INK,
              height: '48.5px',
            }}
          />
          <div className="mt-1.5 min-h-[16px]">
            {error && (
              <span id="join-room-error" role="alert" className="text-xs" style={{ color: '#dc2626' }}>
                {error}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              style={{
                backgroundColor: '#fff',
                border: '1px solid rgba(26, 31, 24, 0.18)',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                color: '#3f4138',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={checking}
              aria-busy={checking}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity"
              style={{
                backgroundColor: ACCENT_GREEN,
                color: '#fff',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                boxShadow: `0px 2px 0px ${DARK_GREEN}`,
                opacity: checking ? 0.7 : 1,
              }}
            >
              {checking ? 'Buscando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ----------------------- Modal: editar nombre (US-07) --------------------- */

function EditRoomModal({
  room,
  onClose,
  onSaved,
}: {
  room: RoomSummary
  onClose: () => void
  onSaved: (room: RoomSummary) => void
}) {
  const [name, setName] = useState(room.name)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setError(`El nombre debe tener entre ${NAME_MIN} y ${NAME_MAX} caracteres`)
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const updated = await updateRoom(room.id, trimmed)
      onSaved(updated)
    } catch {
      setError('No se pudo guardar el cambio. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-room-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(26, 31, 24, 0.45)', border: 'none' }}
      />
      <div
        className="relative z-10 w-full max-w-md bg-white p-7"
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(26, 31, 24, 0.12)',
          boxShadow: '0px 12px 40px rgba(31, 64, 35, 0.18)',
        }}
      >
        <h2
          id="edit-room-title"
          className="mb-2"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: INK }}
        >
          Editar sala
        </h2>
        <p className="mb-5" style={{ fontSize: '14px', color: MUTED }}>
          Cambiá el nombre de tu sala de estudio.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="edit-room-name"
            style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#3f4138', marginBottom: '6px' }}
          >
            Nombre de la sala
          </label>
          <input
            id="edit-room-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'edit-room-error' : undefined}
            maxLength={NAME_MAX}
            className="w-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
            style={{
              border: `1px solid ${error ? '#dc2626' : 'rgba(26, 31, 24, 0.18)'}`,
              borderRadius: '14px',
              padding: '12px 14px',
              fontSize: '15px',
              color: INK,
              height: '48.5px',
            }}
          />
          <div className="mt-1.5 min-h-[16px]">
            {error && (
              <span id="edit-room-error" role="alert" className="text-xs" style={{ color: '#dc2626' }}>
                {error}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              style={{
                backgroundColor: '#fff',
                border: '1px solid rgba(26, 31, 24, 0.18)',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                color: '#3f4138',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity"
              style={{
                backgroundColor: ACCENT_GREEN,
                color: '#fff',
                borderRadius: '14px',
                height: '48px',
                fontWeight: 600,
                fontSize: '15px',
                boxShadow: `0px 2px 0px ${DARK_GREEN}`,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* --------------------- Modal: eliminar sala (US-07) ----------------------- */

function DeleteRoomModal({
  room,
  onClose,
  onDeleted,
}: {
  room: RoomSummary
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDelete = async () => {
    setSubmitting(true)
    setError('')
    try {
      await deleteRoom(room.id)
      onDeleted(room.id)
    } catch {
      setError('No se pudo eliminar la sala. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-room-title"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: 'rgba(26, 31, 24, 0.45)', border: 'none' }}
      />
      <div
        className="relative z-10 w-full max-w-md bg-white p-7"
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(26, 31, 24, 0.12)',
          boxShadow: '0px 12px 40px rgba(31, 64, 35, 0.18)',
        }}
      >
        <h2
          id="delete-room-title"
          className="mb-2"
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: INK }}
        >
          Eliminar sala
        </h2>
        <p className="mb-5" style={{ fontSize: '14px', color: MUTED }}>
          ¿Seguro que querés eliminar <strong style={{ color: INK }}>{room.name}</strong>? Se borrará
          también su historial de chat. Esta acción no se puede deshacer.
        </p>

        <div className="min-h-[16px] mb-3">
          {error && (
            <span role="alert" className="text-xs" style={{ color: '#dc2626' }}>
              {error}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            style={{
              backgroundColor: '#fff',
              border: '1px solid rgba(26, 31, 24, 0.18)',
              borderRadius: '14px',
              height: '48px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#3f4138',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            aria-busy={submitting}
            className="flex-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-opacity"
            style={{
              backgroundColor: CORAL,
              color: '#fff',
              borderRadius: '14px',
              height: '48px',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0px 2px 0px #9c3d22',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Sidebar items ----------------------------- */

function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="w-full flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      style={{
        backgroundColor: active ? '#dcead7' : 'transparent',
        borderRadius: '14px',
        padding: '10px 12px',
        color: active ? DARK_GREEN : MUTED,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 600,
        fontSize: '14px',
      }}
    >
      <span style={{ display: 'inline-flex', color: active ? ACCENT_GREEN : MUTED }}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span
          style={{
            backgroundColor: ACCENT_GREEN,
            color: '#fff',
            borderRadius: '9999px',
            minWidth: '23px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 7px',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/* -------------------------------- Room card ------------------------------- */

const AVATAR_COLORS = ['#4f8e4a', '#8fbe83', '#c95636', '#4e89a8', '#e89070']

function initialsOf(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase()
}

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      style={{
        backgroundColor: '#eef5ec',
        borderRadius: '9999px',
        padding: '2px 8px',
        color: DARK_GREEN,
        fontWeight: 600,
        fontSize: '12px',
      }}
    >
      <span style={{ display: 'inline-flex', color: DARK_GREEN }}>{icon}</span>
      {label}
    </span>
  )
}

function RoomCard({
  room,
  onOpen,
  onEdit,
  onDelete,
}: {
  room: RoomSummary
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const host = room.hostUsername || 'anfitrión'
  const avatarColor = AVATAR_COLORS[Math.abs(hash(room.id)) % AVATAR_COLORS.length]
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar el menú al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    globalThis.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      globalThis.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <div
      className="bg-white flex flex-col"
      style={{
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0px 6px 7px rgba(26,31,24,0.1), 0px 2px 2px rgba(26,31,24,0.06)',
      }}
    >
      <div className="flex items-start justify-between">
        <span
          style={{
            backgroundColor: '#dedacb',
            borderRadius: '9999px',
            padding: '4px 12px',
            color: '#3f4138',
            fontWeight: 700,
            fontSize: '12px',
          }}
        >
          Inactiva
        </span>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label={`Opciones de ${room.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="rounded-[10px] p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ color: MUTED }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div
              role="menu"
              aria-label={`Acciones de ${room.name}`}
              className="absolute right-0 z-20 mt-1 bg-white overflow-hidden"
              style={{
                minWidth: '160px',
                borderRadius: '12px',
                border: '1px solid rgba(26,31,24,0.12)',
                boxShadow: '0px 10px 28px rgba(31,64,35,0.16)',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
                className="w-full text-left focus:outline-none focus:bg-emerald-50 hover:bg-emerald-50"
                style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: INK }}
              >
                Editar nombre
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="w-full text-left focus:outline-none focus:bg-red-50 hover:bg-red-50"
                style={{ padding: '10px 14px', fontSize: '14px', fontWeight: 600, color: CORAL }}
              >
                Eliminar sala
              </button>
            </div>
          )}
        </div>
      </div>

      <h3
        className="mt-3"
        style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '16px', color: INK }}
      >
        {room.name}
      </h3>
      <p className="mt-1.5" style={{ fontSize: '13px', lineHeight: '19.5px', color: MUTED }}>
        Sala creada por @{host}.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <FeatureChip icon={<ChatIcon />} label="Chat" />
        <FeatureChip icon={<VideoIcon />} label="Video" />
        <FeatureChip icon={<ScreenIcon />} label="Pantalla" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            backgroundColor: avatarColor,
            width: '34px',
            height: '34px',
            border: `3px solid ${CREAM}`,
            color: '#fff',
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
          }}
          aria-hidden="true"
        >
          {initialsOf(host)}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #d7c59a',
            borderRadius: '10px',
            padding: '7px 13px',
            color: INK,
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          Abrir
        </button>
      </div>
    </div>
  )
}

// Hash estable para asignar un color de avatar por sala (sin Math.random).
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + (str.codePointAt(i) ?? 0)
  return h
}

/* ---------------------------------- Tabs ---------------------------------- */

type TabKey = 'todas' | 'envivo' | 'inactivas'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'envivo', label: 'En vivo' },
  { key: 'inactivas', label: 'Inactivas' },
]

// Estado de presencia de una sala. La presencia en vivo se integra en sprints
// posteriores (WebSockets); por ahora todas las salas se consideran inactivas.
function roomIsLive(_room: RoomSummary): boolean {
  return false
}

/* -------------------------------- Página ---------------------------------- */

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState<RoomSummary[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [editing, setEditing] = useState<RoomSummary | null>(null)
  const [deleting, setDeleting] = useState<RoomSummary | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TabKey>('todas')

  useEffect(() => {
    let active = true
    getMyRooms()
      .then((data) => active && setRooms(data))
      .catch(() => active && setLoadError('No se pudieron cargar tus salas.'))
      .finally(() => active && setLoadingRooms(false))
    return () => {
      active = false
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rooms.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false
      if (tab === 'envivo') return roomIsLive(r)
      if (tab === 'inactivas') return !roomIsLive(r)
      return true
    })
  }, [rooms, query, tab])

  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'Tú'
  const firstName = profile?.firstName ?? ''

  return (
    <main id="main-content" className="min-h-screen flex" style={{ backgroundColor: CREAM }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col justify-between shrink-0"
        style={{
          width: '240px',
          backgroundColor: SIDEBAR_BG,
          borderRight: '1px solid rgba(26,31,24,0.08)',
          padding: '24px 17px 24px 16px',
        }}
        aria-label="Navegación principal"
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2">
            <AulaLogoMark size={28} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '19.6px', color: INK }}>
              aula<span style={{ color: CORAL }}>.</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            style={{
              backgroundColor: ACCENT_GREEN,
              color: '#fff',
              borderRadius: '10px',
              padding: '6px 12px',
              boxShadow: `0px 2px 0px ${DARK_GREEN}`,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            <PlusIcon size={14} />
            Nueva sala
          </button>

          <nav className="flex flex-col gap-1">
            <NavItem icon={<RoomsIcon />} label="Mis salas" active badge={rooms.length} />
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <NavItem icon={<LogoutIcon />} label="Cerrar sesión" onClick={handleLogout} />
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ borderRadius: '16px', padding: '12px', boxShadow: '0px 1px 1px rgba(26,31,24,0.06)' }}
            aria-label="Abrir ajustes de perfil"
          >
            <div className="relative shrink-0" style={{ width: '40px', height: '40px' }}>
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="rounded-full object-cover"
                  style={{ width: '40px', height: '40px' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: '40px', height: '40px', backgroundColor: '#e8b43a', color: '#fff', fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '14px' }}
                >
                  {initialsOf(fullName)}
                </div>
              )}
              <span
                className="absolute rounded-full"
                style={{ width: '10px', height: '10px', backgroundColor: ACCENT_GREEN, border: `2px solid ${CREAM}`, right: 0, bottom: 0 }}
              />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '14px', color: INK }}>
                {fullName}
              </p>
              <p className="truncate" style={{ fontSize: '12px', color: MUTED }}>
                {profile?.email}
              </p>
            </div>
            <span style={{ color: MUTED }}>
              <SettingsIcon />
            </span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-6 md:px-10 pt-8">
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '1.44px',
              textTransform: 'uppercase',
              color: ACCENT_GREEN,
            }}
          >
            Hola, {firstName || 'de nuevo'} 🌿
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '32px', color: INK }}>
              Tus salas de estudio
            </h1>

            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(26,31,24,0.5)' }}>
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar sala..."
                  aria-label="Buscar sala"
                  className="bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{
                    border: '1px solid rgba(26,31,24,0.15)',
                    borderRadius: '14px',
                    height: '42px',
                    width: '220px',
                    paddingLeft: '37px',
                    paddingRight: '14px',
                    fontSize: '14px',
                    color: INK,
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowJoin(true)}
                className="flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                style={{
                  backgroundColor: '#fff',
                  color: DARK_GREEN,
                  border: `1px solid ${ACCENT_GREEN}`,
                  borderRadius: '14px',
                  padding: '10px 18px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '15px',
                }}
              >
                Unirse por ID
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                style={{
                  backgroundColor: ACCENT_GREEN,
                  color: '#fff',
                  borderRadius: '14px',
                  padding: '10px 20px',
                  boxShadow: `0px 2px 0px ${DARK_GREEN}`,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 600,
                  fontSize: '15px',
                }}
              >
                <PlusIcon size={16} />
                Nueva sala
              </button>
            </div>
          </div>

          {/* Tabs: filtran las salas por estado de presencia. */}
          <div className="flex gap-1 mt-6" role="tablist" aria-label="Filtrar salas" style={{ borderBottom: '1px solid rgba(26,31,24,0.1)' }}>
            {TABS.map(({ key, label }) => {
              const isActive = tab === key
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(key)}
                  className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-t"
                  style={{
                    padding: '9px 16px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: isActive ? ACCENT_GREEN : MUTED,
                    borderBottom: isActive ? `2px solid ${ACCENT_GREEN}` : '2px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <section className="px-6 md:px-10 py-6 flex-1" aria-label="Tus salas de estudio" aria-live="polite">
          {loadingRooms ? (
            <p className="text-center py-16" style={{ color: MUTED }} aria-busy="true">
              Cargando tus salas...
            </p>
          ) : loadError ? (
            <p className="text-center py-16" role="alert" style={{ color: '#b91c1c' }}>
              {loadError}
            </p>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16" style={{ color: MUTED }}>
              <p className="text-lg mb-2">Aún no tienes salas de estudio.</p>
              <p className="text-sm">Creá tu primera sala para empezar a estudiar con tu gente.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16" style={{ color: MUTED }}>
              {query.trim()
                ? `No hay salas que coincidan con “${query}”.`
                : tab === 'envivo'
                  ? 'No tenés salas en vivo en este momento.'
                  : tab === 'inactivas'
                    ? 'No tenés salas inactivas.'
                    : 'No hay salas para mostrar.'}
            </p>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filtered.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onOpen={() => navigate(`/room/${room.id}`)}
                  onEdit={() => setEditing(room)}
                  onDelete={() => setDeleting(room)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {showCreate && (
        <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={(room) => navigate(`/room/${room.id}`)} />
      )}

      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}

      {editing && (
        <EditRoomModal
          room={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
            setEditing(null)
          }}
        />
      )}

      {deleting && (
        <DeleteRoomModal
          room={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            setRooms((prev) => prev.filter((r) => r.id !== id))
            setDeleting(null)
          }}
        />
      )}
    </main>
  )
}
