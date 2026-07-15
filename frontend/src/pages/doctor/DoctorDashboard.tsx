import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck2, ClipboardList, FileHeart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'
import type { AppointmentView, DoctorView } from '@/types'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, todayStr } from '@/lib/utils'

export function DoctorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState<DoctorView | null>(null)
  const [appointments, setAppointments] = useState<AppointmentView[]>([])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const doc = await api.getDoctorByUserId(user.id)
        if (!doc) {
          if (!cancelled) setDoctor(null)
          return
        }
        const apts = await api.getAppointments({ doctorId: doc.id })
        if (!cancelled) {
          setDoctor(doc)
          setAppointments(apts)
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
  if (!doctor) return <Empty title="未绑定医生档案" description="请联系管理员完善医生信息" />

  const today = todayStr()
  const todayList = appointments.filter((a) => a.workDate === today)
  const pending = appointments.filter((a) => a.status === 'PENDING')
  const completed = appointments.filter((a) => a.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {doctor.realName} 医生，欢迎回来
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {doctor.departmentName} · {doctor.title}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="今日预约"
          value={todayList.length}
          icon={<CalendarCheck2 className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="待接诊"
          value={pending.length}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="已完成病历"
          value={completed.length}
          icon={<FileHeart className="h-5 w-5" />}
          tone="brand"
        />
      </div>

      <Card>
        <CardHeader
          title="待接诊患者"
          subtitle="优先处理待就诊预约"
          action={
            <Link to="/doctor/appointments">
              <Button variant="ghost" size="sm">
                全部接诊
              </Button>
            </Link>
          }
        />
        <div className="space-y-3 p-6 pt-2">
          {pending.slice(0, 5).length === 0 ? (
            <Empty title="暂无待接诊" description="当前没有待就诊患者" />
          ) : (
            pending.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-slate-900">{a.patientName}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {a.workDate} · {TIME_SLOT_LABEL[a.timeSlot]} · {a.symptomNote || '无备注'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  <Link to={`/doctor/appointments/${a.id}/record`}>
                    <Button size="sm">写病历</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
