import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, homePathFor } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const demos = [
  {
    username: 'patient',
    role: '患者',
    tip: '预约挂号',
    icon: UserRound,
  },
  {
    username: 'doctor',
    role: '医生',
    tip: '接诊病历',
    icon: Stethoscope,
  },
  {
    username: 'admin',
    role: '管理',
    tip: '运营看板',
    icon: Users,
  },
]

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : '登录失败'
  if (/failed to fetch|networkerror|load failed|fetch/i.test(msg)) {
    return '无法连接服务器，请确认后端已启动（默认 8080 端口）'
  }
  if (/401|用户名或密码/.test(msg)) return '用户名或密码错误'
  return msg || '登录失败，请稍后重试'
}

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('patient')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeRole, setActiveRole] = useState('patient')

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  const pickDemo = (name: string) => {
    setActiveRole(name)
    setUsername(name)
    setPassword('123456')
    setError('')
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
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-stage relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Cinematic medical atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#0f766e_0%,transparent_45%),radial-gradient(ellipse_at_80%_10%,#0891b2_0%,transparent_40%),radial-gradient(ellipse_at_70%_85%,#134e4a_0%,transparent_45%),linear-gradient(145deg,#042f2e_0%,#0b3b3a_38%,#0c4a6e_100%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
        <div className="auth-orb auth-orb-c" />

        {/* Soft abstract medical shapes */}
        <svg
          className="absolute left-[8%] top-[18%] h-40 w-40 opacity-20"
          viewBox="0 0 160 160"
          fill="none"
        >
          <circle cx="80" cy="80" r="70" stroke="white" strokeWidth="1.2" />
          <path d="M40 80h80M80 40v80" stroke="white" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <svg
          className="absolute bottom-[14%] right-[10%] h-48 w-48 opacity-15"
          viewBox="0 0 200 120"
          fill="none"
        >
          <path
            d="M0 70 H40 L55 30 L75 100 L95 55 L115 70 H200"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Floating trust chips */}
      <div className="auth-float pointer-events-none absolute left-[7%] top-[22%] hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-2xl backdrop-blur-md lg:block">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-200" />
          医疗数据安全隔离
        </div>
      </div>
      <div className="auth-float-delay pointer-events-none absolute bottom-[20%] left-[10%] hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-2xl backdrop-blur-md lg:block">
        <div className="flex items-center gap-2 text-sm font-medium">
          <HeartPulse className="h-4 w-4 text-cyan-200" />
          预约 · 接诊 · 病历闭环
        </div>
      </div>
      <div className="auth-float pointer-events-none absolute right-[8%] top-[28%] hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white shadow-2xl backdrop-blur-md xl:block">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-teal-100" />
          三分钟完成演示
        </div>
      </div>

      {/* Center glass card */}
      <div className="auth-card-in relative z-10 w-full max-w-[440px]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/15 text-white shadow-[0_12px_40px_-12px_rgba(45,212,191,0.7)] ring-1 ring-white/30 backdrop-blur">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">慧医通</h1>
          <p className="mt-2 text-sm text-teal-50/85">安心就医，从一次登录开始</p>
        </div>

        <div className="rounded-[1.85rem] border border-white/35 bg-white/85 p-6 shadow-[0_30px_80px_-28px_rgba(2,20,30,0.65)] backdrop-blur-2xl md:p-8">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">登录账户</h2>
            <p className="mt-1 text-sm text-slate-500">选择身份，一键体验完整流程</p>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {demos.map((d) => {
              const Icon = d.icon
              const active = activeRole === d.username
              return (
                <button
                  key={d.username}
                  type="button"
                  onClick={() => {
                    pickDemo(d.username)
                  }}
                  className={cn(
                    'group rounded-2xl border px-2.5 py-3 text-center transition-all duration-300',
                    active
                      ? 'border-brand-300 bg-gradient-to-b from-brand-50 to-white shadow-[0_10px_24px_-14px_rgba(13,148,136,0.65)] ring-2 ring-brand-100 scale-[1.02]'
                      : 'border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:-translate-y-0.5',
                  )}
                >
                  <span
                    className={cn(
                      'mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl transition',
                      active
                        ? 'bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-md'
                        : 'bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-brand-700',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-sm font-semibold text-slate-900">{d.role}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{d.tip}</div>
                </button>
              )
            })}
          </div>

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
              <div className="auth-shake rounded-2xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm leading-6 text-rose-600">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/80 px-3.5 py-2.5 text-xs leading-5 text-brand-800">
                演示密码：<span className="font-semibold">123456</span>
                ，点击上方身份会自动填入账号
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full text-base shadow-[0_14px_30px_-14px_rgba(13,148,136,0.9)] transition hover:translate-y-[-1px]"
              disabled={loading}
            >
              {loading ? '正在进入…' : '进入系统'}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
            <div>
              没有账号？
              <Link to="/register" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
                注册患者
              </Link>
            </div>
            <Link to="/" className="font-medium text-slate-600 hover:text-slate-900">
              返回首页
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-teal-50/70">
          慧医通 · 医院预约挂号与电子病历管理系统
        </p>
      </div>
    </div>
  )
}
