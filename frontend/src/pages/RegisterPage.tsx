import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'

function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : '注册失败'
  if (/failed to fetch|networkerror|load failed|fetch/i.test(msg)) {
    return '无法连接服务器，请先启动后端（8080）'
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
    <div className="flex min-h-full items-center justify-center bg-[#f4f7f8] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f766e] text-white shadow-sm">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">患者注册</h1>
          <p className="mt-2 text-sm text-slate-500">注册后可预约挂号并查看电子病历</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="用户名"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="用于登录"
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
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
            ) : null}

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? '提交中...' : '注册并登录'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          已有账号？
          <Link to="/login" className="ml-1 font-medium text-[#0f766e] hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
