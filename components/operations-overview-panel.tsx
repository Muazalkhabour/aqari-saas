import Link from 'next/link'
import { BellRing, CircleAlert, CreditCard, FileSpreadsheet, FileText, LifeBuoy, Palette, Printer, Send, ShieldCheck, Wallet } from 'lucide-react'
import { dispatchOperationalNotificationsActionWithFormData } from '@/app/actions/rental-operations'
import { LiveUnreadNotificationsBadge } from '@/components/live-unread-notifications-badge'
import { getUnreadInternalNotificationsCount } from '@/lib/contract-activity'
import { getOperationsDashboardData } from '@/lib/rental-db'
import { getReportingDashboardData } from '@/lib/reporting'
import { OperationsRevenueChart } from '@/components/operations-revenue-chart'

const arabicDate = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium' })

function severityClass(severity: string) {
  if (severity === 'high') {
    return 'border-rose-200 bg-rose-50 text-rose-900'
  }

  if (severity === 'medium') {
    return 'border-amber-200 bg-amber-50 text-amber-950'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-950'
}

function statusLabel(status: string) {
  switch (status) {
    case 'SENT':
      return 'تم الإرسال'
    case 'FAILED':
      return 'فشل الإرسال'
    case 'SKIPPED':
      return 'تم التخطي'
    default:
      return 'قيد المعالجة'
  }
}

function buildLogActions(item: Awaited<ReturnType<typeof getOperationsDashboardData>>['notificationLogs'][number]) {
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
  }

  if (item.maintenanceRequestId) {
    actions.push({ label: 'طلب الصيانة', href: `/maintenance#maintenance-request-${item.maintenanceRequestId}` })
  }

  return actions
}

function buildOperationalNotificationActions(notification: Awaited<ReturnType<typeof getOperationsDashboardData>>['notifications'][number]) {
  const actions = [] as Array<{ label: string; href: string }>
  const params = new URLSearchParams()

  if (notification.tenantName) {
    params.set('query', notification.tenantName)
  }

  if (notification.type === 'contract-expiry' && notification.contractId) {
    actions.push({
      label: 'العقد بفلتر جاهز',
      href: `${params.toString() ? `/contracts?${params.toString()}` : '/contracts'}#contract-card-${notification.contractId}`,
    })
    actions.push({
      label: 'سجل العقد',
      href: `${params.toString() ? `/contracts?${params.toString()}` : '/contracts'}#contract-history-${notification.contractId}`,
    })
  }

  if ((notification.type === 'payment-overdue' || notification.type === 'payment-due') && notification.paymentId) {
    params.set('outstanding', notification.type === 'payment-overdue' ? 'overdue-only' : 'with-outstanding')
    actions.push({
      label: 'الدفعات المعلقة',
      href: `/contracts?${params.toString()}`,
    })
    actions.push({
      label: 'بطاقة الدفعة',
      href: `/maintenance#maintenance-payment-${notification.paymentId}`,
    })
  }

  if (notification.type === 'maintenance' && notification.maintenanceRequestId) {
    actions.push({
      label: 'طلب الصيانة',
      href: `/maintenance#maintenance-request-${notification.maintenanceRequestId}`,
    })
  }

  return actions
}

