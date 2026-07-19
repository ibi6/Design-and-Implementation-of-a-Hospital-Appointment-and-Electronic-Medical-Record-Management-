import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as api from '@/services/api'
import type { Department, DoctorView, EntityStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/AsyncState'
import { errorMessage } from '@/lib/errors'

const emptyForm = {
  id: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  departmentId: '',
  title: '主治医师',
  specialty: '',
  introduction: '',
  status: 'ACTIVE' as EntityStatus,
}

export function AdminDoctorsPage() {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<DoctorView[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [docs, deps] = await Promise.all([
        api.getDoctors({ includeDisabled: true }),
        api.getDepartments(true),
      ])
      setList(docs)
      setDepartments(deps)
    } catch (loadFailure) {
      setLoadError(errorMessage(loadFailure, '无法加载医生档案'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (!loading && loadError) return <ErrorState message={loadError} onRetry={() => void load()} />

  const openCreate = () => {
    setForm({
      ...emptyForm,
      departmentId: departments[0]?.id || '',
    })
    setError('')
    setOpen(true)
  }

  const openEdit = (doc: DoctorView) => {
    setForm({
      id: doc.id,
      username: '',
      password: '',
      realName: doc.realName,
      phone: doc.phone,
      departmentId: doc.departmentId,
      title: doc.title,
      specialty: doc.specialty,
      introduction: doc.introduction,
      status: doc.status,
    })
    setError('')
    setOpen(true)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.saveDoctor({
        id: form.id || undefined,
        username: form.username || undefined,
        password: form.password || undefined,
        realName: form.realName,
        phone: form.phone,
        departmentId: form.departmentId,
        title: form.title,
        specialty: form.specialty,
        introduction: form.introduction,
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
          <h2 className="text-xl font-semibold text-slate-900">医生管理</h2>
          <p className="mt-1 text-sm text-slate-500">维护医生档案与所属科室</p>
        </div>
        <Button onClick={openCreate}>新增医生</Button>
      </div>

      {list.length === 0 ? (
        <Empty title="暂无医生" action={<Button onClick={openCreate}>新增医生</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((doc) => (
            <Card key={doc.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{doc.realName}</h3>
                    <Badge className="bg-brand-50 text-brand-700 ring-brand-100">{doc.title}</Badge>
                    <Badge
                      className={
                        doc.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                          : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }
                    >
                      {doc.status === 'ACTIVE' ? '在职' : '停用'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {doc.departmentName} · {doc.phone}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">擅长：{doc.specialty}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openEdit(doc)}>
                  编辑
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={form.id ? '编辑医生' : '新增医生'}
        onClose={() => setOpen(false)}
        widthClass="max-w-xl"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          {!form.id ? (
            <>
              <Input
                label="登录用户名"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                minLength={3}
                maxLength={32}
                pattern="[A-Za-z0-9_-]{3,32}"
                required
              />
              <Input
                label="初始密码"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={6}
                maxLength={72}
                autoComplete="new-password"
                placeholder="请输入 6–72 位初始密码"
                required
              />
            </>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="姓名"
              value={form.realName}
              onChange={(e) => setForm({ ...form, realName: e.target.value })}
              required
            />
            <Input
              label="手机号"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="科室"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              required
            >
              <option value="">请选择</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
            <Input
              label="职称"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <Input
            label="擅长"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            required
          />
          <Textarea
            label="简介"
            value={form.introduction}
            onChange={(e) => setForm({ ...form, introduction: e.target.value })}
          />
          <Select
            label="状态"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as EntityStatus })}
          >
            <option value="ACTIVE">在职</option>
            <option value="DISABLED">停用</option>
          </Select>
          {error ? <div role="alert" className="text-sm text-rose-600">{error}</div> : null}
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
