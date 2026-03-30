'use client'

import { useMemo, useState, useSyncExternalStore, useTransition } from 'react'
import { CalendarClock, CheckCircle2, FileText, LifeBuoy, Wrench } from 'lucide-react'
import {
  createMaintenanceRequest,
  loadLocalRentalSnapshot,
  subscribeLocalRentalOps,
  updateInvoiceStatus,
} from '@/lib/local-rental-ops'

const EMPTY_TENANT_PORTAL_SNAPSHOT = {
  tenants: [],
  contracts: [],
  invoices: [],
  maintenanceRequests: [],
} as ReturnType<typeof loadLocalRentalSnapshot>

function formatDate(value?: string) {
  if (!value) {
    return 'غير محدد'
  }

  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function invoiceTone(status: 'paid' | 'pending' | 'overdue') {
  switch (status) {
    case 'paid':
      return 'bg-emerald-700/10 text-emerald-900'
    case 'overdue':
      return 'bg-rose-500/10 text-rose-900'
    case 'pending':
    default:
      return 'bg-amber-500/10 text-amber-900'
  }
}

function invoiceLabel(status: 'paid' | 'pending' | 'overdue') {
  switch (status) {
    case 'paid':
      return 'مدفوعة'
    case 'overdue':
      return 'متأخرة'
    case 'pending':
    default:
      return 'مستحقة'
  }
}

function maintenanceTone(status: 'new' | 'scheduled' | 'completed') {
  switch (status) {
    case 'completed':
      return 'bg-emerald-700/10 text-emerald-900'
    case 'scheduled':
      return 'bg-sky-500/10 text-sky-900'
    case 'new':
    default:
      return 'bg-amber-500/10 text-amber-900'
  }
}

function maintenanceLabel(status: 'new' | 'scheduled' | 'completed') {
  switch (status) {
    case 'completed':
      return 'منجز'
    case 'scheduled':
      return 'مجدول'
    case 'new':
    default:
      return 'جديد'
  }
}

export function LocalTenantPortal() {
  const snapshot = useSyncExternalStore(subscribeLocalRentalOps, loadLocalRentalSnapshot, () => EMPTY_TENANT_PORTAL_SNAPSHOT)
  const [activeTenantId, setActiveTenantId] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedTenantId = activeTenantId || snapshot.tenants[0]?.id || ''

  const activeTenant = useMemo(
    () => snapshot.tenants.find((tenant) => tenant.id === selectedTenantId) ?? snapshot.tenants[0] ?? null,
    [selectedTenantId, snapshot.tenants]
  )

  const activeContracts = useMemo(
    () => snapshot.contracts.filter((contract) => contract.tenantId === activeTenant?.id),
    [activeTenant?.id, snapshot.contracts]
  )

  const activeInvoices = useMemo(
    () => snapshot.invoices
      .filter((invoice) => invoice.tenantId === activeTenant?.id)
      .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()),
    [activeTenant?.id, snapshot.invoices]
  )

  const activeMaintenance = useMemo(
    () => snapshot.maintenanceRequests
      .filter((request) => request.tenantId === activeTenant?.id)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [activeTenant?.id, snapshot.maintenanceRequests]
  )

  const nextInvoice = activeInvoices.find((invoice) => invoice.status !== 'paid')
  const currentContract = activeContracts[0] ?? null

  function submitMaintenance(formData: FormData) {
    if (!activeTenant || !currentContract) {
      return
    }

    startTransition(() => {
      createMaintenanceRequest({
        tenantId: activeTenant.id,
        contractId: currentContract.id,
        title: String(formData.get('title') || 'طلب صيانة جديد'),
        description: String(formData.get('description') || 'وصف مختصر للمشكلة'),
        priority: String(formData.get('priority') || 'عادي') as 'عادي' | 'عاجل',
      })
      setFeedback('تم إرسال طلب الصيانة بنجاح، وستتم متابعته من فريق الإدارة وإشعارك بكل تحديث.')
    })
  }

  if (!activeTenant) {
    return null
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">بوابة المستأجر</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              تابع عقدك ودفعاتك وطلبات الصيانة من مكان واحد، وابقَ على اطلاع بكل جديد يخص سكنك وخدماتك.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <label htmlFor="tenantId" className="field-label mb-1 block">اختيار الحساب</label>
            <select
              id="tenantId"
              value={selectedTenantId}
              onChange={(event) => setActiveTenantId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            >
              {snapshot.tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.fullName} - {tenant.propertyTitle}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="stat-label">العقد الحالي</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{currentContract?.unitLabel ?? 'بدون عقد'}</div>
            <div className="mt-2 text-sm text-[var(--muted)]">ينتهي في {formatDate(currentContract?.endDate)}</div>
          </article>
          <article className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="stat-label">أقرب فاتورة</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{nextInvoice ? `${nextInvoice.amount} دولار` : 'لا يوجد'}</div>
            <div className="mt-2 text-sm text-[var(--muted)]">{nextInvoice ? formatDate(nextInvoice.dueDate) : 'كل الدفعات مسددة'}</div>
          </article>
          <article className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
            <div className="stat-label">طلبات الصيانة المفتوحة</div>
            <div className="mt-2 text-xl font-bold text-slate-950">{activeMaintenance.filter((request) => request.status !== 'completed').length}</div>
            <div className="mt-2 text-sm text-[var(--muted)]">آخر طلب في {formatDate(activeMaintenance[0]?.createdAt)}</div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="space-y-6 rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div>
            <div className="flex items-center gap-2 text-slate-950">
              <FileText className="h-5 w-5 text-emerald-700" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">العقد والفواتير</h2>
            </div>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">عرض مباشر للعقد الحالي وجدول الفواتير مع قدرة سريعة على تسجيل السداد.</p>
          </div>

          {currentContract ? (
            <div className="rounded-[24px] border border-slate-100 bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-slate-950">{currentContract.propertyTitle}</div>
                  <div className="mt-2 text-sm text-[var(--muted)]">الوحدة {currentContract.unitLabel} - {activeTenant.governorate}</div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{currentContract.rentAmount} دولار / {currentContract.paymentPeriod}</div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">تاريخ البداية: <span className="font-bold text-slate-950">{formatDate(currentContract.startDate)}</span></div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">تاريخ النهاية: <span className="font-bold text-slate-950">{formatDate(currentContract.endDate)}</span></div>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {activeInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">{invoice.label}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">الاستحقاق: {formatDate(invoice.dueDate)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${invoiceTone(invoice.status)}`}>
                      {invoiceLabel(invoice.status)}
                    </span>
                    <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{invoice.amount} دولار</div>
                  </div>
                </div>

                {invoice.status !== 'paid' ? (
                  <button
                    type="button"
                    onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                    className="btn-base btn-secondary btn-sm mt-3"
                  >
                    تسجيلها كمدفوعة
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="mt-3 text-xs text-emerald-800">تم السداد في {formatDate(invoice.paidDate)}</div>
                )}
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-emerald-300" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">أرسل طلب صيانة</h2>
            </div>
            <form action={submitMaintenance} className="mt-5 grid gap-3">
              <input name="title" placeholder="عنوان المشكلة" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/15" />
              <select name="priority" defaultValue="عادي" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/15">
                <option value="عادي" className="text-slate-950">عادي</option>
                <option value="عاجل" className="text-slate-950">عاجل</option>
              </select>
              <textarea name="description" rows={4} placeholder="اشرح المشكلة باختصار" className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/15" />
              <button type="submit" disabled={isPending} className="btn-base btn-primary w-full">
                {isPending ? 'جارٍ إرسال الطلب...' : 'إرسال الطلب'}
                <Wrench className="h-4 w-4" />
              </button>
            </form>

            {feedback ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/80">{feedback}</div>
            ) : null}
          </article>

          <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <CalendarClock className="h-5 w-5 text-emerald-700" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">تتبّع الصيانة</h2>
            </div>

            <div className="mt-5 space-y-3">
              {activeMaintenance.map((request) => (
                <div key={request.id} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-950">{request.title}</div>
                      <div className="mt-1 text-sm text-[var(--muted)]">{request.description}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${maintenanceTone(request.status)}`}>
                      {maintenanceLabel(request.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-white px-3 py-1">الأولوية: {request.priority}</span>
                    <span className="rounded-full bg-white px-3 py-1">تاريخ الطلب: {formatDate(request.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}