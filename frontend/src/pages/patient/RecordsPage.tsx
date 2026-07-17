import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/services/api'
import type { RecordView } from '@/types'
import { useAuth } from '@/context/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/utils'

export function RecordsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<RecordView[]>([])
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await api.getRecords({ patientId: user.id })
        if (!cancelled) setList(data)
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error, '无法加载病历'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, retryKey])

  if (loading) return <PageLoading />
  if (loadError) return <ErrorState message={loadError} onRetry={() => setRetryKey((key) => key + 1)} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">我的病历</h2>
        <p className="mt-1 text-sm text-slate-500">仅展示本人的电子病历记录</p>
      </div>

      {list.length === 0 ? (
        <Empty
          title="暂无病历"
          description="完成就诊并由医生书写病历后，将显示在这里"
          action={
            <Link to="/patient/appointments">
              <Button variant="secondary">查看预约</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {r.departmentName} · {r.doctorName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(r.createdAt)} · 单号 {r.recordNo}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">诊断：{r.diagnosis}</p>
                </div>
                <Link to={`/patient/records/${r.id}`}>
                  <Button variant="secondary" size="sm">
                    查看详情
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
