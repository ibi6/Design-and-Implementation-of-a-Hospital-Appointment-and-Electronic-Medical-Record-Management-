import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string
  value: string | number
  hint?: string
  icon: ReactNode
  tone?: 'brand' | 'blue' | 'amber' | 'rose' | 'violet'
}) {
  const tones = {
    brand: 'from-brand-50 to-white text-brand-700',
    blue: 'from-sky-50 to-white text-sky-700',
    amber: 'from-amber-50 to-white text-amber-700',
    rose: 'from-rose-50 to-white text-rose-700',
    violet: 'from-violet-50 to-white text-violet-700',
  }
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm',
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
