import Link from 'next/link'
import { AlertTriangle, ArrowLeft, CheckCircle2, DatabaseZap, Search, ShieldCheck, XCircle } from 'lucide-react'
import type { AuthAuditEvent, AuthAuditOutcome, AuthAuditScope } from '@/lib/auth-audit'

type AuthAuditLogDashboardProps = {
  events: AuthAuditEvent[]
  filters: {
    scope: 'all' | AuthAuditScope
    outcome: 'all' | AuthAuditOutcome
    query: string
  }
  storageKind: 'file' | 'redis'
  totalCount: number
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ar-SY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function scopeLabel(scope: AuthAuditScope) {
  return scope === 'owner-login' ? 'دخول المكتب' : 'دخول المستأجر'
}

function scopeTone(scope: AuthAuditScope) {
  return scope === 'owner-login'
    ? 'bg-sky-500/10 text-sky-900'
    : 'bg-violet-500/10 text-violet-900'
}

function outcomeLabel(outcome: AuthAuditOutcome) {
  switch (outcome) {
    case 'SUCCESS':
      return 'ناجح'
    case 'BLOCKED':
      return 'محظور'
    default:
      return 'فشل'
  }
}

function outcomeTone(outcome: AuthAuditOutcome) {
  switch (outcome) {
    case 'SUCCESS':
      return 'bg-emerald-600/10 text-emerald-900'
    case 'BLOCKED':
      return 'bg-amber-500/10 text-amber-950'
    default:
      return 'bg-rose-500/10 text-rose-900'
  }
}

function storageLabel(storageKind: 'file' | 'redis') {
  return storageKind === 'redis' ? 'Redis REST' : 'File JSON'
}

export function AuthAuditLogDashboard({ events, filters, storageKind, totalCount }: AuthAuditLogDashboardProps) {
  const successCount = events.filter((event) => event.outcome === 'SUCCESS').length
  const blockedCount = events.filter((event) => event.outcome === 'BLOCKED').length
  const failureCount = events.filter((event) => event.outcome === 'FAILURE').length

  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              سجل محاولات الدخول الأمنية
            </div>
            <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
              <span className="hero-line">متابعة الدخول الناجح والمحظور والفاشل</span>
              <span className="hero-line mt-2 sm:mt-3">من شاشة تشغيل داخلية واحدة</span>
            </h1>
            <p className="hero-subtitle mt-3 max-w-2xl">
              استخدم هذه الصفحة لمراجعة النشاط الأخير، فرز النتائج حسب نوع الدخول أو النتيجة، ومتابعة مستوى الحماية واستقرار محاولات الدخول.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-base btn-secondary">
              العودة إلى اللوحة
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/auth?mode=signin&role=manager" className="btn-base btn-secondary">
              اختبار دخول المكتب
              <ShieldCheck className="h-4 w-4" />
            </Link>
            <Link href="/auth?mode=signin&role=tenant" className="btn-base btn-secondary">
              اختبار دخول المستأجر
              <ShieldCheck className="h-4 w-4" />
            </Link>
            <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
              <div className="flex items-center gap-2">
                <DatabaseZap className="h-4 w-4" />
                تخزين rate limit الحالي: {storageLabel(storageKind)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">إجمالي النتائج بعد الفلترة</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{events.length}</div>
          <div className="mt-2 text-sm text-slate-500">من أصل {totalCount} حدث حديث</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">محاولات ناجحة</div>
          <div className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-950">
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            {successCount}
          </div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">محاولات محظورة</div>
          <div className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-950">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            {blockedCount}
          </div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">محاولات فاشلة</div>
          <div className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-950">
            <XCircle className="h-6 w-6 text-rose-700" />
            {failureCount}
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex items-center gap-2 text-slate-950">
          <Search className="h-5 w-5 text-emerald-700" />
          <h2 className="section-title text-xl font-bold sm:text-2xl">فلترة السجل</h2>
        </div>
        <p className="body-soft mt-3 text-sm text-[var(--muted)]">
          صفِّ النتائج حسب نوع تسجيل الدخول والنتيجة، أو ابحث داخل السبب أو الـ IP أو المعرف المقنّع لتصل بسرعة إلى النمط المطلوب.
        </p>

        <form action="/dashboard/auth-audit" className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_16rem_16rem_auto_auto]">
          <div>
            <label htmlFor="query" className="mb-1 block text-sm font-semibold text-slate-700">بحث</label>
            <input
              id="query"
              name="query"
              defaultValue={filters.query}
              placeholder="سبب، IP، أو معرف مقنّع"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            />
          </div>

          <div>
            <label htmlFor="scope" className="mb-1 block text-sm font-semibold text-slate-700">نوع الدخول</label>
            <select
              id="scope"
              name="scope"
              defaultValue={filters.scope}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            >
              <option value="all">الكل</option>
              <option value="owner-login">دخول المكتب</option>
              <option value="tenant-login">دخول المستأجر</option>
            </select>
          </div>

          <div>
            <label htmlFor="outcome" className="mb-1 block text-sm font-semibold text-slate-700">النتيجة</label>
            <select
              id="outcome"
              name="outcome"
              defaultValue={filters.outcome}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
            >
              <option value="all">الكل</option>
              <option value="SUCCESS">ناجح</option>
              <option value="BLOCKED">محظور</option>
              <option value="FAILURE">فشل</option>
            </select>
          </div>

          <button type="submit" className="btn-base btn-primary self-end">تطبيق الفلاتر</button>
          <Link href="/dashboard/auth-audit" className="btn-base btn-secondary self-end">إعادة ضبط</Link>
        </form>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">آخر الأحداث الأمنية</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              يعرض أحدث المحاولات المسجلة مع السبب ومدة الانتظار عند وجود حظر مؤقت.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            آخر {totalCount} حدث محفوظ
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {events.length > 0 ? events.map((event) => (
            <article key={event.id} className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${scopeTone(event.scope)}`}>
                      {scopeLabel(event.scope)}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${outcomeTone(event.outcome)}`}>
                      {outcomeLabel(event.outcome)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">{event.reason}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{formatDateTime(event.createdAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
                  {event.identifierLabel}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                  IP: <span className="font-bold text-slate-950">{event.clientIp}</span>
                </div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                  Retry After: <span className="font-bold text-slate-950">{event.retryAfterSeconds ? `${event.retryAfterSeconds} ثانية` : 'لا يوجد'}</span>
                </div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                  Hash: <span className="font-bold text-slate-950">{event.identifierHash.slice(0, 12)}...</span>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--surface)] p-8 text-center">
              <h3 className="text-xl font-bold text-slate-950">لا توجد نتائج مطابقة الآن</h3>
              <p className="body-soft mt-3 text-sm text-[var(--muted)]">
                غيّر الفلاتر أو ابدأ بمحاولة دخول جديدة لتظهر الأحداث هنا تلقائياً.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}