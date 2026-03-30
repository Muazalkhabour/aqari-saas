import Link from 'next/link'
import { ArrowLeft, RefreshCcw, ShieldCheck } from 'lucide-react'
import { bulkRenewEndingSoonContractsAction } from '@/app/actions/rental-operations'
import { BulkRenewReviewForm } from '@/components/bulk-renew-review-form'
import { getContractManagementData } from '@/lib/contract-management'

export const dynamic = 'force-dynamic'

type BulkRenewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, value.getDate())
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function readMonths(value: string | string[] | undefined) {
  const months = Number(readParam(value) || '12')
  return Number.isInteger(months) && months > 0 && months <= 24 ? months : 12
}

function readFilters(params?: Record<string, string | string[] | undefined>) {
  return {
    query: readParam(params?.query)?.trim() || '',
    propertyId: readParam(params?.propertyId) || 'all',
  }
}

function readError(value: string | string[] | undefined) {
  switch (readParam(value)) {
    case 'no-contracts-selected':
      return 'اختر عقداً واحداً على الأقل من العقود القريبة قبل تنفيذ التجديد الجماعي.'
    case 'invalid-bulk-renewal':
      return 'تحقق من مدة التمديد والزيادة الإيجارية قبل متابعة التجديد الجماعي.'
    case 'bulk-renew-failed':
      return 'تعذر تنفيذ التجديد الجماعي حالياً. أعد المحاولة أو نفّذ التجديد من بطاقة العقد نفسها.'
    default:
      return null
  }
}

function buildBulkRenewHref(months: number, query: string, propertyId: string) {
  const params = new URLSearchParams({ months: String(months) })

  if (query) {
    params.set('query', query)
  }

  if (propertyId !== 'all') {
    params.set('propertyId', propertyId)
  }

  return `/contracts/bulk-renew?${params.toString()}`
}

export default async function BulkRenewContractsPage({ searchParams }: BulkRenewPageProps) {
  const params = searchParams ? await searchParams : undefined
  const extensionMonths = readMonths(params?.months)
  const errorMessage = readError(params?.error)
  const data = await getContractManagementData()
  const filters = readFilters(params)
  const endingSoonContracts = data.contracts.filter((contract) => {
    if (contract.lifecycle !== 'ending-soon') {
      return false
    }

    if (filters.propertyId !== 'all' && contract.propertyId !== filters.propertyId) {
      return false
    }

    if (!filters.query) {
      return true
    }

    const haystack = [contract.tenantName, contract.propertyTitle, contract.unitNumber, contract.id].join(' ').toLowerCase()
    return haystack.includes(filters.query.toLowerCase())
  })
  const propertyGroups = data.propertyOptions
    .map((property) => ({
      ...property,
      count: data.contracts.filter((contract) => contract.lifecycle === 'ending-soon' && contract.propertyId === property.id).length,
    }))
    .filter((property) => property.count > 0)

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <RefreshCcw className="h-4 w-4" />
                التجديد الجماعي
              </div>
              <h1 className="hero-title mt-4 max-w-[38rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">راجع العقود القريبة</span>
                <span className="hero-line mt-2 sm:mt-3">ثم نفّذ التجديد دفعة واحدة</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                اختر العقود أولاً، ثم حدّد مدة التمديد والزيادة الموحدة قبل اعتماد العملية.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/contracts" className="btn-base btn-secondary">
                العودة إلى العقود
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                      القريبة الآن: {endingSoonContracts.length}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            {[6, 12, 24].map((months) => (
              <Link
                key={months}
                href={buildBulkRenewHref(months, filters.query, filters.propertyId)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${months === extensionMonths ? 'ui-active-pill' : 'bg-slate-100 text-slate-700'}`}
              >
                تمديد {months} أشهر
              </Link>
            ))}
          </div>
          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {errorMessage}
            </div>
          ) : null}

          <form action="/contracts/bulk-renew" className="mt-5 grid gap-3 md:grid-cols-[1fr_15rem_auto]">
            <input type="hidden" name="months" value={String(extensionMonths)} />
            <div>
              <label htmlFor="query" className="mb-1 block text-sm font-semibold text-slate-700">بحث</label>
              <input id="query" name="query" defaultValue={filters.query} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" placeholder="اسم المستأجر أو العقار أو الوحدة" />
            </div>
            <div>
              <label htmlFor="propertyId" className="mb-1 block text-sm font-semibold text-slate-700">العقار</label>
              <select id="propertyId" name="propertyId" defaultValue={filters.propertyId} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="all">كل العقارات</option>
                {data.propertyOptions.map((property) => (
                  <option key={property.id} value={property.id}>{property.title}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-base btn-secondary self-end">تطبيق</button>
          </form>

          {propertyGroups.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {propertyGroups.map((property) => {
                const isActive = filters.propertyId === property.id

                return (
                  <Link
                    key={property.id}
                    href={buildBulkRenewHref(extensionMonths, '', property.id)}
                    className={`rounded-[24px] border p-4 transition ${isActive ? 'ui-active-card' : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-white'}`}
                  >
                    <div className="text-sm font-semibold">{property.title}</div>
                    <div className="mt-2 text-3xl font-bold">{property.count}</div>
                    <div className="mt-2 text-sm text-slate-600">مراجعة هذا العقار</div>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </section>

        {endingSoonContracts.length === 0 ? (
          <section className="rounded-[32px] border border-dashed border-slate-300 bg-white/88 p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <h2 className="text-xl font-bold text-slate-950">لا توجد عقود قريبة من الانتهاء حالياً</h2>
            <p className="mt-3 text-sm text-slate-600">عند ظهور عقود تنتهي قريباً ستظهر هنا للمراجعة قبل التجديد.</p>
          </section>
        ) : (
          <BulkRenewReviewForm
            action={bulkRenewEndingSoonContractsAction}
            extensionMonths={extensionMonths}
            contracts={endingSoonContracts.map((contract) => ({
              id: contract.id,
              tenantName: contract.tenantName,
              propertyId: contract.propertyId,
              propertyTitle: contract.propertyTitle,
              unitNumber: contract.unitNumber,
              endDate: formatDate(contract.endDate),
              proposedEndDate: formatDate(addMonths(contract.endDate, extensionMonths)),
              rentAmount: contract.rentAmount,
              totalOutstanding: contract.totalOutstanding,
            }))}
          />
        )}
      </div>
    </main>
  )
}
