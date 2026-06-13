import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'
import { getRoom, type RoomSummary } from '../services/roomService'
import { ApiError } from '../services/api'
import {
  connectRealtime,
  type ChatMessage,
  type RoomMember,
} from '../services/realtimeService'

const CREAM = '#fbf7ee'
const PANEL_BG = '#f4ecdc'
const ACCENT_GREEN = '#4f8e4a'
const DARK_GREEN = '#2e5f30'
const CORAL = '#c95636'
const INK = '#1a1f18'
const MUTED = '#6e6b5e'

const AVATAR_COLORS = ['#4f8e4a', '#8fbe83', '#c95636', '#4e89a8', '#e89070']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + (str.codePointAt(i) ?? 0)
  return h
}

function colorFor(seed: string): string {
  return AVATAR_COLORS[Math.abs(hash(seed)) % AVATAR_COLORS.length]
}

function initialsOf(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase()
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* -------------------------------- Avatar ---------------------------------- */

function Avatar({
  username,
  avatarUrl,
  size = 32,
}: {
  username: string
  avatarUrl?: string
  size?: number
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(username),
        color: '#fff',
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.4,
      }}
      aria-hidden="true"
    >
      {initialsOf(username)}
    </div>
  )
}

/* ------------------------------ Burbuja chat ------------------------------ */

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <li className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar username={message.senderUsername} avatarUrl={message.senderAvatarUrl} size={32} />
      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-baseline gap-2" style={{ flexDirection: isOwn ? 'row-reverse' : 'row' }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '13px', color: INK }}>
            {isOwn ? 'Tú' : message.senderUsername}
          </span>
          <span style={{ fontSize: '11px', color: MUTED }}>{formatTime(message.createdAt)}</span>
        </div>
        <div
          className="mt-1"
          style={{
            backgroundColor: isOwn ? ACCENT_GREEN : '#fff',
            color: isOwn ? '#fff' : INK,
            borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            padding: '8px 12px',
            fontSize: '14px',
            lineHeight: '20px',
            boxShadow: '0px 1px 2px rgba(26,31,24,0.08)',
            wordBreak: 'break-word',
          }}
        >
          {message.text}
        </div>
      </div>
    </li>
  )
}

