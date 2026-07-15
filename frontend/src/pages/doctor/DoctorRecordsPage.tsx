import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/services/api'
import type { RecordView } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { formatDate } from '@/lib/utils'

export function DoctorRecordsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<RecordView[]>([])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const doc = await api.getDoctorByUserId(user.id)
        if (!doc) return
        const records = await api.getRecords({ doctorId: doc.id })
        if (!cancelled) setList(records)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">历史病历</h2>
        <p className="mt-1 text-sm text-slate-500">本人接诊完成的电子病历</p>
      </div>

      {list.length === 0 ? (
        <Empty title="暂无病历" description="完成接诊后将生成记录" />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{r.patientName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(r.createdAt)} · {r.recordNo}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">诊断：{r.diagnosis}</p>
                </div>
                <Link to={`/doctor/appointments/${r.appointmentId}/record`}>
                  <Button size="sm" variant="secondary">
                    查看
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
