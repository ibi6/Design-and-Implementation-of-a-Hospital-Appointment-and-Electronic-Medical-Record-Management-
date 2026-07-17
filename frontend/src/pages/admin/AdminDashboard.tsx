import { useEffect, useState } from 'react'
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Stethoscope,
  Users,
  XCircle,
} from 'lucide-react'
import * as api from '@/services/api'
import type { StatsOverview } from '@/types'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await api.getStats()
        if (!cancelled) setStats(data)
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error, '无法加载运营统计'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [retryKey])

  if (loading) return <PageLoading />
  if (loadError || !stats) {
    return <ErrorState message={loadError || '统计数据为空'} onRetry={() => setRetryKey((key) => key + 1)} />
  }

  const totalStatus = stats.pendingCount + stats.completedCount + stats.cancelledCount || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">运营看板</h2>
        <p className="mt-1 text-sm text-slate-500">医院预约与资源实时概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="用户总数" value={stats.userCount} icon={<Users className="h-5 w-5" />} tone="violet" />
        <StatCard label="在职医生" value={stats.doctorCount} icon={<Stethoscope className="h-5 w-5" />} tone="blue" />
        <StatCard label="开放科室" value={stats.departmentCount} icon={<Building2 className="h-5 w-5" />} tone="brand" />
        <StatCard label="今日预约" value={stats.todayAppointments} icon={<CalendarCheck className="h-5 w-5" />} tone="amber" />
        <StatCard label="待就诊" value={stats.pendingCount} icon={<CalendarCheck className="h-5 w-5" />} tone="amber" />
        <StatCard label="已完成" value={stats.completedCount} icon={<CheckCircle2 className="h-5 w-5" />} tone="brand" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="预约状态分布" subtitle="全量预约占比" />
          <div className="space-y-4 p-6">
            {[
              { label: '待就诊', value: stats.pendingCount, color: 'bg-amber-500' },
              { label: '已完成', value: stats.completedCount, color: 'bg-brand-500' },
              { label: '已取消', value: stats.cancelledCount, color: 'bg-slate-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.value / totalStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">管理提示</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li>· 先维护科室，再录入医生档案</li>
                <li>· 为医生配置未来排班后，患者端才可约号</li>
                <li>· 演示环境会自动补齐未来 7 天排班</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
