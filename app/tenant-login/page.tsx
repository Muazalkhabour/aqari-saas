import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CreditCard, KeyRound, ShieldCheck } from 'lucide-react'
import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { tenantSignInAction } from '@/app/tenant-login/actions'
import { isDevelopmentDemoModeEnabled } from '@/lib/env'
import { getOperationsDashboardData } from '@/lib/rental-db'
import { getTenantSession } from '@/lib/tenant-session'

export const dynamic = 'force-dynamic'

type TenantLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function formatRetryAfter(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const seconds = Number(rawValue || 0)
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'بعد قليل'
  }

  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `بعد ${minutes} دقيقة`
}

function getErrorToast(value: string | string[] | undefined, retryAfterValue?: string | string[] | undefined) {
  const error = Array.isArray(value) ? value[0] : value
  const canUseDemoMode = isDevelopmentDemoModeEnabled()

  switch (error) {
    case 'missing-fields':
      return {
        message: 'أدخل البريد الإلكتروني وكلمة المرور قبل تسجيل الدخول إلى البوابة.',
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى نموذج الدخول', href: '/tenant-login#tenant-login-form' }],
      }
    case 'invalid-credentials':
      return {
        message: canUseDemoMode
          ? 'بيانات دخول المستأجر غير صحيحة. يمكنك مراجعة الحسابات التجريبية الجاهزة في نفس الصفحة.'
          : 'بيانات دخول المستأجر غير صحيحة. راجع البريد الإلكتروني أو كلمة المرور ثم أعد المحاولة.',
        tone: 'warning' as const,
        actions: canUseDemoMode
          ? [
              { label: 'العودة إلى النموذج', href: '/tenant-login#tenant-login-form' },
              { label: 'عرض الحسابات التجريبية', href: '/tenant-login#tenant-demo-accounts' },
            ]
          : [{ label: 'العودة إلى النموذج', href: '/tenant-login#tenant-login-form' }],
      }
    case 'session-unavailable':
      return {
        message: 'تعذر إنشاء جلسة المستأجر حالياً. تمت إزالة fallback غير الآمن، لذا يلزم توفر تخزين الجلسات أولاً.',
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى النموذج', href: '/tenant-login#tenant-login-form' }],
      }
    case 'too-many-attempts':
      return {
        message: `تم إيقاف محاولات دخول المستأجر مؤقتاً بسبب كثرة المحاولات الفاشلة. حاول ${formatRetryAfter(retryAfterValue)}.`,
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى النموذج', href: '/tenant-login#tenant-login-form' }],
      }
    default:
      return null
  }
}

export default async function TenantLoginPage({ searchParams }: TenantLoginPageProps) {
  const session = await getTenantSession()

  if (session?.tenant?.id) {
    redirect('/tenant-portal')
  }

  const params = searchParams ? await searchParams : undefined
  const toast = getErrorToast(params?.error, params?.retryAfter)
  const portalEmailValue = (Array.isArray(params?.portalEmail) ? params?.portalEmail[0] : params?.portalEmail) || ''
  const canUseDemoMode = isDevelopmentDemoModeEnabled()
  const data = await getOperationsDashboardData()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}

        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[var(--surface)] p-8 shadow-[0_24px_80px_rgba(16,42,67,0.14)] backdrop-blur xl:p-10">
          <div className="absolute left-0 top-0 h-56 w-56 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-600/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative space-y-8">
            <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-700/8 px-4 py-2 text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              دخول مستقل للمستأجرين
            </div>

            <div className="space-y-4">
              <h1 className="hero-title max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">بوابة مستأجر مع جلسة خاصة</span>
                <span className="hero-line mt-2 sm:mt-3">وعقود ودفعات وصيانة من قاعدة البيانات</span>
              </h1>
              <p className="hero-subtitle max-w-xl">
                هذه الصفحة منفصلة عن تسجيل دخول المكتب، وتخدم المستأجر مباشرة عبر حسابه الخاص في النظام.
              </p>
            </div>

            {canUseDemoMode ? (
              <div id="tenant-demo-accounts" className="grid gap-3 rounded-[28px] border border-white/50 bg-white/55 p-4 scroll-mt-28">
                {data.demoCredentials.map((credential) => (
                  <div key={credential.email} className="rounded-2xl border border-slate-200 bg-white/75 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-950">{credential.fullName}</div>
                    <div className="mt-1">{credential.email}</div>
                    <div className="mt-1">{credential.password}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/50 bg-white/55 p-4 text-sm leading-7 text-slate-700">
                الحسابات التجريبية مخفية خارج development. استخدم حسابات المستأجرين الفعلية فقط.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-base btn-secondary">
                لوحة التشغيل
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-base btn-secondary">
                دخول المكتب
                <CreditCard className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_24px_80px_rgba(16,42,67,0.12)] backdrop-blur">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">ع</div>
            <h2 className="section-title text-2xl font-bold text-slate-950 sm:text-3xl">تسجيل دخول المستأجر</h2>
            <p className="body-soft mt-2 text-[var(--muted)]">ادخل إلى عقدك ومدفوعاتك وطلبات الصيانة</p>
          </div>

          <form id="tenant-login-form" className="mt-8 space-y-6 scroll-mt-28" action={tenantSignInAction}>
            <div className="space-y-4">
              <div>
                <label htmlFor="portalEmail" className="field-label mb-1 block">البريد الإلكتروني</label>
                <input
                  id="portalEmail"
                  name="portalEmail"
                  type="email"
                  autoComplete="email"
                  defaultValue={portalEmailValue}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  placeholder="tenant@aqari.sy"
                />
              </div>
              <div>
                <label htmlFor="password" className="field-label mb-1 block">كلمة المرور</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn-base btn-primary w-full">
              دخول إلى البوابة
              <KeyRound className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
            {canUseDemoMode
              ? 'يمكنك استخدام الحسابات التجريبية في اللوحة اليسرى. كلمة المرور الموحدة هي Tenant@12345.'
              : 'استخدم حسابات المستأجرين الفعلية فقط. لم يعد هناك أي fallback تجريبي عام في هذه البيئة.'}
          </div>
        </section>
      </div>
    </div>
  )
}