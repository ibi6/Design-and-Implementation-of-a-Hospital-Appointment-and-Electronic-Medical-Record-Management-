import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className, children, ...rest }: Props) {
  return (
    <label className="block space-y-1.5 text-left">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <select
        className={cn(
          'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
