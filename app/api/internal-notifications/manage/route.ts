import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireProtectedApiUser } from '@/lib/api-guard'
import {
  clearInternalNotifications,
  listAllInternalNotifications,
  markAllInternalNotificationsAsRead,
  markInternalNotificationAsRead,
  resetDemoInternalNotifications,
} from '@/lib/contract-activity'

type ManageAction = 'mark-read' | 'mark-all-read' | 'reset-demo' | 'clear-all'

export async function POST(request: Request) {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const body = await request.json().catch(() => null) as { action?: ManageAction; notificationId?: string } | null
  const action = body?.action

  if (!action) {
    return NextResponse.json({ error: 'Missing action' }, { status: 400 })
  }

  if (action === 'mark-read') {
    if (!body?.notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 })
    }

    await markInternalNotificationAsRead(body.notificationId)
  }

  if (action === 'mark-all-read') {
    await markAllInternalNotificationsAsRead()
  }

  if (action === 'reset-demo') {
    await resetDemoInternalNotifications()
  }

  if (action === 'clear-all') {
    await clearInternalNotifications()
  }

  revalidatePath('/notifications')
  revalidatePath('/contracts')
  revalidatePath('/dashboard')

  const notifications = await listAllInternalNotifications()
  const unreadCount = notifications.filter((item) => !item.readAt).length

  return NextResponse.json({ notifications, unreadCount })
}