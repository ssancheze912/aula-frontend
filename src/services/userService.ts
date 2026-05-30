import { api, ApiError } from './api'

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl: string
  provider: 'email' | 'google'
  bio?: string
  link?: string
  university?: string
  career?: string
  year?: string
  country?: string
}

/**
 * Disponibilidad de username (público). Se consulta durante el registro,
 * antes de tener sesión.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { available } = await api<{ available: boolean }>(
    `/users/check-username/${encodeURIComponent(username)}`,
    { auth: false }
  )
  return available
}

/**
 * Crea el perfil del usuario autenticado vía backend (el uid se toma del token).
 */
export async function createUserProfile(profile: UserProfile): Promise<void> {
  // El uid lo deriva el backend del token; no se envía en el body.
  await api('/users', {
    method: 'POST',
    body: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      provider: profile.provider,
    },
  })
}

/** Obtiene el perfil del usuario. Devuelve null si aún no existe (404). */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    return await api<UserProfile>(`/users/${uid}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

/** Campos editables del perfil (US-04). */
export type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    | 'firstName'
    | 'lastName'
    | 'avatarUrl'
    | 'username'
    | 'bio'
    | 'link'
    | 'university'
    | 'career'
    | 'year'
    | 'country'
  >
>

/**
 * Actualiza el perfil del usuario (US-04). Devuelve el perfil ya actualizado.
 * Lanza ApiError 409 si el username elegido ya está en uso.
 */
export async function updateUserProfile(
  uid: string,
  updates: ProfileUpdate
): Promise<UserProfile> {
  return api<UserProfile>(`/users/${uid}`, { method: 'PATCH', body: updates })
}

/** Elimina la cuenta del usuario (US-05): perfil + username + Firebase Auth. */
export async function deleteAccount(uid: string): Promise<void> {
  await api(`/users/${uid}`, { method: 'DELETE' })
}
