import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...rest }: Props) {
  return (
    <label className="block space-y-1.5 text-left">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <textarea
        className={cn(
          'w-full min-h-[104px] rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100/80',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
          className,
        )}
        {...rest}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}
