import Link from 'next/link'
import { ArrowLeft, FileText, RefreshCcw, ShieldCheck } from 'lucide-react'
import { ContractManagementDashboard } from '@/components/contract-management-dashboard'
import { readLastBulkRenewSummary } from '@/lib/bulk-renew-summary'
import { getContractManagementData, type ManagedContractRecord } from '@/lib/contract-management'

export const dynamic = 'force-dynamic'

type ContractsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function readFilters(params?: Record<string, string | string[] | undefined>) {
  return {
    query: readParam(params?.query)?.trim() || '',
    lifecycle: readParam(params?.lifecycle) || 'all',
    propertyId: readParam(params?.propertyId) || 'all',
    outstanding: readParam(params?.outstanding) || 'all',
    historyFrom: readParam(params?.historyFrom) || '',
    historyTo: readParam(params?.historyTo) || '',
  }
}

function filterContracts(contracts: ManagedContractRecord[], filters: ReturnType<typeof readFilters>) {
  return contracts.filter((contract) => {
    if (filters.lifecycle !== 'all' && contract.lifecycle !== filters.lifecycle) {
      return false
    }

    if (filters.propertyId !== 'all' && contract.propertyId !== filters.propertyId) {
      return false
    }

    if (filters.outstanding === 'with-outstanding' && contract.totalOutstanding <= 0) {
      return false
    }

    if (filters.outstanding === 'overdue-only' && contract.overduePayments <= 0) {
      return false
    }

    if (filters.outstanding === 'clear' && contract.totalOutstanding > 0) {
      return false
    }

    if (!filters.query) {
      return true
    }

    const haystack = [
      contract.id,
      contract.tenantName,
      contract.tenantEmail || '',
      contract.tenantPhone || '',
      contract.propertyTitle,
      contract.propertyAddress || '',
      contract.unitNumber,
    ].join(' ').toLowerCase()

    return haystack.includes(filters.query.toLowerCase())
  }).map((contract) => ({
    ...contract,
    history: contract.history.filter((event) => {
      const createdAt = new Date(event.createdAt).getTime()

      if (filters.historyFrom) {
        const from = new Date(filters.historyFrom).getTime()
        if (createdAt < from) {
          return false
        }
      }

      if (filters.historyTo) {
        const to = new Date(filters.historyTo)
        to.setHours(23, 59, 59, 999)
        if (createdAt > to.getTime()) {
          return false
        }
      }

      return true
    }),
  }))
}

function readSuccessMessage(params?: Record<string, string | string[] | undefined>) {
  const item = readParam(params?.success)
  const count = Number(readParam(params?.count) || '0')
  const failed = Number(readParam(params?.failed) || '0')

  switch (item) {
    case 'contract-updated':
      return 'تم تحديث بيانات العقد وحفظها بنجاح.'
    case 'contract-renewed':
      return 'تم تجديد العقد وتحديث تاريخ النهاية بنجاح.'
    case 'contract-ended':
      return 'تم اعتماد إنهاء العقد وتحديث حالته.'
    case 'bulk-contracts-renewed':
      return `تم تجديد ${count || 0} عقود دفعة واحدة${failed > 0 ? `، وتعذر تجديد ${failed} عقود.` : '.'}`
    default:
      return null
  }
}

function readErrorMessage(value: string | string[] | undefined) {
  const item = readParam(value)
  switch (item) {
    case 'invalid-contract':
      return 'تعذر تحديد العقد المطلوب. أعد المحاولة من القائمة.'
    case 'invalid-contract-update':
      return 'تحقق من تاريخ البداية والنهاية والقيمة الإيجارية قبل الحفظ.'
    case 'invalid-contract-renewal':
      return 'تاريخ التجديد يجب أن يكون بعد نهاية العقد الحالية.'
    case 'invalid-contract-termination':
      return 'تاريخ الإنهاء غير صالح بالنسبة لبداية العقد.'
    default:
      return null
  }
}

