import { useContext } from 'react'
import { AuthContext } from './auth-context-value'

/** Returns the active authentication state and actions. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
