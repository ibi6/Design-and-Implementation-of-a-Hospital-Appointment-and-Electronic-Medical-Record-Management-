import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserPublic } from '@/types'
import * as api from '@/services/api'
import { AuthContext } from './auth-context-value'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const u = await api.getMe()
      if (!u || u.status !== 'ACTIVE') {
        setUser(null)
      } else {
        setUser(u)
      }
    } catch {
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
      setUser(u)
      return u
    },
    [],
  )

  const logout = useCallback(async () => {
    await api.logoutClient()
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
    }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
