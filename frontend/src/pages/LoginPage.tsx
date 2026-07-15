import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Lock,
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
    account: 'patient',
    desc: '预约挂号 · 查看病历',
    icon: UserRound,
    tone: 'from-emerald-400 to-teal-500',
    soft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  {
    username: 'doctor',
    role: '医生',
    account: 'doctor',
    desc: '接诊开单 · 书写病历',
    icon: Stethoscope,
    tone: 'from-sky-400 to-cyan-500',
    soft: 'bg-sky-50 text-sky-700 ring-sky-100',
  },
  {
    username: 'admin',
    role: '管理员',
    account: 'admin',
    desc: '科室排班 · 运营看板',
    icon: Users,
    tone: 'from-violet-400 to-indigo-500',
    soft: 'bg-violet-50 text-violet-700 ring-violet-100',
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
    <div className="min-h-full lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-teal-800 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
        </div>

        <div className="relative z-10 px-12 pt-12">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">慧医通</div>
              <div className="text-xs text-teal-100/80">Hospital Care OS</div>
            </div>
          </div>

          <h1 className="mt-14 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            安心就医
            <br />
            从一次登录开始
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-teal-50/85">
            为患者、医生与管理者提供统一入口。预约、接诊、病历一气呵成，界面干净，流程清晰。
          </p>

          <div className="mt-10 grid max-w-md gap-3">
            {[
              { icon: CalendarDays, t: '3 分钟完成预约' },
              { icon: HeartPulse, t: '病历清晰可追溯' },
              { icon: Lock, t: '角色权限严格隔离' },
            ].map((item) => (
              <div
                key={item.t}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/95 backdrop-blur"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.t}
              </div>
            ))}
          </div>
        </div>

        {/* Floating product cards */}
        <div className="relative z-10 px-12 pb-12">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -right-2 -top-8 w-56 rotate-3 rounded-3xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">今日预约</div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  进行中
                </span>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">16</div>
              <div className="mt-1 text-xs text-slate-500">待就诊 · 内科 / 皮肤科</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-teal-400" />
              </div>
            </div>

            <div className="w-64 -rotate-2 rounded-3xl border border-white/20 bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">李华 主任医师</div>
                  <div className="text-xs text-slate-500">内科 · 上午有号</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                剩余号源 7 / 10
              </div>
              <div className="mt-3 rounded-2xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
                一键预约，到院即取号
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(204,251,241,0.45),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(224,242,254,0.5),transparent_40%)] lg:hidden" />

        <div className="relative w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-950">慧医通</div>
              <div className="text-xs text-slate-500">医院预约挂号与电子病历</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">登录</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              选择身份并登录，即可进入对应工作台
            </p>
          </div>

          {/* Role picker */}
          <div className="mb-6 grid grid-cols-3 gap-2.5">
            {demos.map((d) => {
              const Icon = d.icon
              const active = activeRole === d.username
              return (
                <button
                  key={d.username}
                  type="button"
                  onClick={() => pickDemo(d.username)}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition-all duration-200',
                    active
                      ? 'border-brand-200 bg-white shadow-[0_12px_30px_-16px_rgba(13,148,136,0.45)] ring-2 ring-brand-100'
                      : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white',
                  )}
                >
                  <span
                    className={cn(
                      'mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                      d.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="text-sm font-semibold text-slate-900">{d.role}</div>
                  <div className="mt-0.5 text-[11px] leading-4 text-slate-500">{d.desc}</div>
                </button>
              )
            })}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:p-7">
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
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm leading-6 text-rose-600">
                  {error}
                </div>
              ) : (
                <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-3.5 py-2.5 text-xs leading-5 text-brand-800">
                  演示密码统一为 <span className="font-semibold">123456</span>
                  ，点上方身份卡片可自动填入账号
                </div>
              )}

              <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
                {loading ? '正在进入…' : '进入系统'}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <div>
              还没有账号？
              <Link to="/register" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
                注册患者账号
              </Link>
            </div>
            <Link to="/" className="font-medium text-slate-600 hover:text-slate-900">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
