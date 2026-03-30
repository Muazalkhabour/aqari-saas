import Link from 'next/link'
import { CheckCircle2, CircleAlert, CreditCard, LifeBuoy, Mail, Wrench } from 'lucide-react'
import { dispatchOperationalNotificationsActionWithFormData, markPaymentAsPaidAction, updateMaintenanceRequestStatusAction } from '@/app/actions/rental-operations'
import { getMaintenanceDashboardData } from '@/lib/rental-db'

const arabicDate = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium' })

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

function alertTone(severity: 'high' | 'medium') {
  return severity === 'high'
    ? 'border-rose-200 bg-rose-50 text-rose-900'
    : 'border-amber-200 bg-amber-50 text-amber-950'
}

function buildLogActions(item: Awaited<ReturnType<typeof getMaintenanceDashboardData>>['notificationLogs'][number]) {
  const actions = [] as Array<{ label: string; href: string }>
  const tenantQuery = item.tenant?.fullName ? `query=${encodeURIComponent(item.tenant.fullName)}` : ''

  if (item.contractId) {
    const href = tenantQuery
      ? `/contracts?${tenantQuery}#contract-card-${item.contractId}`
      : `/contracts#contract-card-${item.contractId}`

    actions.push({ label: 'العقد بفلتر جاهز', href })
    actions.push({ label: 'سجل العقد', href: `/contracts${tenantQuery ? `?${tenantQuery}` : ''}#contract-history-${item.contractId}` })
  }

  if (item.paymentId) {
    const params = new URLSearchParams({ outstanding: 'with-outstanding' })

    if (item.tenant?.fullName) {
      params.set('query', item.tenant.fullName)
    }

    actions.push({ label: 'الدفعات المعلقة', href: `/contracts?${params.toString()}` })
    actions.push({ label: 'بطاقة الدفعة', href: `/maintenance#maintenance-payment-${item.paymentId}` })
  }

  if (item.maintenanceRequestId) {
    actions.push({ label: 'طلب الصيانة', href: `/maintenance#maintenance-request-${item.maintenanceRequestId}` })
  }

  return actions
}

