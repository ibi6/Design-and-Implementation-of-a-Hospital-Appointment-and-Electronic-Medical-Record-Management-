import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserPublic, UserRole } from '@/types'
import * as api from '@/services/api'
import { setToken } from '@/services/http'

const AUTH_KEY = 'hospital_mvp_auth_user_id'

interface AuthContextValue {
  user: UserPublic | null
  loading: boolean
  login: (username: string, password: string) => Promise<UserPublic>
  register: (payload: {
    username: string
    password: string
    realName: string
    phone: string
  }) => Promise<UserPublic>
  logout: () => void
  refresh: () => Promise<void>
  homePathFor: (role: UserRole) => string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function homePathFor(role: UserRole) {
  if (role === 'DOCTOR') return '/doctor'
  if (role === 'ADMIN') return '/admin'
  return '/patient'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('hospital_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const u = await api.getMe()
      if (!u || u.status !== 'ACTIVE') {
        setToken(null)
        localStorage.removeItem(AUTH_KEY)
        setUser(null)
      } else {
        localStorage.setItem(AUTH_KEY, u.id)
        setUser(u)
      }
    } catch {
      setToken(null)
      localStorage.removeItem(AUTH_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (username: string, password: string) => {
    const u = await api.login(username, password)
    localStorage.setItem(AUTH_KEY, u.id)
    setUser(u)
    return u
  }, [])

  const register = useCallback(
    async (payload: {
      username: string
      password: string
      realName: string
      phone: string
    }) => {
      const u = await api.register(payload)
      localStorage.setItem(AUTH_KEY, u.id)
      setUser(u)
      return u
    },
    [],
  )

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      homePathFor,
    }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
