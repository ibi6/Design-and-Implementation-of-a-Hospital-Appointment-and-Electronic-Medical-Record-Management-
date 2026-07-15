import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/services/api'
import type { AppointmentStatus, AppointmentView } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, cn } from '@/lib/utils'

const tabs: { key: AppointmentStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待就诊' },
  { key: 'COMPLETED', label: '已就诊' },
  { key: 'CANCELLED', label: '已取消' },
]

export function AppointmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [list, setList] = useState<AppointmentView[]>([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await api.getAppointments({ patientId: user.id, status })
      setList(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, status])

  const onCancel = async (id: string) => {
    if (!user) return
    if (!confirm('确认取消该预约？取消后号源将释放。')) return
    setBusyId(id)
    setError('')
    try {
      await api.cancelAppointment(id, user.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消失败')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">我的预约</h2>
          <p className="mt-1 text-sm text-slate-500">管理待就诊与历史预约记录</p>
        </div>
        <Link to="/patient/departments">
          <Button>新建预约</Button>
        </Link>
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

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      ) : null}

      {loading ? (
        <PageLoading />
      ) : list.length === 0 ? (
        <Empty
          title="暂无预约"
          description="当前筛选条件下没有预约记录"
          action={
            <Link to="/patient/doctors">
              <Button>去找医生</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {a.departmentName} · {a.doctorName}
                      {a.doctorTitle ? `（${a.doctorTitle}）` : ''}
                    </h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {a.workDate} · {TIME_SLOT_LABEL[a.timeSlot]}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">单号 {a.appointmentNo}</p>
                  {a.symptomNote ? (
                    <p className="mt-2 text-sm text-slate-600">症状：{a.symptomNote}</p>
                  ) : null}
                </div>
                {a.status === 'PENDING' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={busyId === a.id}
                    onClick={() => void onCancel(a.id)}
                  >
                    {busyId === a.id ? '取消中...' : '取消预约'}
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
