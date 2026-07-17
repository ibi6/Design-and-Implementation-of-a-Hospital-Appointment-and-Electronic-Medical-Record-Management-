import type { UserRole } from '@/types'

/** Returns the landing route for an authenticated role. */
export function homePathFor(role: UserRole) {
  if (role === 'DOCTOR') return '/doctor'
  if (role === 'ADMIN') return '/admin'
  return '/patient'
}

/** Returns a same-role SPA redirect or the role's safe landing page. */
export function safeRedirectFor(role: UserRole, redirect: string | null) {
  const home = homePathFor(role)
  if (!redirect || !/^\/(?!\/)[^\r\n\\]*$/.test(redirect)) return home

  const pathname = new URL(redirect, 'http://hospital.local').pathname
  if (pathname === home || pathname.startsWith(`${home}/`)) return redirect
  return home
}
