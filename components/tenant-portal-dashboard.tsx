import Link from 'next/link'
import { ArrowLeft, CreditCard, LifeBuoy, LogOut, ShieldCheck } from 'lucide-react'
import { createMaintenanceRequestAction, tenantLogoutAction } from '@/app/actions/rental-operations'
import type { TenantPortalData } from '@/lib/rental-db'

const arabicDate = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium' })

function paymentStatusLabel(status: string) {
  switch (status) {
    case 'PAID':
      return 'مدفوعة'
    case 'OVERDUE':
      return 'متأخرة'
    default:
      return 'مستحقة'
  }
}

function paymentStatusClass(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-900'
    case 'OVERDUE':
      return 'bg-rose-100 text-rose-900'
    default:
      return 'bg-amber-100 text-amber-950'
  }
}

function maintenanceStatusLabel(status: string) {
  switch (status) {
    case 'SCHEDULED':
      return 'مجدول'
    case 'IN_PROGRESS':
      return 'قيد التنفيذ'
    case 'COMPLETED':
      return 'مغلق'
    case 'CANCELLED':
      return 'ملغي'
    default:
      return 'جديد'
  }
}

type TenantPortalDashboardProps = {
  tenant: TenantPortalData
}

export function TenantPortalDashboard({ tenant }: TenantPortalDashboardProps) {
  const activeContract = tenant.contracts.find((contract) => contract.isActive) || tenant.contracts[0]

  return (
    <>
      <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              بوابة مستأجر مستقلة بجلسة خاصة
            </div>
            <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
              <span className="hero-line">مرحباً {tenant.fullName}</span>
              <span className="hero-line mt-2 sm:mt-3">العقد والدفعات والصيانة من حسابك مباشرة</span>
            </h1>
            <p className="hero-subtitle mt-3 max-w-2xl">
              بياناتك الآن تُقرأ من قاعدة البيانات، وليس من localStorage، مع جلسة دخول مستقلة لكل مستأجر.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-base btn-secondary">
              لوحة التشغيل
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <form action={tenantLogoutAction}>
              <button type="submit" className="btn-base btn-secondary">
                تسجيل الخروج
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article id="tenant-contract-summary" className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] scroll-mt-28">
          <div className="flex items-center gap-2 text-slate-950">
            <CreditCard className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">العقد والفواتير</h2>
          </div>

          {activeContract ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="stat-label">العقار</div>
                <div className="mt-2 font-bold text-slate-950">{activeContract.unit.property.title}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="stat-label">تاريخ الانتهاء</div>
                <div className="mt-2 font-bold text-slate-950">{arabicDate.format(new Date(activeContract.endDate))}</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="stat-label">الإيجار الشهري</div>
                <div className="mt-2 font-bold text-slate-950">{Number(activeContract.rentAmount)} دولار</div>
              </div>
            </div>
          ) : null}

          <div id="tenant-payments" className="mt-6 space-y-3 scroll-mt-28">
            {tenant.payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-slate-950">{payment.notes || 'دفعة إيجار'}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{payment.property?.title || 'بدون عقار مرتبط'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentStatusClass(payment.status)}`}>
                      {paymentStatusLabel(payment.status)}
                    </span>
                    <div className="text-sm font-semibold text-slate-950">{Number(payment.amount)} دولار</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-[var(--muted)]">الاستحقاق: {arabicDate.format(new Date(payment.dueDate))}</div>
              </div>
            ))}
          </div>
        </article>

        <article id="tenant-maintenance" className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] scroll-mt-28">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">طلبات الصيانة</h2>
          </div>

          <form id="tenant-maintenance-form" action={createMaintenanceRequestAction} className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 scroll-mt-28">
            <input type="hidden" name="contractId" value={activeContract?.id || ''} />
            <input type="hidden" name="propertyId" value={activeContract?.unit?.propertyId || ''} />

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-semibold text-white/80">عنوان الطلب</label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                placeholder="مثال: تسرب مياه في المطبخ"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-semibold text-white/80">التفاصيل</label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                placeholder="اشرح المشكلة ومتى ظهرت، وهل تحتاج تدخل عاجل."
              />
            </div>
            <div>
              <label htmlFor="priority" className="mb-1 block text-sm font-semibold text-white/80">الأولوية</label>
              <select id="priority" name="priority" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none">
                <option value="NORMAL" className="text-slate-950">عادية</option>
                <option value="URGENT" className="text-slate-950">عاجلة</option>
              </select>
            </div>
            <button type="submit" className="btn-base btn-primary w-full">إرسال الطلب للمكتب</button>
          </form>

          <div className="mt-6 space-y-3">
            {tenant.maintenanceRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-white">{request.title}</div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">{maintenanceStatusLabel(request.status)}</div>
                </div>
                <div className="mt-2 text-sm text-white/70">{request.description}</div>
                <div className="mt-2 text-xs text-white/50">تم الإنشاء: {arabicDate.format(new Date(request.createdAt))}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}