import {
  apiRequest,
  clearAuthTokens,
  setAuthToken,
  setRefreshToken,
  ApiError,
} from '../api/client'
import type { AuthResponse, SessionResponse } from '../types/auth'
import { requestGoogleIdToken } from './googleAuth'

export function persistAuthSession(response: AuthResponse): void {
  setAuthToken(response.token)
  setRefreshToken(response.refreshToken)
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  persistAuthSession(response)
  return response
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  persistAuthSession(response)
  return response
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('Google Sign-In no configurado')
  }

  const idToken = await requestGoogleIdToken(clientId)
  const response = await apiRequest<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
  persistAuthSession(response)
  return response
}

export async function fetchSession(): Promise<SessionResponse | null> {
  try {
    return await apiRequest<SessionResponse>('/api/auth/me')
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null
    }
    throw err
  }
}

export async function logout(): Promise<void> {
  clearAuthTokens()
}
