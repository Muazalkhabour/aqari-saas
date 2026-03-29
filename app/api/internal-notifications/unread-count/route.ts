import { NextResponse } from 'next/server'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { getUnreadInternalNotificationsCount } from '@/lib/contract-activity'

export async function GET() {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const unreadCount = await getUnreadInternalNotificationsCount()
  return NextResponse.json({ unreadCount })
}