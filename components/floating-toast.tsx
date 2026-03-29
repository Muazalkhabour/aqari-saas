'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

type FloatingToastProps = {
  message: string
  tone: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
  onClose: () => void
  actions?: Array<{
    label: string
    href: string
  }>
}

function toneClass(tone: FloatingToastProps['tone']) {
  switch (tone) {
    case 'error':
      return 'bg-rose-600 text-white'
    case 'warning':
      return 'bg-amber-500 text-slate-950'
    case 'info':
      return 'bg-sky-600 text-white'
    default:
      return 'bg-emerald-600 text-white'
  }
}

export function FloatingToast({ message, tone, visible, onClose, actions }: FloatingToastProps) {
  return (
    <div
      className={`sticky top-24 z-30 self-start rounded-full px-4 py-2 text-sm font-semibold shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'} ${toneClass(tone)}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>{message}</span>
        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <Link
                key={`${action.label}-${action.href}`}
                href={action.href}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${tone === 'warning' ? 'bg-slate-950/10 text-slate-950 hover:bg-slate-950/20' : 'bg-white/15 text-white hover:bg-white/25'}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${tone === 'warning' ? 'bg-slate-950/10 text-slate-950 hover:bg-slate-950/20' : 'bg-white/15 text-white hover:bg-white/25'}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}