import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Bell, LogOut, Menu, Sparkles, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
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
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const menuButton = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerCloseRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      menuButton?.focus()
    }
  }, [open])

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const NavContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-teal-500 to-cyan-600 text-white shadow-[0_12px_24px_-12px_rgba(13,148,136,0.8)]">
          <Activity className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 ring-2 ring-white" />
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight text-slate-950">慧医通</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-brand-500" />
            预约 · 病历 · 管理
          </div>
        </div>
      </div>

      <div className="mx-3 mb-3 rounded-2xl border border-brand-100/80 bg-gradient-to-r from-brand-50/90 to-cyan-50/60 px-3 py-2.5 text-xs text-brand-800">
        医疗级工作台 · 安全就诊闭环
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
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
                  'group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-brand-50 to-white text-brand-800 shadow-sm ring-1 ring-brand-100'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-950 hover:shadow-sm',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition',
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-700',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-sm font-semibold text-white">
            {(user?.realName || '用').slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{user?.realName}</div>
            <div className="truncate text-xs text-slate-500">
              {user ? ROLE_LABEL[user.role] : ''} · {user?.username}
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => void onLogout()}>
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </>
  )

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-60" />
      <div className="relative mx-auto flex min-h-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-white/60 bg-white/70 shadow-[8px_0_30px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:flex">
          {NavContent}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
              aria-label="关闭菜单"
              onClick={() => setOpen(false)}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="主导航"
              className="relative z-10 flex h-full w-80 max-w-[88vw] flex-col bg-white/95 shadow-2xl backdrop-blur"
            >
              <div className="flex justify-end p-3">
                <Button ref={drawerCloseRef} variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="关闭">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {NavContent}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  ref={menuButtonRef}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setOpen(true)}
                  aria-label="打开菜单"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-brand-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    智慧医疗工作台
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                    {title}
                  </h1>
                  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition hover:text-brand-700 sm:inline-flex"
                  aria-label="通知"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <span className="rounded-full bg-gradient-to-r from-brand-50 to-cyan-50 px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-100">
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