export async function OperationsOverviewPanel() {
  const data = await getOperationsDashboardData()
  const reporting = await getReportingDashboardData()
  const unreadNotificationsCount = await getUnreadInternalNotificationsCount()
  const urgentCount = data.notifications.filter((item) => item.severity === 'high').length
  const overduePaymentsCount = data.payments.filter((payment) => payment.status === 'OVERDUE').length
  const pendingPaymentsCount = data.payments.filter((payment) => payment.status === 'PENDING').length

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              تشغيل فعلي من Prisma
            </div>
            <h2 className="section-title mt-4 text-xl font-bold text-slate-950 sm:text-2xl">العقود والدفعات والتنبيهات التشغيلية</h2>
            <p className="body-soft mt-2 max-w-2xl text-sm text-[var(--muted)]">
              هذه اللوحة تعتمد الآن على بيانات قاعدة البيانات، مع عقود فعلية، دفعات مستحقة، وسجل إشعارات بريدية.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[0_12px_28px_rgba(16,42,67,0.05)]">
            <div className="text-sm font-semibold text-slate-900">إجراءات تشغيل سريعة</div>
            <div className="mt-1 text-sm leading-7 text-slate-600">رتبنا الروابط الأكثر استخدامًا داخل لوحة مستقلة حتى لا تتزاحم مع عنوان القسم.</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <form action={dispatchOperationalNotificationsActionWithFormData}>
                <input type="hidden" name="redirectTo" value="/dashboard" />
                <button type="submit" className="btn-base btn-primary w-full justify-between">
                  إرسال التذكيرات البريدية
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <Link href="/maintenance" className="btn-base btn-secondary w-full justify-between">
                لوحة الصيانة
                <LifeBuoy className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/auth?mode=signin&role=tenant" className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3 text-slate-950">
                  <CreditCard className="h-5 w-5 text-emerald-800" />
                  <span className="text-sm font-bold">دخول المستأجر</span>
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">فتح البوابة الخاصة بالدفعات والعقد.</div>
              </Link>
              <Link href="/office" className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3 text-slate-950">
                  <Palette className="h-5 w-5 text-emerald-800" />
                  <span className="text-sm font-bold">إعدادات المكتب</span>
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">تحديث البيانات والهوية التشغيلية للمكتب.</div>
              </Link>
              <Link href="/contracts" className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3 text-slate-950">
                  <FileText className="h-5 w-5 text-emerald-800" />
                  <span className="text-sm font-bold">إدارة العقود</span>
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">مراجعة العقود الحالية والتجديدات والمتأخرات.</div>
              </Link>
              <Link href="/notifications" className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3 text-slate-950">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">الإشعارات الداخلية</span>
                  </div>
                  <LiveUnreadNotificationsBadge initialCount={unreadNotificationsCount} />
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">الوصول إلى التنبيهات الفعلية دون تزاحم بصري.</div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Link href="/contracts?lifecycle=ending-soon" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">عقود تقترب من الانتهاء</div>
            <div className="stat-value mt-3 text-3xl font-bold text-slate-950">{data.contracts.length}</div>
            <div className="mt-2 text-sm text-slate-600">فتح جميع العقود القريبة</div>
          </Link>
          <Link href="/contracts?outstanding=with-outstanding" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">دفعات تحتاج متابعة</div>
            <div className="stat-value mt-3 text-3xl font-bold text-slate-950">{data.payments.length}</div>
            <div className="mt-2 text-sm text-slate-600">فتح كل الدفعات غير المغلقة</div>
          </Link>
          <Link href="/maintenance#maintenance-requests" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">طلبات صيانة مفتوحة</div>
            <div className="stat-value mt-3 text-3xl font-bold text-slate-950">{data.maintenanceRequests.length}</div>
            <div className="mt-2 text-sm text-slate-600">الانتقال إلى لوحة الصيانة</div>
          </Link>
          <Link href="/notifications?tab=unread" className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white">
            <div className="stat-label">تنبيهات عاجلة</div>
            <div className="stat-value mt-3 text-3xl font-bold text-slate-950">{urgentCount}</div>
            <div className="mt-2 text-sm text-slate-600">فتح غير المقروء مباشرة</div>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/contracts?outstanding=overdue-only" className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <div className="stat-label">إجراء جماعي: المتأخرات</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{overduePaymentsCount}</div>
            <div className="mt-2 text-sm text-slate-600">فتح كل الدفعات المتأخرة فقط</div>
          </Link>
          <Link href="/contracts?outstanding=with-outstanding" className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <div className="stat-label">إجراء جماعي: قيد التحصيل</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{pendingPaymentsCount}</div>
            <div className="mt-2 text-sm text-slate-600">فتح جميع الدفعات التي تحتاج متابعة</div>
          </Link>
          <Link href="/maintenance#maintenance-notification-log" className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <div className="stat-label">إجراء جماعي: سجل الإرسال</div>
            <div className="mt-2 text-2xl font-bold text-slate-950">{data.notificationLogs.length}</div>
            <div className="mt-2 text-sm text-slate-600">مراجعة جميع الرسائل والروابط الذكية</div>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(240,253,250,0.9))] p-5 shadow-[0_20px_50px_rgba(16,42,67,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                  <Wallet className="h-3.5 w-3.5" />
                  لوحة الأرباح الشهرية
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-950">إيرادات المكتب خلال آخر 6 أشهر</h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">الرسم يوضح الفرق بين المتوقّع والمحصّل فعلياً والمبالغ التي ما زالت قيد التحصيل.</p>
              </div>

              <a href="/api/reports/monthly-revenue" className="btn-base btn-secondary">
                تصدير Excel
                <FileSpreadsheet className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <div className="stat-label">المحصّل</div>
                <div className="mt-2 text-2xl font-bold text-slate-950">{new Intl.NumberFormat('en-US').format(reporting.collectionSummary.collected)} $</div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <div className="stat-label">قيد التحصيل</div>
                <div className="mt-2 text-2xl font-bold text-slate-950">{new Intl.NumberFormat('en-US').format(reporting.collectionSummary.pending)} $</div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <div className="stat-label">متأخرات</div>
                <div className="mt-2 text-2xl font-bold text-slate-950">{new Intl.NumberFormat('en-US').format(reporting.collectionSummary.overdue)} $</div>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/70 bg-white/88 p-3">
              <OperationsRevenueChart monthlyRevenue={reporting.monthlyRevenue} />
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_20px_50px_rgba(16,42,67,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-900">
                  <Printer className="h-3.5 w-3.5" />
                  طباعة العقود
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-950">نسخ عقود جاهزة للحفظ PDF</h3>
                <p className="mt-2 text-sm text-slate-600">يفتح زر العقد صفحة طباعة نظيفة ليحفظها المكتب مباشرة من المتصفح كملف PDF يحمل هوية مكتبه.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {reporting.contracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-950">{contract.tenantName}</div>
                      <div className="mt-1 text-xs text-slate-600">{contract.propertyTitle} - الوحدة {contract.unitNumber}</div>
                    </div>
                    <a
                      href={`/contracts/${contract.id}/print?autoprint=1`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-base btn-primary btn-sm"
                    >
                      PDF العقد
                      <Printer className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="mt-3 text-xs text-slate-600">ينتهي في {arabicDate.format(new Date(contract.endDate))}</div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-3">
          {data.notifications.map((notification) => (
            <div key={notification.id} className={`rounded-3xl border p-4 ${severityClass(notification.severity)}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <CircleAlert className="h-4 w-4" />
                  {notification.title}
                </div>
                <div className="text-xs font-semibold">{arabicDate.format(new Date(notification.dueDate))}</div>
              </div>
              <p className="mt-2 text-sm leading-7">{notification.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {buildOperationalNotificationActions(notification).map((action) => (
                  <Link key={`${notification.id}-${action.href}`} href={action.href} className="btn-base btn-secondary btn-sm">
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(241,245,249,0.92),rgba(255,255,255,0.96))] p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-700/10 p-3 text-emerald-800">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="section-title text-xl font-bold sm:text-2xl">آخر الإشعارات الفعلية</h2>
            <p className="mt-1 text-sm text-slate-600">سجل البريد والإشعارات الأخيرة بتنسيق أخف وأسهل في المتابعة.</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {data.notificationLogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm leading-7 text-slate-600 shadow-[0_10px_24px_rgba(16,42,67,0.05)]">
              لم يتم إرسال أي بريد بعد. عند تفعيل SMTP ستظهر النتائج هنا مباشرة.
            </div>
          ) : (
            data.notificationLogs.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(16,42,67,0.05)]">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="font-semibold text-slate-950">{item.subject || item.template}</div>
                  <div className="text-slate-500">{statusLabel(item.status)}</div>
                </div>
                <div className="mt-2 text-xs text-slate-500">إلى: {item.recipient}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">{item.bodyPreview || 'لا يوجد معاينة مختصرة.'}</div>
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
    </section>
  )
}