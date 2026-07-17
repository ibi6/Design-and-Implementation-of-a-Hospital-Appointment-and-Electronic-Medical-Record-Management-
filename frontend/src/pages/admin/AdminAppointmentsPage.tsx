import { useCallback, useEffect, useState } from 'react'
import * as api from '@/services/api'
import type { AppointmentStatus, AppointmentView } from '@/types'
import { useAuth } from '@/context/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL } from '@/lib/utils'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'

export function AdminAppointmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<AppointmentStatus | 'ALL'>('ALL')
  const [list, setList] = useState<AppointmentView[]>([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setList(await api.getAppointments({ status }))
    } catch (loadFailure) {
      setLoadError(errorMessage(loadFailure, '无法加载全院预约'))
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  if (!loading && loadError) return <ErrorState message={loadError} onRetry={() => void load()} />

  const onCancel = async (id: string) => {
    if (!user) return
    if (!confirm('确认后台取消该预约？')) return
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
          <h2 className="text-xl font-semibold text-slate-900">预约管理</h2>
          <p className="mt-1 text-sm text-slate-500">查看全院预约并处理异常单</p>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppointmentStatus | 'ALL')}
          >
            <option value="ALL">全部状态</option>
            <option value="PENDING">待就诊</option>
            <option value="COMPLETED">已就诊</option>
            <option value="CANCELLED">已取消</option>
            <option value="NO_SHOW">爽约</option>
          </Select>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      ) : null}

      {loading ? (
        <PageLoading />
      ) : list.length === 0 ? (
        <Empty title="暂无预约" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {a.patientName} → {a.doctorName}
                    </h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {a.departmentName} · {a.workDate} · {TIME_SLOT_LABEL[a.timeSlot]}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">单号 {a.appointmentNo}</p>
                </div>
                {a.status === 'PENDING' ? (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === a.id}
                    onClick={() => void onCancel(a.id)}
                  >
                    {busyId === a.id ? '处理中...' : '取消预约'}
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
