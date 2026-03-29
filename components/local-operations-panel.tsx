'use client'

import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'
import { BellRing, CalendarClock, CreditCard, Siren, Wrench } from 'lucide-react'
import {
  countContractsEndingSoon,
  countNewMaintenanceRequests,
  countOverduePayments,
  countPaymentsDueSoon,
  deriveOperationalNotifications,
  loadLocalRentalSnapshot,
  subscribeLocalRentalOps,
} from '@/lib/local-rental-ops'

const EMPTY_RENTAL_SNAPSHOT = {
  tenants: [],
  contracts: [],
  invoices: [],
  maintenanceRequests: [],
} as ReturnType<typeof loadLocalRentalSnapshot>

function formatDate(value?: string) {
  if (!value) {
    return 'بدون تاريخ'
  }

  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

function notificationTone(type: string) {
  switch (type) {
    case 'payment-overdue':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'contract-expiry':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'payment-due':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'maintenance':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

export function LocalOperationsPanel() {
  const snapshot = useSyncExternalStore(subscribeLocalRentalOps, loadLocalRentalSnapshot, () => EMPTY_RENTAL_SNAPSHOT)

  const notifications = useMemo(() => deriveOperationalNotifications(snapshot), [snapshot])

  const metrics = useMemo(() => ({
    endingSoon: countContractsEndingSoon(snapshot.contracts),
    dueSoon: countPaymentsDueSoon(snapshot.invoices),
    overdue: countOverduePayments(snapshot.invoices),
    maintenance: countNewMaintenanceRequests(snapshot.maintenanceRequests),
  }), [snapshot])

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">تشغيل العقود والتنبيهات</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              لوحة متابعة تشغيلية سريعة للعقود، الاستحقاقات، والطلبات الجديدة قبل أن تتحول إلى مشكلة فعلية.
            </p>
          </div>
          <Link href="/tenant-portal" className="btn-base btn-primary btn-sm">
            افتح بوابة المستأجر
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="stat-label">عقود تنتهي خلال 30 يوم</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{metrics.endingSoon}</div>
              </div>
              <CalendarClock className="h-5 w-5 text-amber-700" />
            </div>
          </article>
          <article className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="stat-label">دفعات خلال 3 أيام</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{metrics.dueSoon}</div>
              </div>
              <CreditCard className="h-5 w-5 text-sky-700" />
            </div>
          </article>
          <article className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="stat-label">دفعات متأخرة</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{metrics.overdue}</div>
              </div>
              <Siren className="h-5 w-5 text-rose-700" />
            </div>
          </article>
          <article className="rounded-[24px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_14px_36px_rgba(16,42,67,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="stat-label">طلبات صيانة جديدة</div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{metrics.maintenance}</div>
              </div>
              <Wrench className="h-5 w-5 text-emerald-700" />
            </div>
          </article>
        </div>
      </article>

      <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">التنبيهات الحالية</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            {notifications.length} تنبيه
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {notifications.length > 0 ? notifications.slice(0, 6).map((notification) => (
            <div key={notification.id} className={`rounded-2xl border p-4 text-sm leading-7 ${notificationTone(notification.type)}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-bold">{notification.title}</div>
                <div className="text-xs opacity-75">{formatDate(notification.dueDate)}</div>
              </div>
              <p className="mt-2 opacity-85">{notification.description}</p>
              <Link href={notification.actionHref} className="mt-3 inline-flex text-xs font-bold underline underline-offset-4">
                {notification.actionLabel}
              </Link>
            </div>
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
              لا توجد تنبيهات حرجة الآن. عند اقتراب نهاية عقد أو موعد دفعة أو وصول طلب صيانة جديد ستظهر هنا مباشرة.
            </div>
          )}
        </div>
      </article>
    </section>
  )
}