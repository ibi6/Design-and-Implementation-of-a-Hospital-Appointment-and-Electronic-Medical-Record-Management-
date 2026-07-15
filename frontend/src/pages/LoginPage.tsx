import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, homePathFor } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const demos = [
  { username: 'patient', label: '患者' },
  { username: 'doctor', label: '医生' },
  { username: 'admin', label: '管理员' },
]

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : '登录失败'
  if (/failed to fetch|networkerror|load failed|fetch/i.test(msg)) {
    return '无法连接服务器，请先启动后端（8080）'
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
  const [active, setActive] = useState('patient')

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
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#f4f7f8] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f766e] text-white shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">登录慧医通</h1>
          <p className="mt-2 text-sm text-slate-500">医院预约挂号与电子病历系统</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            {demos.map((d) => (
              <button
                key={d.username}
                type="button"
                onClick={() => {
                  setActive(d.username)
                  setUsername(d.username)
                  setPassword('123456')
                  setError('')
                }}
                className={cn(
                  'rounded-xl px-2 py-2 text-sm font-medium transition',
                  active === d.username
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                {d.label}
              </button>
            ))}
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
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
            ) : (
              <p className="text-xs text-slate-400">演示密码：123456（点上方身份可自动填入）</p>
            )}

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <Link to="/register" className="hover:text-slate-800">
            注册患者账号
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/" className="hover:text-slate-800">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
