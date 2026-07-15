import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-600 via-teal-600 to-cyan-600 text-white shadow-[0_10px_24px_-12px_rgba(13,148,136,0.7)] hover:shadow-[0_14px_28px_-12px_rgba(13,148,136,0.8)] hover:brightness-[1.03] active:scale-[0.99]',
  secondary:
    'bg-white/90 text-slate-700 border border-slate-200/90 shadow-sm hover:bg-white hover:border-brand-200 hover:text-brand-800',
  ghost: 'bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_10px_24px_-12px_rgba(225,29,72,0.55)] hover:brightness-105',
}

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm rounded-xl',
  md: 'px-4.5 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
