import { NextResponse } from 'next/server'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { readLastBulkRenewSummary } from '@/lib/bulk-renew-summary'
import { getContractManagementData } from '@/lib/contract-management'

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function readIdList(value: string | null) {
  if (!value) {
    return [] as string[]
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export async function GET(request: Request) {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const { searchParams } = new URL(request.url)
  const persistedSummary = await readLastBulkRenewSummary()
  const renewedIds = readIdList(searchParams.get('renewed'))
  const failedIds = readIdList(searchParams.get('failedIds'))
  const effectiveRenewedIds = renewedIds.length > 0 ? renewedIds : (persistedSummary?.renewedIds || [])
  const effectiveFailedIds = failedIds.length > 0 ? failedIds : (persistedSummary?.failedIds || [])
  const data = await getContractManagementData()

  const rows = [
    ['status', 'contractId', 'tenantName', 'propertyTitle', 'unitNumber', 'endDate', 'rentAmount', 'lifecycle'],
    ...data.contracts
      .filter((contract) => effectiveRenewedIds.includes(contract.id) || effectiveFailedIds.includes(contract.id))
      .map((contract) => [
        effectiveRenewedIds.includes(contract.id) ? 'renewed' : 'failed',
        contract.id,
        contract.tenantName,
        contract.propertyTitle,
        contract.unitNumber,
        contract.endDate.toISOString().slice(0, 10),
        String(contract.rentAmount),
        contract.lifecycle,
      ]),
  ]

  const csv = rows.map((row) => row.map((cell) => escapeCsv(String(cell || ''))).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bulk-renew-summary.csv"',
    },
  })
}
