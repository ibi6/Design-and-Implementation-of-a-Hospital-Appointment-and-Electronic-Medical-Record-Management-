import { useEffect, useState, type FormEvent } from 'react'
import * as api from '@/services/api'
import type { Department, EntityStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { Badge } from '@/components/ui/Badge'

const emptyForm = {
  id: '',
  name: '',
  description: '',
  sortOrder: 1,
  status: 'ACTIVE' as EntityStatus,
}

export function AdminDepartmentsPage() {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<Department[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setList(await api.getDepartments(true))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreate = () => {
    setForm({ ...emptyForm, sortOrder: list.length + 1 })
    setError('')
    setOpen(true)
  }

  const openEdit = (dep: Department) => {
    setForm({
      id: dep.id,
      name: dep.name,
      description: dep.description,
      sortOrder: dep.sortOrder,
      status: dep.status,
    })
    setError('')
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveDepartment({
        id: form.id || undefined,
        name: form.name,
        description: form.description,
        sortOrder: Number(form.sortOrder) || 1,
        status: form.status,
      })
      setOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">科室管理</h2>
          <p className="mt-1 text-sm text-slate-500">维护医院开放科室</p>
        </div>
        <Button onClick={openCreate}>新增科室</Button>
      </div>

      {list.length === 0 ? (
        <Empty title="暂无科室" action={<Button onClick={openCreate}>新增科室</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">名称</th>
                  <th className="px-4 py-3 font-medium">简介</th>
                  <th className="px-4 py-3 font-medium">排序</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((dep) => (
                  <tr key={dep.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{dep.name}</td>
                    <td className="max-w-md px-4 py-3 text-slate-500">{dep.description}</td>
                    <td className="px-4 py-3">{dep.sortOrder}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          dep.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }
                      >
                        {dep.status === 'ACTIVE' ? '启用' : '停用'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(dep)}>
                        编辑
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={open}
        title={form.id ? '编辑科室' : '新增科室'}
        onClose={() => setOpen(false)}
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="科室名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="简介"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="排序"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
          <Select
            label="状态"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as EntityStatus })}
          >
            <option value="ACTIVE">启用</option>
            <option value="DISABLED">停用</option>
          </Select>
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
