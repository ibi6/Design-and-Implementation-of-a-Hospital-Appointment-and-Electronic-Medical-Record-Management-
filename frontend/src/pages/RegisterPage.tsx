import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

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
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-40" />
      <div className="pointer-events-none absolute -left-10 top-20 h-64 w-64 rounded-full bg-brand-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-8 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-teal-500 to-cyan-600 text-white shadow-[0_12px_24px_-12px_rgba(13,148,136,0.8)]">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">患者注册</h1>
          <p className="mt-1 text-sm text-slate-500">注册后可预约挂号并查看电子病历</p>
        </div>
        <Card className="p-6 md:p-7">
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
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '提交中...' : '注册并登录'}
            </Button>
          </form>
        </Card>
        <p className="mt-5 text-center text-sm text-slate-500">
          已有账号？
          <Link to="/login" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
