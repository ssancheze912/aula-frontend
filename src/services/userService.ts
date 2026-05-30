import { apiRequest } from '../api/client'
import type { CreateUserProfileInput, UserProfile } from '../types/auth'

export type { UserProfile, CreateUserProfileInput }

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const data = await apiRequest<{ available: boolean }>(
    `/api/users/username/${encodeURIComponent(username)}/available`
  )
  return data.available
}

export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/users/profile', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    return await apiRequest<UserProfile>('/api/users/profile')
  } catch {
    return null
  }
}
