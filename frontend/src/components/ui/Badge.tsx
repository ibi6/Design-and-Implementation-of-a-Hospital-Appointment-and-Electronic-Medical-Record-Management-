import type { ReactNode } from 'react'
import { cn, STATUS_LABEL, statusBadgeClass } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ring-1 ring-inset shadow-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge className={statusBadgeClass(status)}>{STATUS_LABEL[status]}</Badge>
}
