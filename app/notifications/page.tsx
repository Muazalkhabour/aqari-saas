import { InternalNotificationsCenter } from '@/components/internal-notifications-center'
import { listAllInternalNotifications } from '@/lib/contract-activity'

export const dynamic = 'force-dynamic'

type NotificationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = searchParams ? await searchParams : undefined
  const notifications = await listAllInternalNotifications()
  const tab = readParam(params?.tab) || 'all'
  const page = Math.max(Number(readParam(params?.page) || '1') || 1, 1)

  return <InternalNotificationsCenter notifications={notifications} activeTab={tab} currentPage={page} />
}