import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import type { TenantPortalData } from '@/lib/rental-db'
import { requireTenantSession } from '@/lib/tenant-session'
import { getTenantPortalData } from '@/lib/rental-db'
import { TenantPortalDashboard } from '@/components/tenant-portal-dashboard'

export const dynamic = 'force-dynamic'

type TenantPortalPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function diffInDays(targetDate: string | Date) {
  const target = new Date(targetDate)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.ceil((startOfTarget.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000))
}

function buildPortalToast(params: Record<string, string | string[] | undefined> | undefined, tenant: TenantPortalData) {
  const success = readParam(params?.success)
  const error = readParam(params?.error)

  if (success === 'maintenance-created') {
    return {
      message: 'تم إرسال طلب الصيانة بنجاح، وسيظهر الآن في سجل المتابعة داخل البوابة.',
      tone: 'success' as const,
      actions: [{ label: 'عرض طلبات الصيانة', href: '/tenant-portal#tenant-maintenance' }],
    }
  }

  if (error === 'missing-maintenance-fields') {
    return {
      message: 'يرجى استكمال عنوان الطلب والتفاصيل قبل إرسال طلب الصيانة.',
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى نموذج الصيانة', href: '/tenant-portal#tenant-maintenance-form' }],
    }
  }

  if (error === 'contract-not-found') {
    return {
      message: 'تعذر ربط طلب الصيانة بعقد نشط لهذا الحساب حالياً.',
      tone: 'error' as const,
      actions: [{ label: 'مراجعة ملخص العقد', href: '/tenant-portal#tenant-contract-summary' }],
    }
  }

  const activeContract = tenant.contracts.find((contract) => contract.isActive) || tenant.contracts[0]
  const overduePaymentsCount = tenant.payments.filter((payment) => payment.status === 'OVERDUE').length
  const endingSoon = activeContract ? diffInDays(activeContract.endDate) <= 30 : false
  const actions = [
    ...(endingSoon ? [{ label: 'مراجعة العقد الحالي', href: '/tenant-portal#tenant-contract-summary' }] : []),
    ...(overduePaymentsCount > 0 ? [{ label: 'عرض الدفعات المتأخرة', href: '/tenant-portal#tenant-payments' }] : []),
  ]

  if (actions.length > 0) {
    const parts = [] as string[]

    if (endingSoon && activeContract) {
      const daysUntilEnd = diffInDays(activeContract.endDate)
      parts.push(daysUntilEnd <= 0 ? 'العقد الحالي وصل إلى تاريخ الانتهاء' : `العقد الحالي ينتهي خلال ${daysUntilEnd} يوم`) 
    }

    if (overduePaymentsCount > 0) {
      parts.push(`لديك ${overduePaymentsCount} دفعات متأخرة تحتاج المتابعة`) 
    }

    return {
      message: `${parts.join(' و')}. راجع البنود المرتبطة مباشرة من الروابط التالية.`,
      tone: 'warning' as const,
      actions,
    }
  }

  return null
}

export default async function TenantPortalPage({ searchParams }: TenantPortalPageProps) {
  const session = await requireTenantSession()
  const tenant = await getTenantPortalData(session.tenant.id)

  if (!tenant) {
    return null
  }

  const params = searchParams ? await searchParams : undefined
  const toast = buildPortalToast(params, tenant)

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}
        <TenantPortalDashboard tenant={tenant} />
      </div>
    </main>
  )
}