import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="text-6xl font-semibold text-slate-300">404</div>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">页面不存在</h1>
      <p className="mt-2 text-sm text-slate-500">请检查地址，或返回系统首页</p>
      <Link to="/" className="mt-6">
        <Button>返回首页</Button>
      </Link>
    </div>
  )
}
