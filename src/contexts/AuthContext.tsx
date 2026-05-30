import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { clearAuthTokens, getAuthToken } from '../api/client'
import { fetchSession } from '../services/authService'
import type { AuthResponse, AuthUser, UserProfile } from '../types/auth'

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  establishSession: (response: AuthResponse, profile?: UserProfile | null) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  establishSession: () => {},
  clearSession: () => {},
})

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    clearAuthTokens()
    setUser(null)
    setProfile(null)
  }, [])

  const establishSession = useCallback((response: AuthResponse, nextProfile?: UserProfile | null) => {
    setUser(response.user)
    if (nextProfile !== undefined) {
      setProfile(nextProfile)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setProfile(null)
      return
    }

    try {
      const session = await fetchSession()
      if (!session) {
        clearSession()
        return
      }

      setUser({
        uid: session.uid,
        email: session.email ?? '',
        displayName: session.displayName,
        photoUrl: session.photoUrl,
      })
      setProfile(session.profile)
    } catch {
      // Mantener sesión local si /me falla por Firestore u otro error transitorio
    }
  }, [clearSession])

  useEffect(() => {
    const loadSession = async () => {
      try {
        await refreshProfile()
      } finally {
        setLoading(false)
      }
    }

    void loadSession()
  }, [refreshProfile])

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, refreshProfile, establishSession, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}
