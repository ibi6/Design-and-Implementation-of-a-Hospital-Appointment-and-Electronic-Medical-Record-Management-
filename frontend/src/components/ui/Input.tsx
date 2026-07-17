import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...rest }: Props) {
  const generatedId = useId()
  const inputId = id || rest.name || generatedId
  const errorId = `${inputId}-error`
  return (
    <label className="block space-y-1.5 text-left">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
          className,
        )}
        {...rest}
      />
      {error ? <span id={errorId} className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
