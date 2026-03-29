import { NextResponse } from 'next/server'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { getUnreadInternalNotificationsCount } from '@/lib/contract-activity'
import { getOperationsDashboardData } from '@/lib/rental-db'

export async function GET() {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const [unreadCount, operations] = await Promise.all([
    getUnreadInternalNotificationsCount(),
    getOperationsDashboardData(),
  ])

  return NextResponse.json({
    unreadCount,
    endingSoonCount: operations.contracts.length,
    overduePaymentsCount: operations.payments.filter((payment) => payment.status === 'OVERDUE').length,
    maintenanceOpenCount: operations.maintenanceRequests.length,
  })
}
