import { AuthAuditLogDashboard } from '@/components/auth-audit-log-dashboard'
import { listRecentAuthAuditEvents, type AuthAuditEvent, type AuthAuditOutcome, type AuthAuditScope } from '@/lib/auth-audit'
import { getRateLimitStore } from '@/lib/rate-limit-store'

export const dynamic = 'force-dynamic'

type AuthAuditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type AuthAuditFilters = {
  query: string
  scope: 'all' | AuthAuditScope
  outcome: 'all' | AuthAuditOutcome
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function readFilters(params?: Record<string, string | string[] | undefined>): AuthAuditFilters {
  const scope = readParam(params?.scope)
  const outcome = readParam(params?.outcome)

  return {
    query: readParam(params?.query)?.trim() || '',
    scope: scope === 'owner-login' || scope === 'tenant-login' ? scope : 'all',
    outcome: outcome === 'SUCCESS' || outcome === 'BLOCKED' || outcome === 'FAILURE' ? outcome : 'all',
  }
}

function filterEvents(
  events: AuthAuditEvent[],
  filters: ReturnType<typeof readFilters>
) {
  return events.filter((event) => {
    if (filters.scope !== 'all' && event.scope !== filters.scope) {
      return false
    }

    if (filters.outcome !== 'all' && event.outcome !== filters.outcome) {
      return false
    }

    if (!filters.query) {
      return true
    }

    const haystack = [
      event.reason,
      event.clientIp,
      event.identifierLabel,
      event.scope,
      event.outcome,
    ].join(' ').toLowerCase()

    return haystack.includes(filters.query.toLowerCase())
  })
}

export default async function AuthAuditPage({ searchParams }: AuthAuditPageProps) {
  const params = searchParams ? await searchParams : undefined
  const filters = readFilters(params)
  const allEvents = await listRecentAuthAuditEvents(300)
  const filteredEvents = filterEvents(allEvents, filters)
  const storageKind = getRateLimitStore().kind

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AuthAuditLogDashboard
          events={filteredEvents}
          filters={filters}
          storageKind={storageKind}
          totalCount={allEvents.length}
        />
      </div>
    </main>
  )
}