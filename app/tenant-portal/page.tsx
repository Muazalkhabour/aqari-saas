import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { CreditCard, FileText, LifeBuoy, ShieldCheck } from 'lucide-react'
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
  const activeContract = tenant.contracts.find((contract) => contract.isActive) || tenant.contracts[0]
  const overduePaymentsCount = tenant.payments.filter((payment) => payment.status === 'OVERDUE').length
  const openMaintenanceCount = tenant.maintenanceRequests.filter((request) => request.status === 'NEW' || request.status === 'IN_PROGRESS' || request.status === 'SCHEDULED').length
  const contractUnitLabel = activeContract
    ? 'unitNumber' in activeContract.unit && typeof activeContract.unit.unitNumber === 'string'
      ? `${activeContract.unit.property.title} - الوحدة ${activeContract.unit.unitNumber}`
      : activeContract.unit.property.title
    : 'لا يوجد عقد نشط ظاهر لهذا الحساب حالياً.'

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}
        <section className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
                <ShieldCheck className="h-4 w-4" />
                بوابة المستأجر المبسطة
              </div>
              <h1 className="hero-title mt-4 text-[1.45rem] font-bold text-slate-950 sm:text-[1.85rem] lg:text-[2.3rem]">
                ماذا تحتاج الآن: <span className="hero-highlight">العقد أم الدفعة أم الصيانة</span>؟
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                هذه الصفحة لم تعد تحاول عرض كل شيء بالتساوي. ابدأ بملخص العقد، ثم راجع الدفعات، وإذا كانت لديك مشكلة في الوحدة انتقل مباشرة إلى طلب الصيانة.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <FileText className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">العقد الحالي</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {contractUnitLabel}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <CreditCard className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">الدفعات المتأخرة</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">لديك حالياً {overduePaymentsCount} دفعات متأخرة تحتاج مراجعة داخل البوابة.</p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <LifeBuoy className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">طلبات الصيانة المفتوحة</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">يوجد {openMaintenanceCount} طلبات صيانة مفتوحة أو قيد المتابعة لهذا الحساب.</p>
          </article>
        </section>
        <TenantPortalDashboard tenant={tenant} />
      </div>
    </main>
  )
}