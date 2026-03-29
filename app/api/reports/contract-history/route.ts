import { NextResponse } from 'next/server'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { listFilteredContractHistory } from '@/lib/contract-activity'

function escapeCsv(value: string) {
  const normalized = value.replace(/"/g, '""')
  return `"${normalized}"`
}

export async function GET(request: Request) {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const { searchParams } = new URL(request.url)
  const contractIds = searchParams.getAll('contractId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const events = await listFilteredContractHistory({
    contractIds,
    from,
    to,
  })

  const rows = [
    ['contractId', 'type', 'title', 'description', 'actorLabel', 'createdAt', 'comparisons'],
    ...events.map((event) => [
      event.contractId,
      event.type,
      event.title,
      event.description,
      event.actorLabel,
      event.createdAt,
      (event.comparisons || []).map((item) => `${item.label}: ${item.before} -> ${item.after}`).join(' | '),
    ]),
  ]

  const csv = rows.map((row) => row.map((cell) => escapeCsv(String(cell || ''))).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="contract-history.csv"',
    },
  })
}