import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, LogOut, Menu, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROLE_LABEL, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function AppShell({
  nav,
  title,
  subtitle,
  children,
}: {
  nav: NavItem[]
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const NavContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-md">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">慧医通</div>
          <div className="text-xs text-slate-500">预约 · 病历 · 管理</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="text-sm font-medium text-slate-900">{user?.realName}</div>
        <div className="mt-0.5 text-xs text-slate-500">
          {user ? ROLE_LABEL[user.role] : ''} · {user?.username}
        </div>
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
      <div className="mx-auto flex min-h-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/80 backdrop-blur lg:flex">
          {NavContent}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="关闭菜单"
              onClick={() => setOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-72 flex-col bg-white shadow-xl">
              <div className="flex justify-end p-3">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="关闭">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {NavContent}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setOpen(true)}
                  aria-label="打开菜单"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
                  {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                  {user ? ROLE_LABEL[user.role] : ''}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