/* --------------------------------- Página --------------------------------- */

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [room, setRoom] = useState<RoomSummary | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<RoomMember[]>([])
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)
  const [chatError, setChatError] = useState('')
  const [copied, setCopied] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  const isHost = !!user && !!room && user.uid === room.hostId

  // Copiar el ID de la sala al portapapeles (para compartirlo e invitar por ID — US-08).
  const handleCopyId = async () => {
    if (!roomId) return
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sin permiso de portapapeles (p. ej. contexto inseguro): no rompemos la UI.
    }
  }

  // 1. Cargar metadatos de la sala (valida existencia — US-08).
  useEffect(() => {
    if (!roomId) return
    let active = true
    getRoom(roomId)
      .then((r) => {
        if (!active) return
        setRoom(r)
        setLoadState('ready')
      })
      .catch((err) => {
        if (!active) return
        setLoadState(err instanceof ApiError && err.status === 404 ? 'notfound' : 'error')
      })
    return () => {
      active = false
    }
  }, [roomId])

  // 2. Conectar al servidor de tiempo real cuando la sala existe y hay identidad.
  useEffect(() => {
    if (loadState !== 'ready' || !roomId || !user || !profile) return

    const socket = connectRealtime()
    socketRef.current = socket
    const identity = {
      roomId,
      userId: user.uid,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    }

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('room:join', identity)
    })
    socket.on('disconnect', () => setConnected(false))

    // Estado inicial al unirse.
    socket.on('room:joined', ({ users }: { users: RoomMember[] }) => setMembers(users))
    socket.on('chat:history', ({ messages: history }: { messages: ChatMessage[] }) =>
      setMessages(history)
    )

    // Eventos en vivo.
    socket.on('chat:message', ({ message }: { message: ChatMessage }) =>
      setMessages((prev) => [...prev, message])
    )
    socket.on('room:user_joined', ({ user: member }: { user: RoomMember }) =>
      setMembers((prev) => (prev.some((m) => m.userId === member.userId) ? prev : [...prev, member]))
    )
    socket.on('room:user_left', ({ userId }: { userId: string }) =>
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
    )
    socket.on('chat:error', ({ error }: { error: string }) => setChatError(error))

    return () => {
      socket.emit('room:leave', { roomId, userId: user.uid })
      socket.off()
      socket.disconnect()
      socketRef.current = null
    }
  }, [loadState, roomId, user, profile])

  // 3. Auto-scroll al último mensaje.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || !socketRef.current || !user || !profile || !roomId) return
    setChatError('')
    // El servidor reemite el mensaje (con id y fecha) a toda la sala, incluido el
    // emisor: no se hace render optimista para conservar el orden del servidor.
    socketRef.current.emit('chat:send', {
      roomId,
      senderId: user.uid,
      senderUsername: profile.username,
      senderAvatarUrl: profile.avatarUrl,
      text,
    })
    setDraft('')
  }

  /* ----------------------------- Estados de carga ---------------------------- */

  if (loadState === 'loading') {
    return (
      <main
        id="main-content"
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: CREAM, color: MUTED }}
        aria-busy="true"
      >
        Cargando sala...
      </main>
    )
  }

  if (loadState === 'notfound' || loadState === 'error') {
    return (
      <main
        id="main-content"
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ backgroundColor: CREAM }}
      >
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '24px', color: INK }}>
          {loadState === 'notfound' ? 'Sala no encontrada' : 'No se pudo abrir la sala'}
        </h1>
        <p style={{ color: MUTED, fontSize: '15px' }}>
          {loadState === 'notfound'
            ? 'El ID de la sala no existe o fue eliminada.'
            : 'Ocurrió un error al cargar la sala. Intentá de nuevo.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
          ← Volver al dashboard
        </button>
      </main>
    )
  }

  /* --------------------------------- Sala lista ------------------------------ */

  return (
    <main id="main-content" className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* Cabecera */}
      <header
        className="flex items-center justify-between gap-4 shrink-0"
        style={{
          backgroundColor: PANEL_BG,
          borderBottom: '1px solid rgba(26,31,24,0.08)',
          padding: '14px 20px',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Salir de la sala y volver al dashboard"
            className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-[10px]"
            style={{ color: MUTED, padding: '6px' }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 8l-4 4 4 4M6 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1
              className="truncate"
              style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: INK }}
            >
              {room!.name}
            </h1>
            <p className="truncate" style={{ fontSize: '12px', color: MUTED }}>
              Anfitrión: @{room!.hostUsername || 'anfitrión'}
              {isHost && (
                <span style={{ color: ACCENT_GREEN, fontWeight: 700 }}> · eres el anfitrión</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Copiar ID de la sala (para invitar por ID) */}
          <button
            type="button"
            onClick={handleCopyId}
            aria-label="Copiar ID de la sala al portapapeles"
            className="inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500"
            style={{
              backgroundColor: '#fff',
              border: `1px solid ${copied ? ACCENT_GREEN : '#d7c59a'}`,
              borderRadius: '10px',
              padding: '6px 12px',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              color: copied ? DARK_GREEN : INK,
            }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {copied ? (
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </>
              )}
            </svg>
            {copied ? '¡Copiado!' : 'Copiar ID'}
          </button>

          {/* Indicador de conexión */}
          <span
            className="inline-flex items-center gap-1.5"
            style={{ fontSize: '12px', fontWeight: 600, color: connected ? DARK_GREEN : CORAL }}
          >
            <span
              className="rounded-full"
              style={{ width: '8px', height: '8px', backgroundColor: connected ? ACCENT_GREEN : CORAL }}
              aria-hidden="true"
            />
            {connected ? 'Conectado' : 'Conectando...'}
          </span>

          {/* Presencia: avatares de los miembros en la sala */}
          <div className="flex items-center" aria-label={`${members.length} personas en la sala`}>
            {members.slice(0, 5).map((m) => (
              <span key={m.userId} style={{ marginLeft: '-8px' }} title={`@${m.username}`}>
                <Avatar username={m.username} avatarUrl={m.avatarUrl} size={30} />
              </span>
            ))}
            {members.length > 5 && (
              <span
                className="rounded-full flex items-center justify-center"
                style={{
                  marginLeft: '-8px',
                  width: '30px',
                  height: '30px',
                  backgroundColor: '#dedacb',
                  color: '#3f4138',
                  fontWeight: 700,
                  fontSize: '12px',
                  border: `2px solid ${CREAM}`,
                }}
              >
                +{members.length - 5}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <section
        className="flex-1 overflow-y-auto px-4 md:px-8 py-5"
        aria-label="Mensajes de la sala"
        aria-live="polite"
      >
        <div className="mx-auto" style={{ maxWidth: '760px' }}>
          {messages.length === 0 ? (
            <p className="text-center py-16" style={{ color: MUTED, fontSize: '14px' }}>
              Aún no hay mensajes. ¡Saluda a la sala! 🌿
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} isOwn={m.senderId === user?.uid} />
              ))}
            </ul>
          )}
          <div ref={listEndRef} />
        </div>
      </section>

      {/* Composer */}
      <footer
        className="shrink-0"
        style={{ borderTop: '1px solid rgba(26,31,24,0.08)', backgroundColor: PANEL_BG, padding: '12px 16px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '760px' }}>
          {chatError && (
            <p role="alert" className="mb-2" style={{ color: '#b91c1c', fontSize: '13px' }}>
              {chatError}
            </p>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Escribe un mensaje
            </label>
            <input
              id="chat-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={connected ? 'Escribe un mensaje...' : 'Conectando con la sala...'}
              disabled={!connected}
              autoComplete="off"
              maxLength={2000}
              className="flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              style={{
                border: '1px solid rgba(26,31,24,0.18)',
                borderRadius: '14px',
                height: '46px',
                padding: '0 16px',
                fontSize: '15px',
                color: INK,
              }}
            />
            <button
              type="submit"
              disabled={!connected || !draft.trim()}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity disabled:opacity-50"
              aria-label="Enviar mensaje"
              style={{
                backgroundColor: ACCENT_GREEN,
                color: '#fff',
                borderRadius: '14px',
                height: '46px',
                padding: '0 20px',
                boxShadow: `0px 2px 0px ${DARK_GREEN}`,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      </footer>
    </main>
  )
}
