import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import * as api from '@/services/api'
import type { Department } from '@/types'
import { Card } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'

export function DepartmentsPage() {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<Department[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.getDepartments()
        if (!cancelled) setList(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageLoading />

  if (list.length === 0) {
    return <Empty title="暂无科室" description="请联系管理员维护科室信息" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">选择科室</h2>
        <p className="mt-1 text-sm text-slate-500">根据不适症状选择对应科室，再挑选医生与号源</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((dep) => (
          <Link key={dep.id} to={`/patient/doctors?departmentId=${dep.id}`}>
            <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{dep.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{dep.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
