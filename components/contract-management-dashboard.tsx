'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BellRing, CalendarRange, Clock3, CreditCard, FileSearch, FileText, RefreshCcw, Search, ShieldCheck, StopCircle } from 'lucide-react'
import {
  renewContractAction,
  terminateContractAction,
  updateContractDetailsAction,
} from '@/app/actions/rental-operations'
import { FloatingToast } from '@/components/floating-toast'
import type { ContractManagementData, ManagedContractRecord } from '@/lib/contract-management'

type ContractManagementDashboardProps = {
  data: ContractManagementData
  filters: {
    query: string
    lifecycle: string
    propertyId: string
    outstanding: string
    historyFrom: string
    historyTo: string
  }
  propertyOptions: Array<{
    id: string
    title: string
  }>
  totalContractsCount: number
  successMessage?: string | null
  errorMessage?: string | null
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, value.getDate())
}

function lifecycleLabel(lifecycle: ManagedContractRecord['lifecycle']) {
  switch (lifecycle) {
    case 'ending-soon':
      return 'ينتهي قريباً'
    case 'ended':
      return 'منتهي'
    default:
      return 'نشط'
  }
}

function lifecycleTone(lifecycle: ManagedContractRecord['lifecycle']) {
  switch (lifecycle) {
    case 'ending-soon':
      return 'bg-amber-500/10 text-amber-950'
    case 'ended':
      return 'bg-rose-500/10 text-rose-900'
    default:
      return 'bg-emerald-700/10 text-emerald-900'
  }
}

function sourceLabel(source: ContractManagementData['dataSource']) {
  return source === 'database' ? 'بيانات المنصة' : 'خدمة العقود'
}

