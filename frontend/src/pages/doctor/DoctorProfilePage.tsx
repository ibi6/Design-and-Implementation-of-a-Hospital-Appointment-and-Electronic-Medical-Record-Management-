import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROLE_LABEL } from '@/lib/utils'

export function DoctorProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">个人中心</h2>
        <p className="mt-1 text-sm text-slate-500">医生账号信息</p>
      </div>
      <Card className="space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-slate-400">姓名</div>
            <div className="mt-1 font-medium">{user?.realName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">用户名</div>
            <div className="mt-1 font-medium">{user?.username}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">手机号</div>
            <div className="mt-1 font-medium">{user?.phone}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">角色</div>
            <div className="mt-1 font-medium">{user ? ROLE_LABEL[user.role] : ''}</div>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            void logout().then(() => navigate('/login', { replace: true }))
          }}
        >
          退出登录
        </Button>
      </Card>
    </div>
  )
}
