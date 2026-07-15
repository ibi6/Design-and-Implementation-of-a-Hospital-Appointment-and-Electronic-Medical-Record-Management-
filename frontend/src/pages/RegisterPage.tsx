import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">患者注册</h1>
          <p className="mt-1 text-sm text-slate-500">注册后可预约挂号并查看电子病历</p>
        </div>
        <Card className="p-6">
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
              <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '提交中...' : '注册并登录'}
            </Button>
          </form>
        </Card>
        <p className="mt-5 text-center text-sm text-slate-500">
          已有账号？
          <Link to="/login" className="ml-1 font-medium text-brand-700">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
