import { io, type Socket } from 'socket.io-client'

const REALTIME_URL = import.meta.env.VITE_BACKEND_REALTIME_URL ?? 'http://localhost:3002'

/** Mensaje de chat tal como lo emite backend-realtime (createdAt en ISO 8601). */
export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderUsername: string
  senderAvatarUrl: string
  text: string
  type: 'text' | 'system'
  createdAt: string
}

/** Miembro presente en la sala (presencia en vivo). */
export interface RoomMember {
  userId: string
  username: string
  avatarUrl: string
}

/** Datos que el cliente envía al unirse a una sala. */
export interface JoinPayload {
  roomId: string
  userId: string
  username: string
  avatarUrl: string
}

/**
 * Abre una conexión Socket.io contra backend-realtime. El llamador es responsable
 * de registrar los listeners y de cerrar la conexión (`socket.disconnect()`) al salir.
 */
export function connectRealtime(): Socket {
  return io(REALTIME_URL, { transports: ['websocket'] })
}
