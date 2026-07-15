import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '@/services/api'
import type { AppointmentView, RecordView } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, formatDate } from '@/lib/utils'

export function WriteRecordPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<AppointmentView | null>(null)
  const [existing, setExisting] = useState<RecordView | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    chiefComplaint: '',
    presentIllness: '',
    physicalExam: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const apt = await api.getAppointment(id)
        const rec = await api.getRecordByAppointment(id)
        if (!cancelled) {
          setAppointment(apt)
          setExisting(rec)
          if (rec) {
            setForm({
              chiefComplaint: rec.chiefComplaint,
              presentIllness: rec.presentIllness,
              physicalExam: rec.physicalExam,
              diagnosis: rec.diagnosis,
              treatment: rec.treatment,
              prescription: rec.prescription,
            })
          } else if (apt?.symptomNote) {
            setForm((f) => ({ ...f, chiefComplaint: apt.symptomNote }))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !appointment) return
    setSubmitting(true)
    setError('')
    try {
      await api.createRecord({
        appointmentId: appointment.id,
        doctorUserId: user.id,
        ...form,
      })
      navigate('/doctor/appointments')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />
  if (!appointment) {
    return (
      <Empty
        title="预约不存在"
        action={
          <Link to="/doctor/appointments">
            <Button>返回</Button>
          </Link>
        }
      />
    )
  }

  const readonly = Boolean(existing) || appointment.status !== 'PENDING'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {readonly ? '病历详情' : '书写电子病历'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            患者 {appointment.patientName} · {appointment.workDate} ·{' '}
            {TIME_SLOT_LABEL[appointment.timeSlot]}
          </p>
        </div>
        <Link to="/doctor/appointments">
          <Button variant="secondary" size="sm">
            返回
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>预约单号：{appointment.appointmentNo}</div>
          <div>科室：{appointment.departmentName}</div>
          <div>症状备注：{appointment.symptomNote || '无'}</div>
          {existing ? <div>病历号：{existing.recordNo}</div> : null}
          {existing ? <div>书写时间：{formatDate(existing.createdAt)}</div> : null}
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="主诉 *"
            value={form.chiefComplaint}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
            required
          />
          <Textarea
            label="现病史"
            value={form.presentIllness}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, presentIllness: e.target.value })}
          />
          <Textarea
            label="体格检查"
            value={form.physicalExam}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, physicalExam: e.target.value })}
          />
          <Input
            label="诊断 *"
            value={form.diagnosis}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            required
          />
          <Textarea
            label="处理意见"
            value={form.treatment}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, treatment: e.target.value })}
          />
          <Textarea
            label="处方说明"
            value={form.prescription}
            disabled={readonly}
            onChange={(e) => setForm({ ...form, prescription: e.target.value })}
          />

          {error ? (
            <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
          ) : null}

          {!readonly ? (
            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中...' : '提交病历并完成就诊'}
            </Button>
          ) : null}
        </form>
      </Card>
    </div>
  )
}
