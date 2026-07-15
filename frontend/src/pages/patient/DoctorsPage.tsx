import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as api from '@/services/api'
import type { Department, DoctorView } from '@/types'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'

export function DoctorsPage() {
  const [params, setParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<DoctorView[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [keyword, setKeyword] = useState(params.get('q') || '')
  const departmentId = params.get('departmentId') || ''

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [docs, deps] = await Promise.all([
          api.getDoctors({
            departmentId: departmentId || undefined,
            keyword: keyword || undefined,
          }),
          api.getDepartments(),
        ])
        if (!cancelled) {
          setDoctors(docs)
          setDepartments(deps)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [departmentId, keyword])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">医生列表</h2>
        <p className="mt-1 text-sm text-slate-500">按科室筛选或搜索医生姓名、擅长方向</p>
      </div>

      <Card className="grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]">
        <Input
          placeholder="搜索医生姓名 / 擅长"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          value={departmentId}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value) next.set('departmentId', e.target.value)
            else next.delete('departmentId')
            setParams(next)
          }}
        >
          <option value="">全部科室</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Button
          variant="secondary"
          onClick={() => {
            setKeyword('')
            setParams({})
          }}
        >
          重置
        </Button>
      </Card>

      {loading ? (
        <PageLoading />
      ) : doctors.length === 0 ? (
        <Empty title="没有匹配的医生" description="试试更换科室或关键词" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {doctors.map((doc) => (
            <Card key={doc.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {doc.realName}
                    <span className="ml-2 text-sm font-medium text-brand-700">{doc.title}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{doc.departmentName}</div>
                </div>
                <Link to={`/patient/doctors/${doc.id}`}>
                  <Button size="sm">预约</Button>
                </Link>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">擅长：</span>
                {doc.specialty}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{doc.introduction}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
