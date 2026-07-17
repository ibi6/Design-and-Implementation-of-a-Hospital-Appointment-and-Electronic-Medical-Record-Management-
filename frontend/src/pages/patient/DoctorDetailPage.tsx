import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '@/services/api'
import type { DoctorView, Schedule } from '@/types'
import { useAuth } from '@/context/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { PageLoading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, cn } from '@/lib/utils'

export function DoctorDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState<DoctorView | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selected, setSelected] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [doc, sch] = await Promise.all([api.getDoctor(id), api.getSchedules({ doctorId: id })])
        if (!cancelled) {
          setDoctor(doc)
          setSchedules(sch)
        }
      } catch (loadFailure) {
        if (!cancelled) setLoadError(errorMessage(loadFailure, '无法加载医生与号源'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, retryKey])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!selected) {
      setError('请选择号源时段')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.createAppointment({
        patientId: user.id,
        scheduleId: selected,
        symptomNote: note,
      })
      navigate('/patient/appointments')
    } catch (err) {
      setError(err instanceof Error ? err.message : '预约失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />
  if (loadError) return <ErrorState message={loadError} onRetry={() => setRetryKey((key) => key + 1)} />
  if (!doctor) {
    return (
      <Empty
        title="医生不存在"
        description="请返回医生列表重新选择"
        action={
          <Link to="/patient/doctors">
            <Button>返回列表</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {doctor.realName}
              <span className="ml-2 text-base font-medium text-brand-700">{doctor.title}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">{doctor.departmentName}</p>
          </div>
          <Link to="/patient/doctors">
            <Button variant="secondary" size="sm">
              返回
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <span className="font-medium">擅长：</span>
          {doctor.specialty}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{doctor.introduction}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">选择号源并预约</h3>
        <p className="mt-1 text-sm text-slate-500">仅展示未来可预约时段，灰色表示已满</p>

        {schedules.length === 0 ? (
          <Empty className="mt-4" title="暂无排班" description="请稍后再试或选择其他医生" />
        ) : (
          <form className="mt-5 space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              {schedules.map((s) => {
                const left = s.totalQuota - s.reservedCount
                const full = left <= 0
                const active = selected === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={full}
                    onClick={() => setSelected(s.id)}
                    className={cn(
                      'rounded-2xl border px-4 py-3 text-left transition',
                      full && 'cursor-not-allowed bg-slate-50 opacity-60',
                      !full && !active && 'border-slate-200 bg-white hover:border-brand-200',
                      active && 'border-brand-400 bg-brand-50 ring-4 ring-brand-100',
                    )}
                  >
                    <div className="font-medium text-slate-900">{s.workDate}</div>
                    <div className="mt-1 text-sm text-slate-500">{TIME_SLOT_LABEL[s.timeSlot]}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      剩余 {left}/{s.totalQuota}
                    </div>
                  </button>
                )
              })}
            </div>

            <Textarea
              label="症状备注（可选）"
              placeholder="简单描述不适症状，方便医生提前了解"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {error ? (
              <div role="alert" className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
            ) : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中...' : '确认预约'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
