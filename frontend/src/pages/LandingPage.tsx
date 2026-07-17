import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  FileHeart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { homePathFor } from '@/context/auth-routing'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-50" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-teal-500 to-cyan-600 text-white shadow-[0_12px_24px_-12px_rgba(13,148,136,0.8)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-slate-950">慧医通</div>
            <div className="text-xs text-slate-500">医院预约挂号与电子病历</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to={homePathFor(user.role)}>
              <Button>进入工作台</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">登录</Button>
              </Link>
              <Link to="/register">
                <Button>注册就诊</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            智慧医疗 · 可演示完整闭环
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl md:leading-[1.15]">
            让挂号更简单
            <br />
            <span className="bg-gradient-to-r from-brand-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              让病历更清晰
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            面向患者、医生与医院管理员的一体化平台。在线预约号源、医生接诊书写电子病历、后台统一维护科室与排班，流程完整可演示。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={user ? homePathFor(user.role) : '/login'}>
              <Button size="lg">
                立即体验
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                患者注册
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-white/80 px-3 py-1 ring-1 ring-slate-200">
              patient / doctor / admin
            </span>
            <span>密码均为 123456</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.2rem] bg-gradient-to-br from-brand-200/50 via-cyan-100/40 to-sky-200/30 blur-2xl" />
          <div className="relative float-soft rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">演示场景概览</div>
                <div className="mt-0.5 text-xs text-slate-500">示意指标 · 登录后查看真实数据</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                系统正常
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: '今日可约号源', value: '128', tone: 'text-brand-700', bg: 'from-brand-50 to-white' },
                { label: '待就诊预约', value: '16', tone: 'text-amber-600', bg: 'from-amber-50 to-white' },
                { label: '电子病历', value: '942', tone: 'text-sky-700', bg: 'from-sky-50 to-white' },
                { label: '入驻医生', value: '36', tone: 'text-violet-700', bg: 'from-violet-50 to-white' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-3xl border border-slate-100 bg-gradient-to-br ${item.bg} p-5 shadow-sm`}
                >
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className={`mt-2 text-3xl font-semibold tracking-tight ${item.tone}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl bg-slate-950 px-5 py-4 text-sm leading-6 text-slate-200">
              支持患者自助预约、医生接诊写病历、管理员维护科室排班的完整闭环。
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/70 bg-white/50 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3">
          {[
            {
              icon: CalendarCheck2,
              title: '在线预约挂号',
              desc: '按科室、医生、时段选择号源，实时查看剩余名额并一键预约。',
              tone: 'from-brand-500 to-teal-500',
            },
            {
              icon: FileHeart,
              title: '电子病历闭环',
              desc: '医生接诊后结构化书写病历，患者可随时查阅本人就诊记录。',
              tone: 'from-sky-500 to-cyan-500',
            },
            {
              icon: ShieldCheck,
              title: '三角色协同',
              desc: '患者、医生、管理员权限分离，流程清晰，便于演示与答辩。',
              tone: 'from-violet-500 to-indigo-500',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(13,148,136,0.3)]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.tone} text-white shadow-md`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{f.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">
                查看演示流程
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[2rem] border border-brand-100/80 bg-gradient-to-r from-brand-600 via-teal-600 to-cyan-600 p-8 text-white shadow-[0_24px_50px_-24px_rgba(13,148,136,0.7)] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-brand-50">
                <Stethoscope className="h-4 w-4" />
                开箱即用 · 演示账号已就绪
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">三分钟走完预约到病历全流程</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/90">
                从患者挂号、医生接诊到管理员看板，一站式体验医院数字化就诊闭环。
              </p>
            </div>
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-brand-800 shadow-lg hover:bg-brand-50 hover:text-brand-900"
              >
                开始演示
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
