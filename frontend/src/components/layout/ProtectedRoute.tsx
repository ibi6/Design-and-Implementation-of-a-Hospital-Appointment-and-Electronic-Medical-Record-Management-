import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '@/types'
import { useAuth } from '@/context/useAuth'
import { homePathFor } from '@/context/auth-routing'
import { PageLoading } from '@/components/ui/Spinner'

export function ProtectedRoute({
  roles,
  children,
}: {
  roles?: UserRole[]
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoading label="正在验证登录状态..." />

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  return <>{children}</>
}
