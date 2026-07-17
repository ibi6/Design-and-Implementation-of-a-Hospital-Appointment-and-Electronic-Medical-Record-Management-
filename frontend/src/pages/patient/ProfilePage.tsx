import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROLE_LABEL } from '@/lib/utils'
import { errorMessage } from '@/lib/errors'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onLogout = async () => {
    setBusy(true)
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (logoutFailure) {
      setError(errorMessage(logoutFailure, '退出登录失败，请稍后重试'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">个人中心</h2>
        <p className="mt-1 text-sm text-slate-500">查看账号信息与管理当前会话</p>
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
        {error ? (
          <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" disabled={busy} onClick={() => void onLogout()}>
            {busy ? '退出中...' : '退出登录'}
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          登录凭证保存在受保护的 HttpOnly Cookie 中，退出后服务端会立即清除当前会话。
        </p>
      </Card>
    </div>
  )
}
