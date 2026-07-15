import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/services/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROLE_LABEL } from '@/lib/utils'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const reset = async () => {
    setBusy(true)
    try {
      await api.resetDemoData()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '联调模式下请删除 backend/data 后重启后端以重置演示数据')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">个人中心</h2>
        <p className="mt-1 text-sm text-slate-500">查看账号信息与演示数据管理</p>
      </div>
      <Card className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-slate-400">姓名</div>
            <div className="mt-1 font-medium text-slate-900">{user?.realName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">用户名</div>
            <div className="mt-1 font-medium text-slate-900">{user?.username}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">手机号</div>
            <div className="mt-1 font-medium text-slate-900">{user?.phone}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">角色</div>
            <div className="mt-1 font-medium text-slate-900">
              {user ? ROLE_LABEL[user.role] : ''}
            </div>
          </div>
        </div>
        {message ? <div className="text-sm text-rose-600">{message}</div> : null}
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => { logout(); navigate('/login') }}>
            退出登录
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => void reset()}>
            {busy ? '查询中...' : '如何重置演示数据'}
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          当前已联调后端。重置演示数据请停止后端，删除 backend/data 目录后重新启动。
        </p>
      </Card>
    </div>
  )
}
