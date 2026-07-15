import { useEffect, useState, type FormEvent } from 'react'
import * as api from '@/services/api'
import type { DoctorView, Schedule, TimeSlot } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL, todayStr } from '@/lib/utils'

export function AdminSchedulesPage() {
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<DoctorView[]>([])
  const [doctorId, setDoctorId] = useState('')
  const [list, setList] = useState<Schedule[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    doctorId: '',
    workDate: todayStr(),
    timeSlot: 'MORNING' as TimeSlot,
    totalQuota: 10,
  })

  const loadDoctors = async () => {
    const docs = await api.getDoctors()
    setDoctors(docs)
    if (!doctorId && docs[0]) setDoctorId(docs[0].id)
  }

  const loadSchedules = async (id: string) => {
    if (!id) {
      setList([])
      return
    }
    setLoading(true)
    try {
      setList(await api.getSchedules({ doctorId: id }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDoctors()
  }, [])

  useEffect(() => {
    void loadSchedules(doctorId)
  }, [doctorId])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveSchedule({
        doctorId: form.doctorId || doctorId,
        workDate: form.workDate,
        timeSlot: form.timeSlot,
        totalQuota: Number(form.totalQuota) || 10,
      })
      setOpen(false)
      await loadSchedules(doctorId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">排班管理</h2>
          <p className="mt-1 text-sm text-slate-500">为医生配置出诊日期、时段与号源</p>
        </div>
        <Button
          onClick={() => {
            setForm({
              doctorId,
              workDate: todayStr(),
              timeSlot: 'MORNING',
              totalQuota: 10,
            })
            setError('')
            setOpen(true)
          }}
        >
          新增排班
        </Button>
      </div>

      <Card className="p-4">
        <Select
          label="选择医生"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        >
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.realName} · {d.departmentName}
            </option>
          ))}
        </Select>
      </Card>

      {loading ? (
        <PageLoading />
      ) : list.length === 0 ? (
        <Empty title="暂无排班" description="为该医生新增未来出诊时段" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="font-semibold text-slate-900">{s.workDate}</div>
              <div className="mt-1 text-sm text-slate-500">{TIME_SLOT_LABEL[s.timeSlot]}</div>
              <div className="mt-3 text-sm text-slate-600">
                已约 {s.reservedCount} / 总额 {s.totalQuota}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title="新增排班" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Select
            label="医生"
            value={form.doctorId || doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.realName}
              </option>
            ))}
          </Select>
          <Input
            label="日期"
            type="date"
            value={form.workDate}
            onChange={(e) => setForm({ ...form, workDate: e.target.value })}
            required
          />
          <Select
            label="时段"
            value={form.timeSlot}
            onChange={(e) => setForm({ ...form, timeSlot: e.target.value as TimeSlot })}
          >
            <option value="MORNING">上午</option>
            <option value="AFTERNOON">下午</option>
          </Select>
          <Input
            label="号源总数"
            type="number"
            min={1}
            value={form.totalQuota}
            onChange={(e) => setForm({ ...form, totalQuota: Number(e.target.value) })}
            required
          />
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
