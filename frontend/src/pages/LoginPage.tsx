import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/useAuth'
import { homePathFor, safeRedirectFor } from '@/context/auth-routing'

const demos = [
  { username: 'patient', label: '患者 patient' },
  { username: 'doctor', label: '医生 doctor' },
  { username: 'admin', label: '管理员 admin' },
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
      navigate(safeRedirectFor(u.role, params.get('redirect')), { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登录失败'
      setError(
        /failed to fetch|networkerror|load failed|fetch/i.test(msg)
          ? '无法连接服务器，请先启动后端（8080）'
          : msg || '登录失败',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-md">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">登录慧医通</h1>
          <p className="mt-1 text-sm text-slate-500">医院预约挂号与电子病历管理系统</p>
        </div>

        <Card className="p-6">
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
              <div role="alert" className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-5">
            <div className="mb-2 text-xs font-medium text-slate-400">一键填入演示账号</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {demos.map((d) => (
                <button
                  key={d.username}
                  type="button"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  onClick={() => {
                    setUsername(d.username)
                    setPassword('123456')
                    setError('')
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <p className="mt-5 text-center text-sm text-slate-500">
          还没有账号？
          <Link to="/register" className="ml-1 font-medium text-brand-700 hover:text-brand-800">
            注册患者账号
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link to="/" className="font-medium text-slate-600 hover:text-slate-800">
            返回首页
          </Link>
        </p>
      </div>
    </div>
  )
}
