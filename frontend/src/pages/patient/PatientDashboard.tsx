import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, FileText, Stethoscope } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'
import type { AppointmentView } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL } from '@/lib/utils'

export function PatientDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<AppointmentView[]>([])
  const [recordCount, setRecordCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [apts, records] = await Promise.all([
          api.getAppointments({ patientId: user.id }),
          api.getRecords({ patientId: user.id }),
        ])
        if (!cancelled) {
          setAppointments(apts)
          setRecordCount(records.length)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) return <PageLoading />

  const pending = appointments.filter((a) => a.status === 'PENDING')
  const completed = appointments.filter((a) => a.status === 'COMPLETED')
  const recent = appointments.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-100/80 bg-gradient-to-r from-brand-600 via-teal-600 to-cyan-600 p-6 text-white shadow-[0_20px_40px_-24px_rgba(13,148,136,0.7)] md:p-7">
        <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="text-sm text-teal-50/90">患者工作台</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            你好，{user?.realName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50/90">
            今天也要照顾好自己。需要看病可以直接预约号源，就诊完成后可随时查看电子病历。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/patient/departments">
              <Button className="bg-white text-brand-800 hover:bg-brand-50">
                立即挂号
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/patient/records">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                我的病历
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="待就诊"
          value={pending.length}
          hint="请按时前往医院"
          icon={<CalendarDays className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="已就诊"
          value={completed.length}
          hint="历史就诊次数"
          icon={<Stethoscope className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="电子病历"
          value={recordCount}
          hint="可随时查阅"
          icon={<FileText className="h-5 w-5" />}
          tone="blue"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold tracking-tight text-slate-950">快捷操作</h3>
          <p className="mt-1 text-sm text-slate-500">常用入口，一键直达</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/patient/departments">
              <Button>按科室挂号</Button>
            </Link>
            <Link to="/patient/doctors">
              <Button variant="secondary">查找医生</Button>
            </Link>
            <Link to="/patient/appointments">
              <Button variant="secondary">我的预约</Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold tracking-tight text-slate-950">就诊提示</h3>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-slate-500">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              请提前 15 分钟到院签到
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              待就诊预约可在线取消
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              就诊完成后可在「我的病历」查看详情
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="最近预约"
          subtitle="最新 3 条记录"
          action={
            <Link to="/patient/appointments">
              <Button variant="ghost" size="sm">
                查看全部
              </Button>
            </Link>
          }
        />
        <div className="p-6 pt-4">
          {recent.length === 0 ? (
            <Empty
              title="还没有预约"
              description="去选择科室和医生，预约最近的号源吧"
              action={
                <Link to="/patient/departments">
                  <Button>去挂号</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-3.5 shadow-sm transition hover:border-brand-100 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {a.departmentName} · {a.doctorName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {a.workDate} · {TIME_SLOT_LABEL[a.timeSlot]} · {a.appointmentNo}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