export async function MaintenanceRequestsDashboard() {
  const data = await getMaintenanceDashboardData()
  const operationalAlerts = [
    ...data.maintenanceRequests
      .filter((request) => request.status !== 'COMPLETED' && request.status !== 'CANCELLED')
      .slice(0, 3)
      .map((request) => ({
        id: `maintenance-alert-${request.id}`,
        severity: request.priority === 'URGENT' ? 'high' as const : 'medium' as const,
        title: request.priority === 'URGENT' ? `طلب صيانة عاجل: ${request.tenant.fullName}` : `طلب صيانة يحتاج متابعة: ${request.tenant.fullName}`,
        description: `${request.title}${request.property?.title ? ` - ${request.property.title}` : ''}`,
        actions: [
          { label: 'طلب الصيانة', href: `/maintenance#maintenance-request-${request.id}` },
          { label: 'العقد بفلتر جاهز', href: `/contracts?query=${encodeURIComponent(request.tenant.fullName)}#contract-card-${request.contract.id}` },
        ],
      })),
    ...data.recentPayments
      .filter((payment) => payment.status === 'OVERDUE' || payment.status === 'PENDING')
      .slice(0, 3)
      .map((payment) => ({
        id: `payment-alert-${payment.id}`,
        severity: payment.status === 'OVERDUE' ? 'high' as const : 'medium' as const,
        title: payment.status === 'OVERDUE' ? `دفعة متأخرة: ${payment.tenant.fullName}` : `دفعة تحتاج متابعة: ${payment.tenant.fullName}`,
        description: `${payment.notes || 'دفعة إيجار'} - ${Number(payment.amount)} دولار`,
        actions: [
          { label: 'الدفعات المعلقة', href: `/contracts?outstanding=${payment.status === 'OVERDUE' ? 'overdue-only' : 'with-outstanding'}&query=${encodeURIComponent(payment.tenant.fullName)}` },
          { label: 'بطاقة الدفعة', href: `/maintenance#maintenance-payment-${payment.id}` },
        ],
      })),
  ].slice(0, 5)

  return (
    <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <article id="maintenance-requests" className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] scroll-mt-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
              <LifeBuoy className="h-4 w-4" />
              لوحة الصيانة
            </div>
            <h2 className="section-title mt-4 text-xl font-bold text-slate-950 sm:text-2xl">طلبات الصيانة الجارية</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              راجع الحالة الحالية، حدّث الموعد إذا لزم، ثم احفظ التغيير.
            </p>
          </div>

          <form action={dispatchOperationalNotificationsActionWithFormData}>
            <input type="hidden" name="redirectTo" value="/maintenance?info=notifications-dispatched" />
            <button type="submit" className="btn-base btn-primary">
              إرسال الإشعارات
              <Mail className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/maintenance#maintenance-requests" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">طلبات مفتوحة</div>
            <div className="mt-2 text-3xl font-bold text-slate-950">{data.maintenanceRequests.length}</div>
            <div className="mt-2 text-sm text-slate-600">عرض الطلبات الحالية</div>
          </Link>
          <Link href="/contracts?outstanding=overdue-only" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">دفعات متأخرة</div>
            <div className="mt-2 text-3xl font-bold text-slate-950">{data.recentPayments.filter((payment) => payment.status === 'OVERDUE').length}</div>
            <div className="mt-2 text-sm text-slate-600">عرض المتأخرات</div>
          </Link>
          <Link href="/maintenance#maintenance-notification-log" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">سجل الإرسال</div>
            <div className="mt-2 text-3xl font-bold text-slate-950">{data.notificationLogs.length}</div>
            <div className="mt-2 text-sm text-slate-600">مراجعة الرسائل الأخيرة</div>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">1. ابدأ بالطلبات الجديدة أو العاجلة.</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">2. حدّث الحالة أو الموعد من نفس البطاقة.</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">3. بعد ذلك راجع الدفعات وسجل الإشعار.</div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-slate-950">
            <CircleAlert className="h-5 w-5 text-emerald-700" />
            <h3 className="text-lg font-bold">ما يحتاج انتباهاً الآن</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {operationalAlerts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                لا توجد حالات عاجلة الآن.
              </div>
            ) : (
              operationalAlerts.map((alert) => (
                <div key={alert.id} className={`rounded-2xl border p-4 ${alertTone(alert.severity)}`}>
                  <div className="font-semibold">{alert.title}</div>
                  <div className="mt-2 text-sm leading-7">{alert.description}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {alert.actions.map((action) => (
                      <Link key={`${alert.id}-${action.href}`} href={action.href} className="btn-base btn-secondary btn-sm">
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.maintenanceRequests.map((request) => (
            <div id={`maintenance-request-${request.id}`} key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 scroll-mt-28">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-950">
                    <Wrench className="h-4 w-4 text-emerald-700" />
                    {request.title}
                  </div>
                  <div className="mt-2 text-sm text-[var(--muted)]">{request.tenant.fullName} - {request.property?.title || 'بدون عقار'}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-700">{request.description}</div>
                </div>

                <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 lg:min-w-[16rem] lg:w-auto">
                  <div className="text-xs font-semibold text-[var(--muted)]">الحالة الحالية</div>
                  <div className="mt-1 font-bold text-slate-950">{maintenanceStatusLabel(request.status)}</div>
                  <div className="mt-2 text-xs text-[var(--muted)]">تم الإنشاء: {arabicDate.format(new Date(request.createdAt))}</div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/contracts#contract-card-${request.contract.id}`} className="btn-base btn-secondary btn-sm">
                      فتح العقد
                    </Link>
                    <Link href="/maintenance#maintenance-payments" className="btn-base btn-secondary btn-sm">
                      افتح الدفعات
                    </Link>
                  </div>

                  <form action={updateMaintenanceRequestStatusAction} className="mt-4 space-y-3">
                    <input type="hidden" name="requestId" value={request.id} />
                    <select name="status" defaultValue={request.status} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                      <option value="NEW">جديد</option>
                      <option value="SCHEDULED">مجدول</option>
                      <option value="IN_PROGRESS">قيد التنفيذ</option>
                      <option value="COMPLETED">مغلق</option>
                      <option value="CANCELLED">ملغي</option>
                    </select>
                    <input
                      name="scheduledFor"
                      type="datetime-local"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    />
                    <button type="submit" className="btn-base btn-secondary w-full">حفظ الحالة</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-6">
        <article id="maintenance-payments" className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)] scroll-mt-28">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">الدفعات التي تحتاج متابعة</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.recentPayments.map((payment) => (
              <div id={`maintenance-payment-${payment.id}`} key={payment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 scroll-mt-28">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{payment.tenant.fullName}</div>
                    <div className="text-xs text-white/60">{payment.property?.title || 'بدون عقار'} - {payment.notes || 'دفعة إيجار'}</div>
                  </div>
                  <div className="text-sm font-bold text-white">{Number(payment.amount)} دولار</div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/60">
                  <span>{paymentStatusLabel(payment.status)}</span>
                  <span>{arabicDate.format(new Date(payment.dueDate))}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/contracts?query=${encodeURIComponent(payment.tenant.fullName)}`} className="btn-base btn-secondary btn-sm">
                    فتح العقود
                  </Link>
                  <Link href="/maintenance#maintenance-requests" className="btn-base btn-secondary btn-sm">
                    الطلبات
                  </Link>
                </div>
                {payment.status !== 'PAID' ? (
                  <form action={markPaymentAsPaidAction} className="mt-3">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <button type="submit" className="btn-base btn-secondary w-full">
                      تأكيد الدفعة
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article id="maintenance-notification-log" className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] scroll-mt-28">
          <div className="flex items-center gap-2 text-slate-950">
            <Mail className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">سجل الإشعارات</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.notificationLogs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                لا يوجد سجل بعد. فعّل SMTP ثم استخدم زر الإشعارات لتوليد رسائل فعلية.
              </div>
            ) : (
              data.notificationLogs.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-950">{item.subject || item.template}</div>
                    <div className="text-xs text-[var(--muted)]">{item.status}</div>
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted)]">{item.recipient}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-700">{item.bodyPreview || 'لا يوجد معاينة.'}</div>
                  {item.errorMessage ? <div className="mt-2 text-xs text-rose-700">{item.errorMessage}</div> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {buildLogActions(item).map((action) => (
                      <Link key={`${item.id}-${action.href}`} href={action.href} className="btn-base btn-secondary btn-sm">
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  )
}