import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth, homePathFor } from '@/context/AuthContext'

const demos = [
  { username: 'patient', label: '患者 patient', desc: '预约挂号' },
  { username: 'doctor', label: '医生 doctor', desc: '接诊写病历' },
  { username: 'admin', label: '管理员 admin', desc: '运营管理' },
]

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('patient')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(username, password)
      const redirect = params.get('redirect')
      navigate(redirect || homePathFor(u.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-40" />
      <div className="pointer-events-none absolute -left-10 top-16 h-64 w-64 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            安全登录 · 角色隔离
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            欢迎回到
            <span className="bg-gradient-to-r from-brand-700 to-teal-600 bg-clip-text text-transparent">
              {' '}
              慧医通
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            统一入口进入患者、医生与管理员工作台。演示环境已预置账号，可一键填入快速体验完整业务闭环。
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'JWT 鉴权与角色权限控制',
              '预约号源实时扣减与释放',
              '电子病历与就诊状态联动',
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="mb-6 text-center lg:text-left">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-teal-500 to-cyan-600 text-white shadow-[0_12px_24px_-12px_rgba(13,148,136,0.8)] lg:mx-0">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">登录慧医通</h2>
            <p className="mt-1 text-sm text-slate-500">医院预约挂号与电子病历管理系统</p>
          </div>

          <Card className="p-6 md:p-7">
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
              />
              <Input
                label="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
              {error ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录系统'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                一键填入演示账号
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {demos.map((d) => (
                  <button
                    key={d.username}
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left transition hover:border-brand-200 hover:bg-brand-50/70 hover:shadow-sm"
                    onClick={() => {
                      setUsername(d.username)
                      setPassword('123456')
                      setError('')
                    }}
                  >
                    <div className="text-xs font-semibold text-slate-800">{d.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <p className="mt-5 text-center text-sm text-slate-500">
            还没有账号？
            <Link to="/register" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
              注册患者账号
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link to="/" className="font-medium text-slate-600 hover:text-slate-800">
              返回首页
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