function buildBulkRenewSummary(
  contracts: ManagedContractRecord[],
  storedSummary: {
    generatedAt: string
    renewedIds: string[]
    failedIds: string[]
    successCount: number
    failedCount: number
    extensionMonths: number
    rentAdjustment: number
  } | null
) {
  if (!storedSummary) {
    return null
  }

  return {
    generatedAt: storedSummary.generatedAt,
    successCount: storedSummary.successCount,
    failedCount: storedSummary.failedCount,
    extensionMonths: storedSummary.extensionMonths,
    rentAdjustment: storedSummary.rentAdjustment,
    renewed: contracts.filter((contract) => storedSummary.renewedIds.includes(contract.id)),
    failed: contracts.filter((contract) => storedSummary.failedIds.includes(contract.id)),
  }
}

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const params = searchParams ? await searchParams : undefined
  const data = await getContractManagementData()
  const storedBulkRenewSummary = await readLastBulkRenewSummary()
  const filters = readFilters(params)
  const filteredContracts = filterContracts(data.contracts, filters)
  const successMessage = readSuccessMessage(params)
  const errorMessage = readErrorMessage(params?.error)
  const bulkRenewSummary = buildBulkRenewSummary(data.contracts, storedBulkRenewSummary)
  const bulkRenewExportHref = bulkRenewSummary ? '/api/reports/bulk-renew-summary' : null
  const bulkRenewPdfExportHref = bulkRenewSummary ? '/api/reports/bulk-renew-summary-pdf' : null

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <FileText className="h-4 w-4" />
                إدارة العقود من لوحة المكتب
              </div>
              <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">قائمة العقود، التعديل، التجديد، والإنهاء</span>
                <span className="hero-line mt-2 sm:mt-3">من شاشة تشغيل واحدة</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                هذه الصفحة تربط بين بيانات العقد، حالة الاستحقاقات، وصفحة الطباعة، حتى يدير المكتب دورة العقد كاملة دون التنقل العشوائي بين الصفحات.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-base btn-secondary">
                العودة إلى اللوحة
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/contracts/contract-rima/print" className="btn-base btn-secondary" target="_blank" rel="noreferrer">
                معاينة عقد مطبوع
                <FileText className="h-4 w-4" />
              </Link>
              <Link href="/contracts/bulk-renew" className="btn-base btn-secondary">
                تجديد جماعي للعقود القريبة
                <RefreshCcw className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  جاهزة الآن للتعديل والتجديد والإنهاء
                </div>
              </div>
            </div>
          </div>
        </section>

        {bulkRenewSummary ? (
          <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-emerald-800">نتيجة التجديد الجماعي الأخيرة</div>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">تفاصيل العقود التي نُفذ عليها الأمر</h2>
                <p className="mt-2 text-sm text-slate-600">
                  آخر تشغيل محفوظ بتاريخ {new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(bulkRenewSummary.generatedAt))}
                  {' '}لمدة {bulkRenewSummary.extensionMonths} شهر
                  {bulkRenewSummary.rentAdjustment > 0 ? ` مع زيادة موحدة ${bulkRenewSummary.rentAdjustment} دولار.` : ' بدون زيادة موحدة على الإيجار.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {bulkRenewExportHref ? <a href={bulkRenewExportHref} className="btn-base btn-secondary btn-sm">تصدير CSV</a> : null}
                {bulkRenewPdfExportHref ? <a href={bulkRenewPdfExportHref} className="btn-base btn-secondary btn-sm" target="_blank" rel="noreferrer">تصدير PDF</a> : null}
                <Link href="/contracts/bulk-renew" className="btn-base btn-secondary btn-sm">
                  تشغيل تجديد جماعي جديد
                  <RefreshCcw className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-5">
                <div className="text-sm font-semibold text-emerald-900">تم تجديدها</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{bulkRenewSummary.renewed.length}</div>
                <div className="mt-4 space-y-3">
                  {bulkRenewSummary.renewed.length === 0 ? (
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-slate-600">لا توجد عقود نجحت في آخر تنفيذ.</div>
                  ) : (
                    bulkRenewSummary.renewed.map((contract) => (
                      <div key={contract.id} className="rounded-2xl border border-emerald-200 bg-white p-4">
                        <div className="font-semibold text-slate-950">{contract.tenantName}</div>
                        <div className="mt-1 text-sm text-slate-600">{contract.propertyTitle} - الوحدة {contract.unitNumber}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link href={`/contracts?query=${encodeURIComponent(contract.tenantName)}#contract-card-${contract.id}`} className="btn-base btn-secondary btn-sm">العقد</Link>
                          <Link href={`/contracts?query=${encodeURIComponent(contract.tenantName)}#contract-history-${contract.id}`} className="btn-base btn-secondary btn-sm">سجل العقد</Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-5">
                <div className="text-sm font-semibold text-amber-950">تعذر تجديدها</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{bulkRenewSummary.failed.length}</div>
                <div className="mt-4 space-y-3">
                  {bulkRenewSummary.failed.length === 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm text-slate-600">لا توجد عقود فاشلة في آخر تنفيذ.</div>
                  ) : (
                    bulkRenewSummary.failed.map((contract) => (
                      <div key={contract.id} className="rounded-2xl border border-amber-200 bg-white p-4">
                        <div className="font-semibold text-slate-950">{contract.tenantName}</div>
                        <div className="mt-1 text-sm text-slate-600">{contract.propertyTitle} - الوحدة {contract.unitNumber}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link href={`/contracts?query=${encodeURIComponent(contract.tenantName)}#contract-card-${contract.id}`} className="btn-base btn-secondary btn-sm">مراجعة العقد</Link>
                          <Link href={`/contracts/bulk-renew?query=${encodeURIComponent(contract.tenantName)}`} className="btn-base btn-secondary btn-sm">إعادة المحاولة</Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <ContractManagementDashboard
          data={{ ...data, contracts: filteredContracts }}
          filters={filters}
          propertyOptions={data.propertyOptions}
          totalContractsCount={data.contracts.length}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  )
}