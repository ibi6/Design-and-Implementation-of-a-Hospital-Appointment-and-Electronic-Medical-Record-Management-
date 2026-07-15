import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, CalendarCheck2, FileHeart, ShieldCheck, UserPlus } from 'lucide-react'
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
    <div className="min-h-full lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-cyan-800 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl" />
        </div>

        <div className="relative z-10 px-12 pt-12">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">慧医通</div>
              <div className="text-xs text-teal-100/80">创建你的就诊账户</div>
            </div>
          </div>

          <h1 className="mt-14 max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            注册患者账号
            <br />
            开启便捷就医
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-teal-50/85">
            注册后即可在线预约医生、查看就诊进度与电子病历，流程简单，信息安全。
          </p>

          <div className="mt-10 space-y-3">
            {[
              { icon: CalendarCheck2, t: '随时预约心仪医生' },
              { icon: FileHeart, t: '就诊后自动生成病历' },
              { icon: ShieldCheck, t: '个人信息严格权限保护' },
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

        <div className="relative z-10 px-12 pb-12">
          <div className="max-w-sm rounded-3xl border border-white/15 bg-white/10 p-5 text-sm leading-6 text-teal-50/90 backdrop-blur">
            已有账号？可直接登录患者端，演示环境也支持使用预置账号快速体验。
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(204,251,241,0.4),transparent_45%)] lg:hidden" />

        <div className="relative w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-lg">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-950">患者注册</div>
              <div className="text-xs text-slate-500">创建就诊账户</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">创建账户</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">填写基本信息，约 30 秒完成注册</p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:p-7">
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
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm leading-6 text-rose-600">
                  {error}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs leading-5 text-slate-500">
                  注册后将自动登录并进入患者工作台
                </div>
              )}

              <Button type="submit" className="h-12 w-full text-base" disabled={loading}>
                {loading ? '创建中…' : '注册并进入'}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            已有账号？
            <Link to="/login" className="ml-1 font-semibold text-brand-700 hover:text-brand-800">
              去登录
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
