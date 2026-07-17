import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-[1.5rem] border border-rose-200/80 bg-rose-50/80 px-5 py-6 text-center shadow-sm"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-3 font-semibold text-slate-950">暂时无法加载</h2>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-600">{message}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          重新加载
        </Button>
      ) : null}
    </div>
  )
}
