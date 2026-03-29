'use client'

import { useEffect, useState } from 'react'
import { INTERNAL_NOTIFICATIONS_CHANGED_EVENT } from '@/lib/internal-notifications-event'

type LiveUnreadNotificationsBadgeProps = {
  initialCount: number
  className?: string
}

export function LiveUnreadNotificationsBadge({ initialCount, className }: LiveUnreadNotificationsBadgeProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    function handleNotificationsChanged(event: Event) {
      const customEvent = event as CustomEvent<{ unreadCount?: number }>
      setCount(Number(customEvent.detail?.unreadCount || 0))
    }

    window.addEventListener(INTERNAL_NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)

    return () => {
      window.removeEventListener(INTERNAL_NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
    }
  }, [])

  if (count <= 0) {
    return null
  }

  return <span className={className || 'rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white'}>{count}</span>
}