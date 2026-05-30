import { api } from './api'

/** Sala tal como la devuelve backend-main (sin timestamps serializados). */
export interface RoomSummary {
  id: string
  name: string
  hostId: string
  hostUsername: string
}

/** Crea una sala y devuelve sus datos (incluido el ID generado). */
export async function createRoom(name: string): Promise<RoomSummary> {
  return api<RoomSummary>('/rooms', {
    method: 'POST',
    body: { name },
  })
}

/** Lista las salas creadas por el usuario autenticado (más recientes primero). */
export async function getMyRooms(): Promise<RoomSummary[]> {
  return api<RoomSummary[]>('/rooms')
}

/** Obtiene una sala por ID. */
export async function getRoom(id: string): Promise<RoomSummary> {
  return api<RoomSummary>(`/rooms/${encodeURIComponent(id)}`)
}
