import { createContext } from 'react'
import type { UserPublic } from '@/types'

export interface AuthContextValue {
  user: UserPublic | null
  loading: boolean
  login: (username: string, password: string) => Promise<UserPublic>
  register: (payload: {
    username: string
    password: string
    realName: string
    phone: string
  }) => Promise<UserPublic>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
