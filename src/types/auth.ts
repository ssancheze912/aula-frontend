export interface AuthUser {
  uid: string
  email: string
  displayName: string | null
  photoUrl: string | null
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export interface SessionResponse {
  uid: string
  email: string | null
  displayName: string | null
  photoUrl: string | null
  profile: UserProfile | null
}

export interface UserProfile {
  uid: string
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl: string
  provider: 'email' | 'google'
}

export interface CreateUserProfileInput {
  firstName: string
  lastName: string
  username: string
  email: string
  avatarUrl?: string
  provider: 'email' | 'google'
}
