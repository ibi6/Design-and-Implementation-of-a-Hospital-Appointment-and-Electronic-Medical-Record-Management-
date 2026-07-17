import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '@/services/api'
import type { RecordView } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'
import { Empty } from '@/components/ui/Empty'
import { formatDate } from '@/lib/utils'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">
        {value || '—'}
      </div>
    </div>
  )
}

export function RecordDetailPage() {
  const { id = '' } = useParams()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<RecordView | null>(null)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await api.getRecord(id)
        if (!cancelled) setRecord(data)
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error, '无法加载病历详情'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, retryKey])

  if (loading) return <PageLoading />
  if (loadError) return <ErrorState message={loadError} onRetry={() => setRetryKey((key) => key + 1)} />
  if (!record) {
    return (
      <Empty
        title="病历不存在"
        action={
          <Link to="/patient/records">
            <Button>返回列表</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">病历详情</h2>
          <p className="mt-1 text-sm text-slate-500">
            {record.recordNo} · {formatDate(record.createdAt)}
          </p>
        </div>
        <Link to="/patient/records">
          <Button variant="secondary" size="sm">
            返回
          </Button>
        </Link>
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="患者" value={record.patientName} />
          <Field label="医生" value={`${record.doctorName} · ${record.departmentName}`} />
          <Field label="关联预约" value={record.appointmentNo} />
          <Field label="就诊日期" value={record.workDate || formatDate(record.createdAt)} />
        </div>
        <Field label="主诉" value={record.chiefComplaint} />
        <Field label="现病史" value={record.presentIllness} />
        <Field label="体格检查" value={record.physicalExam} />
        <Field label="诊断" value={record.diagnosis} />
        <Field label="处理意见" value={record.treatment} />
        <Field label="处方说明" value={record.prescription} />
      </Card>
    </div>
  )
}
