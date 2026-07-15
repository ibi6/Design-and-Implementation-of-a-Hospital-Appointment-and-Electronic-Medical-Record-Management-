import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/services/api'
import type { AppointmentStatus, AppointmentView, DoctorView } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, cn } from '@/lib/utils'

const tabs: { key: AppointmentStatus | 'ALL'; label: string }[] = [
  { key: 'PENDING', label: '待接诊' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'ALL', label: '全部' },
]

export function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState<DoctorView | null>(null)
  const [status, setStatus] = useState<AppointmentStatus | 'ALL'>('PENDING')
  const [list, setList] = useState<AppointmentView[]>([])

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
        const apts = await api.getAppointments({ doctorId: doc.id, status })
        if (!cancelled) {
          setDoctor(doc)
          setList(apts)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, status])

  if (loading) return <PageLoading />
  if (!doctor) return <Empty title="未绑定医生档案" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">接诊列表</h2>
        <p className="mt-1 text-sm text-slate-500">查看预约患者并书写电子病历</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStatus(t.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              status === t.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty title="暂无预约" description="当前筛选下没有患者预约" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{a.patientName}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {a.workDate} · {TIME_SLOT_LABEL[a.timeSlot]} · {a.appointmentNo}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">主诉备注：{a.symptomNote || '无'}</p>
                </div>
                {a.status === 'PENDING' ? (
                  <Link to={`/doctor/appointments/${a.id}/record`}>
                    <Button size="sm">接诊写病历</Button>
                  </Link>
                ) : a.status === 'COMPLETED' ? (
                  <Link to={`/doctor/appointments/${a.id}/record`}>
                    <Button size="sm" variant="secondary">
                      查看病历
                    </Button>
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
