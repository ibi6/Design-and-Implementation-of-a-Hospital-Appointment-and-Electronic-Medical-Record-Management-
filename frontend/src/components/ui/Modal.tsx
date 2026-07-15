import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  open,
  title,
  children,
  onClose,
  widthClass = 'max-w-lg',
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  widthClass?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="关闭弹窗"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${widthClass} rounded-3xl border border-slate-200 bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="关闭">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
