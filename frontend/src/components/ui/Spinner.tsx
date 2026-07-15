import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-8 w-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600 shadow-[0_0_0_4px_rgba(13,148,136,0.06)]',
        className,
      )}
      role="status"
      aria-label="加载中"
    />
  )
}

export function PageLoading({ label = '加载中...' }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-500">
      <Spinner />
      <span className="font-medium tracking-tight">{label}</span>
    </div>
  )
}
