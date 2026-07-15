import { Link } from 'react-router-dom'
import { Activity, CalendarCheck2, FileHeart, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth, homePathFor } from '@/context/AuthContext'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">慧医通</div>
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

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
            毕业设计演示系统 · 前端展示版
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            让挂号更简单
            <br />
            <span className="bg-gradient-to-r from-brand-700 to-teal-600 bg-clip-text text-transparent">
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
          <p className="mt-4 text-sm text-slate-500">
            演示账号：patient / doctor / admin，密码均为 123456
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-200/40 to-sky-200/30 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: '今日可约号源', value: '128', tone: 'text-brand-700' },
                { label: '待就诊预约', value: '16', tone: 'text-amber-600' },
                { label: '电子病历', value: '942', tone: 'text-sky-700' },
                { label: '入驻医生', value: '36', tone: 'text-violet-700' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5"
                >
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className={`mt-2 text-3xl font-semibold ${item.tone}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl bg-slate-900 px-5 py-4 text-sm text-slate-200">
              支持患者自助预约、医生接诊写病历、管理员维护科室排班的完整闭环。
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3">
          {[
            {
              icon: CalendarCheck2,
              title: '在线预约挂号',
              desc: '按科室、医生、时段选择号源，实时查看剩余名额并一键预约。',
            },
            {
              icon: FileHeart,
              title: '电子病历闭环',
              desc: '医生接诊后结构化书写病历，患者可随时查阅本人就诊记录。',
            },
            {
              icon: ShieldCheck,
              title: '三角色协同',
              desc: '患者、医生、管理员权限分离，流程清晰，便于毕业设计答辩演示。',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
