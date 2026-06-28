import { auth } from '../config/firebase'
import { envUrl } from '../config/env'

const BASE_URL = envUrl(import.meta.env.VITE_BACKEND_MAIN_URL, 'http://localhost:3001')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Adjunta el ID token de Firebase del usuario actual. Default: true. */
  auth?: boolean
}

/**
 * Cliente HTTP contra backend-main. Adjunta el `Authorization: Bearer <idToken>`
 * cuando `auth` es true (default).
 */
export async function api<T = unknown>(
  path: string,
  { method = 'GET', body, auth: authed = true }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (authed) {
    const current = auth.currentUser
    if (!current) throw new ApiError(401, 'No hay sesión activa')
    headers.Authorization = `Bearer ${await current.getIdToken()}`
  }

  // Validar la ruta antes de construir la URL (evita inyección de host/esquema):
  // solo se acepta una ruta relativa de la API con caracteres seguros.
  if (!/^\/[A-Za-z0-9\-._~/%]*$/.test(path)) {
    throw new ApiError(400, 'Ruta de API inválida')
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? 'Error de red')
  }
  return data as T
}
