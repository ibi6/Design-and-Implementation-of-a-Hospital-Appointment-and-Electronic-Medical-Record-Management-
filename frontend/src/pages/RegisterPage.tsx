import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : '注册失败'
  if (/failed to fetch|networkerror|load failed|fetch/i.test(msg)) {
    return '无法连接服务器，请确认后端已启动（默认 8080 端口）'
  }
  return msg || '注册失败，请稍后重试'
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    realName: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/patient', { replace: true })
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-stage relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,#0f766e_0%,transparent_42%),radial-gradient(ellipse_at_85%_20%,#0369a1_0%,transparent_40%),linear-gradient(150deg,#042f2e_0%,#0c4a6e_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
      </div>

      <div className="auth-card-in relative z-10 w-full max-w-[440px]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white/15 text-white shadow-[0_12px_40px_-12px_rgba(45,212,191,0.7)] ring-1 ring-white/30 backdrop-blur">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">创建就诊账户</h1>
          <p className="mt-2 text-sm text-teal-50/85">约 30 秒完成注册，立即预约医生</p>
        </div>

        <div className="rounded-[1.85rem] border border-white/35 bg-white/85 p-6 shadow-[0_30px_80px_-28px_rgba(2,20,30,0.65)] backdrop-blur-2xl md:p-8">
          <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            患者专属通道
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="用于登录，建议英文/数字"
              required
            />
            <Input
              label="真实姓名"
              value={form.realName}
              onChange={(e) => setForm({ ...form, realName: e.target.value })}
              placeholder="就诊人姓名"
              required
            />
            <Input
              label="手机号"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="11 位手机号"
              required
            />
            <Input
              label="密码"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="至少 6 位"
              required
            />

            {error ? (
              <div className="auth-shake rounded-2xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm leading-6 text-rose-600">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs leading-5 text-slate-500">
                注册成功后将自动进入患者工作台
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full text-base shadow-[0_14px_30px_-14px_rgba(13,148,136,0.9)] transition hover:translate-y-[-1px]"
              disabled={loading}
            >
              {loading ? '创建中…' : '注册并进入'}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            已有账号？
            <Link to="/login" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
              去登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
