import { useEffect, useState } from 'react'
import * as api from '@/services/api'
import type { UserPublic } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Spinner'
import { Empty } from '@/components/ui/Empty'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABEL, formatDate } from '@/lib/utils'

export function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<UserPublic[]>([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setList(await api.getUsers())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const toggle = async (user: UserPublic) => {
    if (user.role === 'ADMIN') return
    setBusyId(user.id)
    setError('')
    try {
      await api.setUserStatus(user.id, user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setBusyId('')
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">用户管理</h2>
        <p className="mt-1 text-sm text-slate-500">查看系统用户并启用/停用账号</p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      ) : null}

      {list.length === 0 ? (
        <Empty title="暂无用户" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">用户名</th>
                  <th className="px-4 py-3 font-medium">手机</th>
                  <th className="px-4 py-3 font-medium">角色</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">注册时间</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.realName}</td>
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">{ROLE_LABEL[u.role]}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }
                      >
                        {u.status === 'ACTIVE' ? '正常' : '停用'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.role === 'ADMIN' ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busyId === u.id}
                          onClick={() => void toggle(u)}
                        >
                          {u.status === 'ACTIVE' ? '停用' : '启用'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
