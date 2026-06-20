import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Socket } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'
import { getRoom, type RoomSummary } from '../services/roomService'
import { ApiError } from '../services/api'
import {
  connectRealtime,
  fetchIceServers,
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

/* --------------------------- Estado de un par ----------------------------- */

interface RemotePeer {
  socketId: string
  userId: string
  username: string
  avatarUrl: string
  stream: MediaStream | null
  muted: boolean
  cameraOff: boolean
}

/* ----------------------------- Tile de video ------------------------------ */

function MicOffBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: '22px', height: '22px', backgroundColor: CORAL, color: '#fff' }}
      title="Micrófono silenciado"
    >
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 9v3a3 3 0 0 0 5 2.1M15 11V6a3 3 0 0 0-6 0v1M5 11a7 7 0 0 0 11.5 5.4M19 11M12 19v3M4 3l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function VideoTile({
  stream,
  username,
  avatarUrl,
  cameraOff,
  muted,
  isLocal,
  label,
}: {
  stream: MediaStream | null
  username: string
  avatarUrl?: string
  cameraOff: boolean
  muted: boolean
  isLocal: boolean
  label: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (el && stream && el.srcObject !== stream) el.srcObject = stream
  }, [stream])

  const showVideo = !!stream && !cameraOff

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#11150f', aspectRatio: '4 / 3', boxShadow: '0px 4px 10px rgba(26,31,24,0.18)' }}
    >
      {/* El <video> se mantiene montado (aunque oculto) para no perder la pista al alternar cámara. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
        style={{ display: showVideo ? 'block' : 'none', transform: isLocal ? 'scaleX(-1)' : undefined }}
      />
      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar username={username} avatarUrl={avatarUrl} size={84} />
        </div>
      )}

      {/* Etiqueta de nombre + estado de micrófono */}
      <div
        className="absolute left-2 bottom-2 right-2 flex items-center justify-between gap-2"
        style={{ pointerEvents: 'none' }}
      >
        <span
          className="truncate inline-flex items-center gap-1.5"
          style={{
            backgroundColor: 'rgba(17,21,15,0.62)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '8px',
            padding: '3px 8px',
            maxWidth: '80%',
          }}
        >
          {label}
        </span>
        {muted && <MicOffBadge />}
      </div>
    </div>
  )
}

/* ------------------------------ Control media ----------------------------- */

