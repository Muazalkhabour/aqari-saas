import * as XLSX from 'xlsx'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { getReportingDashboardData } from '@/lib/reporting'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const data = await getReportingDashboardData()

  const workbook = XLSX.utils.book_new()

  const monthlySheet = XLSX.utils.json_to_sheet(
    data.monthlyRevenue.map((item) => ({
      الشهر: item.monthLabel,
      'الإيراد المتوقع': item.expected,
      'الإيراد المحصل': item.collected,
      'المبالغ قيد التحصيل': item.outstanding,
    }))
  )

  const contractsSheet = XLSX.utils.json_to_sheet(
    data.contracts.map((contract) => ({
      المستأجر: contract.tenantName,
      العقار: contract.propertyTitle,
      الوحدة: contract.unitNumber,
      'الإيجار الشهري': contract.rentAmount,
      البداية: contract.startDate.toISOString().slice(0, 10),
      النهاية: contract.endDate.toISOString().slice(0, 10),
      الحالة: contract.isActive ? 'نشط' : 'منتهي',
    }))
  )

  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Revenue')
  XLSX.utils.book_append_sheet(workbook, contractsSheet, 'Contracts')

  const file = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new Response(file, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="aqari-monthly-revenue.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}