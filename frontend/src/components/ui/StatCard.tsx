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
    brand: 'from-brand-500/15 via-teal-50 to-white text-brand-700 ring-brand-100',
    blue: 'from-sky-500/15 via-sky-50 to-white text-sky-700 ring-sky-100',
    amber: 'from-amber-500/15 via-amber-50 to-white text-amber-700 ring-amber-100',
    rose: 'from-rose-500/15 via-rose-50 to-white text-rose-700 ring-rose-100',
    violet: 'from-violet-500/15 via-violet-50 to-white text-violet-700 ring-violet-100',
  }
  const accents = {
    brand: 'from-brand-500 to-teal-500',
    blue: 'from-sky-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-500',
    violet: 'from-violet-500 to-indigo-500',
  }

  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.2)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(13,148,136,0.28)]">
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90', accents[tone])} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-2 text-xs leading-5 text-slate-400">{hint}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 shadow-sm transition group-hover:scale-105',
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
