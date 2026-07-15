import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600',
        className,
      )}
      role="status"
      aria-label="加载中"
    />
  )
}

export function PageLoading({ label = '加载中...' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}
