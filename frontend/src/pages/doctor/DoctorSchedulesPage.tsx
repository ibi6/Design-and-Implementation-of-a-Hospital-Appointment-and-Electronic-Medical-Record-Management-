import { useEffect, useState } from 'react'
import * as api from '@/services/api'
import type { DoctorView, Schedule } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { TIME_SLOT_LABEL } from '@/lib/utils'

export function DoctorSchedulesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [doctor, setDoctor] = useState<DoctorView | null>(null)
  const [list, setList] = useState<Schedule[]>([])

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
        const sch = await api.getSchedules({ doctorId: doc.id })
        if (!cancelled) {
          setDoctor(doc)
          setList(sch)
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
  if (!doctor) return <Empty title="未绑定医生档案" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">我的排班</h2>
        <p className="mt-1 text-sm text-slate-500">未来 7 天可预约号源一览</p>
      </div>

      {list.length === 0 ? (
        <Empty title="暂无排班" description="请联系管理员安排出诊时段" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="font-semibold text-slate-900">{s.workDate}</div>
              <div className="mt-1 text-sm text-slate-500">{TIME_SLOT_LABEL[s.timeSlot]}</div>
              <div className="mt-3 text-sm text-slate-600">
                已约 {s.reservedCount} / 总额 {s.totalQuota}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{
                    width: `${Math.min(100, (s.reservedCount / s.totalQuota) * 100)}%`,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