function ControlButton({
  active,
  onClick,
  disabled,
  labelOn,
  labelOff,
  iconOn,
  iconOff,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  labelOn: string
  labelOff: string
  iconOn: React.ReactNode
  iconOff: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={!active}
      aria-label={active ? labelOff : labelOn}
      className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-40"
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '9999px',
        backgroundColor: active ? '#fff' : CORAL,
        color: active ? INK : '#fff',
        border: `1px solid ${active ? 'rgba(26,31,24,0.18)' : CORAL}`,
        boxShadow: '0px 2px 4px rgba(26,31,24,0.12)',
      }}
    >
      {active ? iconOn : iconOff}
    </button>
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

  // WebRTC (US-12 / US-09)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remotePeers, setRemotePeers] = useState<Record<string, RemotePeer>>({})
  const [mediaError, setMediaError] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const socketRef = useRef<Socket | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const peerMetaRef = useRef<Map<string, { userId: string; username: string; avatarUrl: string }>>(new Map())
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const iceServersRef = useRef<RTCIceServer[]>([{ urls: 'stun:stun.l.google.com:19302' }])

  const isHost = !!user && !!room && user.uid === room.hostId

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

  // 2. Conexión en tiempo real + malla WebRTC. Vive en un solo efecto para compartir el
  //    socket y limpiar todo (pistas y RTCPeerConnection) al salir de la sala.
  useEffect(() => {
    if (loadState !== 'ready' || !roomId || !user || !profile) return

    let disposed = false
    const socket = connectRealtime()
    socketRef.current = socket
    const identity = {
      roomId,
      userId: user.uid,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
    }

    const peers = peersRef.current
    const peerMeta = peerMetaRef.current
    const pendingIce = pendingIceRef.current

    const removePeer = (peerId: string) => {
      const pc = peers.get(peerId)
      if (pc) {
        pc.onicecandidate = null
        pc.ontrack = null
        pc.onconnectionstatechange = null
        pc.close()
      }
      peers.delete(peerId)
      peerMeta.delete(peerId)
      pendingIce.delete(peerId)
      setRemotePeers((prev) => {
        if (!(peerId in prev)) return prev
        const next = { ...prev }
        delete next[peerId]
        return next
      })
    }

    const upsertRemote = (peerId: string, patch: Partial<RemotePeer>) => {
      const meta = peerMeta.get(peerId)
      setRemotePeers((prev) => {
        const base: RemotePeer = prev[peerId] ?? {
          socketId: peerId,
          userId: meta?.userId ?? '',
          username: meta?.username ?? 'Invitado',
          avatarUrl: meta?.avatarUrl ?? '',
          stream: null,
          muted: false,
          cameraOff: false,
        }
        return { ...prev, [peerId]: { ...base, ...patch } }
      })
    }

    const createPeer = (peerId: string): RTCPeerConnection => {
      const existing = peers.get(peerId)
      if (existing) return existing

      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })
      localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!))

      pc.onicecandidate = (e) => {
        if (e.candidate) socket.emit('rtc:ice', { to: peerId, candidate: e.candidate })
      }
      pc.ontrack = (e) => {
        upsertRemote(peerId, { stream: e.streams[0] ?? null })
      }
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') removePeer(peerId)
      }

      peers.set(peerId, pc)
      return pc
    }

    const flushIce = async (peerId: string, pc: RTCPeerConnection) => {
      const pending = pendingIce.get(peerId)
      if (!pending) return
      pendingIce.delete(peerId)
      for (const c of pending) await pc.addIceCandidate(c).catch(() => {})
    }

    // --- Chat / presencia ---
    socket.on('connect', () => {
      setConnected(true)
      socket.emit('room:join', identity)
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('room:joined', ({ users }: { users: RoomMember[] }) => setMembers(users))
    socket.on('chat:history', ({ messages: history }: { messages: ChatMessage[] }) => setMessages(history))
    socket.on('chat:message', ({ message }: { message: ChatMessage }) =>
      setMessages((prev) => [...prev, message])
    )
    socket.on('room:user_joined', ({ user: member }: { user: RoomMember }) =>
      setMembers((prev) => (prev.some((m) => m.userId === member.userId) ? prev : [...prev, member]))
    )
    socket.on('room:user_left', ({ userId }: { userId: string }) => {
      setMembers((prev) => prev.filter((m) => m.userId !== userId))
      // Cerrar cualquier conexión P2P de quien se fue (el socketId se resuelve por userId).
      for (const [peerId, meta] of peerMeta.entries()) {
        if (meta.userId === userId) removePeer(peerId)
      }
    })
    socket.on('chat:error', ({ error }: { error: string }) => setChatError(error))

    // --- Señalización WebRTC (malla P2P) ---
    // Un nuevo par anunció estar listo: los que YA estábamos iniciamos la oferta hacia él.
    socket.on(
      'rtc:peer_ready',
      ({ socketId, userId, username, avatarUrl }: { socketId: string; userId: string; username: string; avatarUrl?: string }) => {
        peerMeta.set(socketId, { userId, username, avatarUrl: avatarUrl ?? '' })
        const pc = createPeer(socketId)
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('rtc:offer', {
              to: socketId,
              offer: pc.localDescription,
              userId: user.uid,
              username: profile.username,
              avatarUrl: profile.avatarUrl,
            })
          })
          .catch(() => {})
      }
    )

    socket.on(
      'rtc:offer',
      async ({ from, offer, userId, username, avatarUrl }: { from: string; offer: RTCSessionDescriptionInit; userId?: string; username?: string; avatarUrl?: string }) => {
        if (userId) peerMeta.set(from, { userId, username: username ?? 'Invitado', avatarUrl: avatarUrl ?? '' })
        const pc = createPeer(from)
        const polite = (socket.id ?? '') > from
        const collision = pc.signalingState !== 'stable'
        if (collision && !polite) return // el "impolite" ignora la oferta en colisión (glare)
        try {
          if (collision) await pc.setLocalDescription({ type: 'rollback' })
          await pc.setRemoteDescription(new RTCSessionDescription(offer))
          await flushIce(from, pc)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('rtc:answer', {
            to: from,
            answer: pc.localDescription,
            userId: user.uid,
            username: profile.username,
            avatarUrl: profile.avatarUrl,
          })
        } catch {
          /* negociación fallida; onconnectionstatechange limpiará si queda en failed */
        }
      }
    )

    socket.on(
      'rtc:answer',
      async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
        const pc = peers.get(from)
        if (!pc) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          await flushIce(from, pc)
        } catch {
          /* ignore */
        }
      }
    )

    socket.on(
      'rtc:ice',
      ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        const pc = peers.get(from)
        if (pc?.remoteDescription?.type) {
          pc.addIceCandidate(candidate).catch(() => {})
        } else {
          const list = pendingIce.get(from) ?? []
          list.push(candidate)
          pendingIce.set(from, list)
        }
      }
    )

    socket.on(
      'rtc:media_state_update',
      ({ userId, isMuted, isCameraOff }: { userId: string; isMuted: boolean; isCameraOff: boolean }) => {
        for (const [peerId, meta] of peerMeta.entries()) {
          if (meta.userId === userId) upsertRemote(peerId, { muted: isMuted, cameraOff: isCameraOff })
        }
      }
    )

    // Pedir cámara/micrófono y ICE, y solo entonces anunciarse para la malla.
    ;(async () => {
      iceServersRef.current = await fetchIceServers()
      if (disposed) return
      // Pedimos micrófono y cámara por separado: una sola petición combinada
      // ({ audio, video }) rechaza ambos cuando el usuario niega solo uno, así que
      // negar el micrófono dejaba sin video y viceversa. Combinamos lo concedido.
      const tracks: MediaStreamTrack[] = []
      let micDenied = false
      let camDenied = false
      try {
        const audio = await navigator.mediaDevices.getUserMedia({ audio: true })
        tracks.push(...audio.getAudioTracks())
      } catch {
        micDenied = true
      }
      try {
        const video = await navigator.mediaDevices.getUserMedia({ video: true })
        tracks.push(...video.getVideoTracks())
      } catch {
        camDenied = true
      }
      const stream = tracks.length > 0 ? new MediaStream(tracks) : null
      if (micDenied && camDenied) {
        setMediaError(
          'No se pudo acceder a la cámara ni al micrófono (permiso denegado o sin dispositivo). Puedes ver y oír a los demás, pero no transmitirás.'
        )
      } else if (micDenied) {
        setMediaError(
          'No se pudo acceder al micrófono (permiso denegado o sin dispositivo). Transmitirás solo video.'
        )
      } else if (camDenied) {
        setMediaError(
          'No se pudo acceder a la cámara (permiso denegado o sin dispositivo). Transmitirás solo audio.'
        )
      }
      if (disposed) {
        stream?.getTracks().forEach((t) => t.stop())
        return
      }
      // Reflejar en los controles y en los demás participantes lo que realmente se obtuvo.
      setMicOn(!micDenied)
      setCamOn(!camDenied)
      localStreamRef.current = stream
      setLocalStream(stream)
      socket.emit('rtc:ready', {
        roomId,
        userId: user.uid,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      })
      if (micDenied || camDenied) emitMediaState(!micDenied, !camDenied)
    })()

    return () => {
      disposed = true
      socket.emit('room:leave', { roomId, userId: user.uid })
      socket.off()
      socket.disconnect()
      peers.forEach((pc) => {
        pc.onicecandidate = null
        pc.ontrack = null
        pc.onconnectionstatechange = null
        pc.close()
      })
      peers.clear()
      peerMeta.clear()
      pendingIce.clear()
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      socketRef.current = null
      setRemotePeers({})
      setLocalStream(null)
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
    socketRef.current.emit('chat:send', {
      roomId,
      senderId: user.uid,
      senderUsername: profile.username,
      senderAvatarUrl: profile.avatarUrl,
      text,
    })
    setDraft('')
  }

  const handleCopyId = async () => {
    if (!roomId) return
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* sin permiso de portapapeles */
    }
  }

  const emitMediaState = (mic: boolean, cam: boolean) => {
    socketRef.current?.emit('rtc:media_state', {
      roomId,
      userId: user?.uid,
      isMuted: !mic,
      isCameraOff: !cam,
      isScreenSharing: false,
    })
  }

  const toggleMic = () => {
    const stream = localStreamRef.current
    if (!stream || stream.getAudioTracks().length === 0) return
    const next = !micOn
    stream.getAudioTracks().forEach((t) => (t.enabled = next))
    setMicOn(next)
    emitMediaState(next, camOn)
  }

  const toggleCam = () => {
    const stream = localStreamRef.current
    if (!stream || stream.getVideoTracks().length === 0) return
    const next = !camOn
    stream.getVideoTracks().forEach((t) => (t.enabled = next))
    setCamOn(next)
    emitMediaState(micOn, next)
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

  const localLabel = `${profile?.username ?? 'Tú'} (tú)`
  const remoteList = Object.values(remotePeers)
  const tileCount = 1 + remoteList.length

  return (
    <main id="main-content" className="h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      {/* Cabecera */}
      <header
        className="flex items-center justify-between gap-4 shrink-0"
        style={{ backgroundColor: PANEL_BG, borderBottom: '1px solid rgba(26,31,24,0.08)', padding: '14px 20px' }}
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
            <h1 className="truncate" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: INK }}>
              {room!.name}
            </h1>
            <p className="truncate" style={{ fontSize: '12px', color: MUTED }}>
              Anfitrión: @{room!.hostUsername || 'anfitrión'}
              {isHost && <span style={{ color: ACCENT_GREEN, fontWeight: 700 }}> · eres el anfitrión</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
        </div>
      </header>

      {/* Cuerpo: escenario de video (US-09) + panel de chat */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {/* Escenario de video */}
        <section
          className="flex-1 min-h-0 flex flex-col"
          aria-label={`Videollamada · ${tileCount} ${tileCount === 1 ? 'participante' : 'participantes'}`}
        >
          {mediaError && (
            <p role="alert" className="m-3 mb-0 p-3 rounded-lg" style={{ backgroundColor: '#fff4ed', border: `1px solid ${CORAL}`, color: '#8a3b22', fontSize: '13px' }}>
              {mediaError}
            </p>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '16px' }}>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignContent: 'start' }}
            >
              {/* Tu propio tile */}
              <VideoTile
                stream={localStream}
                username={profile?.username ?? 'Tú'}
                avatarUrl={profile?.avatarUrl}
                cameraOff={!camOn || !localStream}
                muted={!micOn}
                isLocal
                label={localLabel}
              />
              {/* Pares remotos */}
              {remoteList.map((p) => (
                <VideoTile
                  key={p.socketId}
                  stream={p.stream}
                  username={p.username}
                  avatarUrl={p.avatarUrl || members.find((m) => m.userId === p.userId)?.avatarUrl}
                  cameraOff={p.cameraOff}
                  muted={p.muted}
                  isLocal={false}
                  label={p.username}
                />
              ))}
            </div>

            {remoteList.length === 0 && (
              <p className="text-center" style={{ color: MUTED, fontSize: '13px', marginTop: '16px' }}>
                Esperando a que se unan más participantes… Comparte el ID de la sala.
              </p>
            )}
          </div>

          {/* Barra de controles de media */}
          <div
            className="shrink-0 flex items-center justify-center gap-3"
            style={{ padding: '12px', borderTop: '1px solid rgba(26,31,24,0.08)', backgroundColor: PANEL_BG }}
          >
            <ControlButton
              active={micOn}
              onClick={toggleMic}
              disabled={!localStream}
              labelOn="Activar micrófono"
              labelOff="Silenciar micrófono"
              iconOn={
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
              iconOff={
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 9v3a3 3 0 0 0 5 2.1M15 11V6a3 3 0 0 0-6 0v1M5 11a7 7 0 0 0 11.5 5.4M12 19v3M4 3l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <ControlButton
              active={camOn}
              onClick={toggleCam}
              disabled={!localStream}
              labelOn="Encender cámara"
              labelOff="Apagar cámara"
              iconOn={
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              }
              iconOff={
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M16 10l5-3v10l-5-3M3 6h11v12H3zM4 3l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Salir de la sala"
              style={{ height: '46px', borderRadius: '9999px', padding: '0 20px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '14px' }}
            >
              Salir
            </button>
          </div>
        </section>

        {/* Panel de chat */}
        <aside
          className="flex flex-col min-h-0 shrink-0 md:w-[360px]"
          style={{ borderLeft: '1px solid rgba(26,31,24,0.08)', backgroundColor: CREAM }}
          aria-label="Chat de la sala"
        >
          <section className="flex-1 min-h-0 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 ? (
              <p className="text-center py-10" style={{ color: MUTED, fontSize: '14px' }}>
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
          </section>

          <footer
            className="shrink-0"
            style={{ borderTop: '1px solid rgba(26,31,24,0.08)', backgroundColor: PANEL_BG, padding: '12px' }}
          >
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
                style={{ border: '1px solid rgba(26,31,24,0.18)', borderRadius: '14px', height: '46px', padding: '0 16px', fontSize: '15px', color: INK }}
              />
              <button
                type="submit"
                disabled={!connected || !draft.trim()}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-opacity disabled:opacity-50"
                aria-label="Enviar mensaje"
                style={{ backgroundColor: ACCENT_GREEN, color: '#fff', borderRadius: '14px', height: '46px', padding: '0 18px', boxShadow: `0px 2px 0px ${DARK_GREEN}`, fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '15px' }}
              >
                Enviar
              </button>
            </form>
          </footer>
        </aside>
      </div>
    </main>
  )
}
