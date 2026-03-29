'use client'

import { useEffect, useRef, useState } from 'react'
import { FloatingToast } from '@/components/floating-toast'

type AutoDismissToastProps = {
  message: string
  tone: 'success' | 'error' | 'info' | 'warning'
  actions?: Array<{
    label: string
    href: string
  }>
}

export function AutoDismissToast({ message, tone, actions }: AutoDismissToastProps) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: AutoDismissToastProps['tone']; actions?: AutoDismissToastProps['actions']; visible: boolean } | null>({ id: 1, message, tone, actions, visible: true })
  const toastIdRef = useRef(1)

  useEffect(() => {
    toastIdRef.current += 1
    setToast({ id: toastIdRef.current, message, tone, actions, visible: true })
  }, [actions, message, tone])

  useEffect(() => {
    if (!toast) {
      return
    }

    if (!toast.visible) {
      const removeTimeoutId = window.setTimeout(() => {
        setToast((currentToast) => currentToast?.id === toast.id ? null : currentToast)
      }, 280)

      return () => {
        window.clearTimeout(removeTimeoutId)
      }
    }

    const hideTimeoutId = window.setTimeout(() => {
      setToast((currentToast) => currentToast?.id === toast.id ? { ...currentToast, visible: false } : currentToast)
    }, 2400)

    return () => {
      window.clearTimeout(hideTimeoutId)
    }
  }, [toast])

  if (!toast) {
    return null
  }

  return (
    <FloatingToast
      message={toast.message}
      tone={toast.tone}
      actions={toast.actions}
      visible={toast.visible}
      onClose={() => setToast((currentToast) => currentToast ? { ...currentToast, visible: false } : currentToast)}
    />
  )
}