function notificationTone(severity: 'info' | 'warning' | 'high') {
  switch (severity) {
    case 'high':
      return 'border-rose-200 bg-rose-50 text-rose-900'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function historyTone(type: 'created' | 'updated' | 'renewed' | 'terminated') {
  switch (type) {
    case 'terminated':
      return 'bg-rose-500/10 text-rose-900'
    case 'renewed':
      return 'bg-sky-500/10 text-sky-900'
    case 'updated':
      return 'bg-amber-500/10 text-amber-950'
    default:
      return 'bg-emerald-700/10 text-emerald-900'
  }
}

function historyLabel(type: 'created' | 'updated' | 'renewed' | 'terminated') {
  switch (type) {
    case 'terminated':
      return 'إنهاء'
    case 'renewed':
      return 'تجديد'
    case 'updated':
      return 'تعديل'
    default:
      return 'بداية'
  }
}

export function ContractManagementDashboard({ data, filters, propertyOptions, totalContractsCount, successMessage, errorMessage }: ContractManagementDashboardProps) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error' | 'info' | 'warning'; visible: boolean } | null>(null)
  const toastIdRef = useRef(0)
  const endingSoonCount = data.contracts.filter((contract) => contract.lifecycle === 'ending-soon').length
  const highOutstandingContractsCount = data.contracts.filter((contract) => contract.totalOutstanding >= Math.max(contract.rentAmount * 2, 1000) || contract.overduePayments >= 2).length
  const endedCount = data.contracts.filter((contract) => contract.lifecycle === 'ended').length
  const warningToastActions = [
    ...(endingSoonCount > 0 ? [{ label: 'عقود تنتهي قريباً', href: '/contracts?lifecycle=ending-soon' }] : []),
    ...(highOutstandingContractsCount > 0 ? [{ label: 'مبالغ معلقة عالية', href: '/contracts?outstanding=with-outstanding' }] : []),
  ]

  useEffect(() => {
    let nextToast: { message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null = null

    if (errorMessage) {
      nextToast = {
        message: errorMessage,
        tone: 'error',
      }
    } else if (successMessage) {
      nextToast = {
        message: successMessage,
        tone: 'success',
      }
    } else if (endingSoonCount > 0 || highOutstandingContractsCount > 0) {
      const parts = [] as string[]

      if (endingSoonCount > 0) {
        parts.push(`${endingSoonCount} عقود تقترب من الانتهاء`) 
      }

      if (highOutstandingContractsCount > 0) {
        parts.push(`${highOutstandingContractsCount} عقود لديها مبالغ معلقة عالية`) 
      }

      nextToast = {
        message: `${parts.join(' و')}. يفضّل التعامل معها أولاً.`,
        tone: 'warning',
      }
    } else if (data.dataSource === 'fallback') {
      nextToast = {
        message: 'إدارة العقود متاحة الآن وجاهزة لمتابعة التجديدات والمدفوعات والتنبيهات من مكان واحد.',
        tone: 'info',
      }
    }

    if (!nextToast) {
      return
    }

    toastIdRef.current += 1
    setToast({
      id: toastIdRef.current,
      message: nextToast.message,
      tone: nextToast.tone,
      visible: true,
    })
  }, [data.dataSource, endingSoonCount, errorMessage, highOutstandingContractsCount, successMessage])

  useEffect(() => {
    if (!toast) {
      return
    }

    if (!toast.visible) {
      const removeTimeoutId = window.setTimeout(() => {
        setToast((currentToast) => currentToast?.id === toast.id ? null : currentToast)
      }, 280)

      return () => {
        window.clearTimeout(removeTimeoutId)
      }
    }

    const hideTimeoutId = window.setTimeout(() => {
      setToast((currentToast) => currentToast?.id === toast.id ? { ...currentToast, visible: false } : currentToast)
    }, 2400)

    return () => {
      window.clearTimeout(hideTimeoutId)
    }
  }, [toast])

  function hideToast() {
    setToast((currentToast) => currentToast ? { ...currentToast, visible: false } : currentToast)
  }

  const exportHistoryHref = (() => {
    const params = new URLSearchParams()

    if (filters.historyFrom) {
      params.set('from', filters.historyFrom)
    }

    if (filters.historyTo) {
      params.set('to', filters.historyTo)
    }

    data.contracts.forEach((contract) => {
      params.append('contractId', contract.id)
    })

    return `/api/reports/contract-history${params.toString() ? `?${params.toString()}` : ''}`
  })()

  return (
    <div className="space-y-6">
      {toast ? (
        <FloatingToast
          message={toast.message}
          tone={toast.tone}
          visible={toast.visible}
          onClose={hideToast}
          actions={toast.tone === 'warning' ? warningToastActions : undefined}
        />
      ) : null}

      <section className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">ابدأ من الحالات الحرجة</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {endingSoonCount > 0
                ? `لديك ${endingSoonCount} عقود تنتهي قريباً. هذه أول قائمة يجب فتحها.`
                : 'إذا لم توجد عقود تنتهي قريباً، انتقل مباشرة إلى العقود ذات المبالغ المعلقة.'}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">بعدها افحص المبالغ المعلقة</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {highOutstandingContractsCount > 0
                ? `يوجد ${highOutstandingContractsCount} عقود بمبالغ معلقة عالية أو تأخير متكرر.`
                : 'لا توجد الآن حالات مالية مرتفعة الخطورة، ويمكنك الاكتفاء بالمراجعة الروتينية.'}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">ثم نفّذ الإجراء المناسب</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">داخل كل بطاقة ستجد ثلاثة إجراءات فقط: تعديل، تجديد، أو إنهاء. لا تحتاج للانتقال إلى شاشة منفصلة.</p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">إجمالي العقود</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{data.metrics.total}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">عقود نشطة</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{data.metrics.active}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">تنتهي خلال 30 يوماً</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{data.metrics.endingSoon}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">منتهية</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{data.metrics.ended}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">مبالغ معلّقة</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{formatMoney(data.metrics.outstandingAmount)} $</div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex items-center gap-2 text-slate-950">
            <FileSearch className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">ابدأ بالفلترة ثم افتح العقود</h2>
          </div>
          <p className="body-soft mt-3 text-sm text-[var(--muted)]">
            لا تحاول قراءة كل العقود دفعة واحدة. فلتر أولاً باسم المستأجر أو حالة العقد أو المبالغ المعلقة، ثم افتح البطاقات الناتجة فقط.
          </p>

          <form action="/contracts" className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_15rem_15rem_15rem_13rem_13rem_auto_auto]">
            <div>
              <label htmlFor="query" className="mb-1 block text-sm font-semibold text-slate-700">بحث نصي</label>
              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="query" name="query" defaultValue={filters.query} placeholder="اسم المستأجر، العقار، رقم الوحدة" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="lifecycle" className="mb-1 block text-sm font-semibold text-slate-700">الحالة</label>
              <select id="lifecycle" name="lifecycle" defaultValue={filters.lifecycle} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="all">كل العقود</option>
                <option value="active">نشطة</option>
                <option value="ending-soon">تنتهي قريباً</option>
                <option value="ended">منتهية</option>
              </select>
            </div>
            <div>
              <label htmlFor="propertyId" className="mb-1 block text-sm font-semibold text-slate-700">العقار</label>
              <select id="propertyId" name="propertyId" defaultValue={filters.propertyId} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="all">كل العقارات</option>
                {propertyOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="outstanding" className="mb-1 block text-sm font-semibold text-slate-700">المبالغ المعلقة</label>
              <select id="outstanding" name="outstanding" defaultValue={filters.outstanding} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option value="all">كل الحالات</option>
                <option value="with-outstanding">لديها مبالغ معلقة</option>
                <option value="overdue-only">لديها متأخرات فقط</option>
                <option value="clear">بدون مبالغ معلقة</option>
              </select>
            </div>
            <div>
              <label htmlFor="historyFrom" className="mb-1 block text-sm font-semibold text-slate-700">سجل من</label>
              <input id="historyFrom" name="historyFrom" type="date" defaultValue={filters.historyFrom} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label htmlFor="historyTo" className="mb-1 block text-sm font-semibold text-slate-700">سجل إلى</label>
              <input id="historyTo" name="historyTo" type="date" defaultValue={filters.historyTo} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            </div>
            <button type="submit" className="btn-base btn-primary self-end">
              تطبيق
              <Search className="h-4 w-4" />
            </button>
            <Link href="/contracts" className="btn-base btn-secondary self-end">
              إعادة الضبط
            </Link>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div>
              يتم الآن عرض <span className="font-bold text-slate-950">{data.contracts.length}</span> من أصل <span className="font-bold text-slate-950">{totalContractsCount}</span> عقد.
            </div>
            <a href={exportHistoryHref} className="btn-base btn-secondary btn-sm">
              تصدير سجل العقود CSV
              <FileText className="h-4 w-4" />
            </a>
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">إشعارات العقود</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/70">
            هنا تظهر التنبيهات الناتجة عن التجديد والإنهاء حتى تعرف إن كان هناك ما يحتاج متابعة بعد تنفيذ أي إجراء.
          </p>

          <div className="mt-5 space-y-3">
            {data.internalNotifications.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                لا توجد إشعارات داخلية بعد. ستظهر أولاً عند تنفيذ تجديد أو إنهاء لأي عقد.
              </div>
            ) : (
              data.internalNotifications.map((item) => (
                <Link key={item.id} href={`/notifications`} className={`block rounded-2xl border p-4 ${notificationTone(item.severity)}`}>
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-2 text-sm leading-7">{item.message}</div>
                  <div className="mt-2 text-xs opacity-80">{new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/notifications" className="btn-base btn-secondary btn-sm">
              فتح صفحة الإشعارات
              <BellRing className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              مصدر البيانات الحالي: {sourceLabel(data.dataSource)}
            </div>
            <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">ملخص سريع قبل النزول إلى البطاقات</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
              لديك الآن {endingSoonCount} عقود قريبة من الانتهاء، و{highOutstandingContractsCount} حالات مالية حرجة، و{endedCount} عقود منتهية. بعد هذا الملخص انزل مباشرة إلى البطاقات المعروضة.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {data.contracts.length === 0 ? (
          <article className="rounded-[32px] border border-dashed border-slate-300 bg-white/88 p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <h3 className="text-xl font-bold text-slate-950">لا توجد عقود مطابقة لهذه الفلاتر</h3>
            <p className="mt-3 text-sm text-slate-600">غيّر كلمات البحث أو أعد ضبط الحالة لعرض جميع العقود من جديد.</p>
          </article>
        ) : null}

        {data.contracts.map((contract) => {
          const defaultRenewalDate = formatDateInput(addMonths(contract.endDate, 12))
          const defaultTerminationDate = formatDateInput(new Date())

          return (
            <article id={`contract-card-${contract.id}`} key={contract.id} className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${lifecycleTone(contract.lifecycle)}`}>
                      {lifecycleLabel(contract.lifecycle)}
                    </span>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {contract.id}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-slate-950">{contract.tenantName}</h3>
                  <p className="mt-2 text-sm text-slate-600">{contract.propertyTitle} - الوحدة {contract.unitNumber}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/contracts/${contract.id}/print`} target="_blank" rel="noreferrer" className="btn-base btn-secondary btn-sm">
                    طباعة العقد
                    <FileText className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
                الإجراء الأسرع لهذا العقد:
                <span className="mr-2 font-bold text-slate-950">
                  {contract.lifecycle === 'ending-soon'
                    ? 'راجِع التجديد أولاً.'
                    : contract.totalOutstanding > 0 || contract.overduePayments > 0
                      ? 'راجِع الوضع المالي أولاً ثم قرر التعديل أو التجديد.'
                      : contract.lifecycle === 'ended'
                        ? 'اكتفِ بالطباعة أو المراجعة التاريخية ما لم تكن هناك حاجة لإعادة تفعيل المسار.'
                        : 'يمكنك الاكتفاء بالمراجعة السريعة أو تنفيذ تعديل إذا تغيرت البيانات.'}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">العنوان: <span className="font-bold text-slate-950">{contract.propertyAddress || 'غير متوفر'}</span></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">الإيجار: <span className="font-bold text-slate-950">{formatMoney(contract.rentAmount)} $</span></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">الدفعات المتأخرة: <span className="font-bold text-slate-950">{contract.overduePayments}</span></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">أقرب استحقاق: <span className="font-bold text-slate-950">{contract.nextPaymentDue ? formatDateInput(contract.nextPaymentDue) : 'لا يوجد'}</span></div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <form action={updateContractDetailsAction} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <input type="hidden" name="contractId" value={contract.id} />
                  <div className="flex items-center gap-2 text-slate-950">
                    <CalendarRange className="h-4 w-4 text-emerald-700" />
                    <h4 className="text-lg font-bold">تعديل البيانات الأساسية</h4>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div>
                      <label htmlFor={`startDate-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">بداية العقد</label>
                      <input id={`startDate-${contract.id}`} name="startDate" type="date" defaultValue={formatDateInput(contract.startDate)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <div>
                      <label htmlFor={`endDate-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">نهاية العقد</label>
                      <input id={`endDate-${contract.id}`} name="endDate" type="date" defaultValue={formatDateInput(contract.endDate)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <div>
                      <label htmlFor={`rentAmount-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">القيمة الإيجارية</label>
                      <input id={`rentAmount-${contract.id}`} name="rentAmount" type="number" min="1" step="1" defaultValue={String(contract.rentAmount)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" className="btn-base btn-primary w-full">
                      حفظ التعديل
                      <CreditCard className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <form action={renewContractAction} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                  <input type="hidden" name="contractId" value={contract.id} />
                  <div className="flex items-center gap-2 text-slate-950">
                    <RefreshCcw className="h-4 w-4 text-emerald-700" />
                    <h4 className="text-lg font-bold">تجديد العقد</h4>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div>
                      <label htmlFor={`newEndDate-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">تاريخ النهاية الجديد</label>
                      <input id={`newEndDate-${contract.id}`} name="newEndDate" type="date" defaultValue={defaultRenewalDate} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <div>
                      <label htmlFor={`newRentAmount-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">القيمة الجديدة إن وجدت</label>
                      <input id={`newRentAmount-${contract.id}`} name="newRentAmount" type="number" min="1" step="1" placeholder={String(contract.rentAmount)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" className="btn-base btn-secondary w-full">
                      تنفيذ التجديد
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <form action={terminateContractAction} className="rounded-[28px] border border-rose-200 bg-rose-50/70 p-5">
                  <input type="hidden" name="contractId" value={contract.id} />
                  <div className="flex items-center gap-2 text-slate-950">
                    <StopCircle className="h-4 w-4 text-rose-700" />
                    <h4 className="text-lg font-bold">إنهاء العقد</h4>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div>
                      <label htmlFor={`terminationDate-${contract.id}`} className="mb-1 block text-sm font-semibold text-slate-700">تاريخ الإنهاء</label>
                      <input id={`terminationDate-${contract.id}`} name="terminationDate" type="date" defaultValue={defaultTerminationDate} className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none" />
                    </div>
                    <p className="text-xs leading-6 text-slate-600">إذا اخترت تاريخاً مستقبلياً سيبقى العقد نشطاً حتى ذلك اليوم، وبعدها يظهر كمنتهي.</p>
                    <button type="submit" className="btn-base w-full border border-rose-300 bg-white text-rose-800 hover:bg-rose-100">
                      اعتماد الإنهاء
                      <StopCircle className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              <div id={`contract-history-${contract.id}`} className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 scroll-mt-28">
                <div className="flex items-center gap-2 text-slate-950">
                  <Clock3 className="h-4 w-4 text-emerald-700" />
                  <h4 className="text-lg font-bold">السجل الزمني للعقد</h4>
                </div>
                <div className="mt-4 space-y-3">
                  {contract.history.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      لا توجد أحداث مسجلة بعد لهذا العقد.
                    </div>
                  ) : (
                    contract.history.slice(0, 6).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${historyTone(event.type)}`}>
                              {historyLabel(event.type)}
                            </span>
                            <div className="font-semibold text-slate-950">{event.title}</div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}
                          </div>
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-700">{event.description}</div>
                        {event.comparisons && event.comparisons.length > 0 ? (
                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {event.comparisons.map((comparison) => (
                              <div key={`${event.id}-${comparison.label}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs font-semibold text-slate-500">{comparison.label}</div>
                                <div className="mt-3 grid gap-2">
                                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                                    <div className="text-[11px] font-bold text-rose-800">قبل</div>
                                    <div className="mt-1 text-sm text-slate-800">{comparison.before}</div>
                                  </div>
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    <div className="text-[11px] font-bold text-emerald-800">بعد</div>
                                    <div className="mt-1 text-sm text-slate-800">{comparison.after}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-2 text-xs text-slate-500">تم بواسطة: {event.actorLabel}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}