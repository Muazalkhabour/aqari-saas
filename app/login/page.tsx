import Link from 'next/link'
import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { signIn } from '@/app/login/actions'
import { hasSupabaseCredentials, isDevelopmentDemoModeEnabled } from '@/lib/env'
import { audienceNeeds, governorates } from '@/lib/syrian-real-estate-demo'

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatRetryAfter(value: string | string[] | undefined) {
  const seconds = Number(readParam(value) || 0)
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'بعد قليل'
  }

  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `بعد ${minutes} دقيقة`
}

function readToast(params?: Record<string, string | string[] | undefined>) {
  const error = readParam(params?.error)
  const canUseDemoMode = isDevelopmentDemoModeEnabled()
  const retryAfterLabel = formatRetryAfter(params?.retryAfter)

  if (error === 'missing-fields') {
    return {
      message: 'أدخل البريد الإلكتروني وكلمة المرور قبل محاولة تسجيل الدخول.',
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى نموذج الدخول', href: '/login#owner-login-form' }],
    }
  }

  if (error === 'invalid-credentials') {
    return {
      message: canUseDemoMode
        ? 'بيانات دخول المكتب غير صحيحة. راجع الحساب أو استخدم وضع العرض مؤقتاً.'
        : 'بيانات دخول المكتب غير صحيحة. راجع الحساب أو كلمة المرور ثم أعد المحاولة.',
      tone: 'warning' as const,
      actions: canUseDemoMode
        ? [
            { label: 'مراجعة نموذج الدخول', href: '/login#owner-login-form' },
            { label: 'فتح النسخة التجريبية', href: '/dashboard?mode=demo' },
          ]
        : [{ label: 'مراجعة نموذج الدخول', href: '/login#owner-login-form' }],
    }
  }

  if (error === 'auth-unavailable') {
    return {
      message: 'خدمة دخول المكتب غير مهيأة في هذه البيئة. تم تعطيل وضع العرض خارج development.',
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى نموذج الدخول', href: '/login#owner-login-form' }],
    }
  }

  if (error === 'too-many-attempts') {
    return {
      message: `تم إيقاف محاولات دخول المكتب مؤقتاً بسبب كثرة المحاولات الفاشلة. حاول ${retryAfterLabel}.`,
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى نموذج الدخول', href: '/login#owner-login-form' }],
    }
  }

  return null
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const isSupabaseReady = hasSupabaseCredentials()
  const canUseDemoMode = isDevelopmentDemoModeEnabled()
  const params = searchParams ? await searchParams : undefined
  const toast = readToast(params)
  const emailValue = readParam(params?.email) || ''

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}

        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[var(--surface)] p-8 shadow-[0_24px_80px_rgba(16,42,67,0.14)] backdrop-blur xl:p-10">
          <div className="absolute left-0 top-0 h-56 w-56 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-600/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative space-y-8">
            <div className="eyebrow-text inline-flex items-center rounded-full border border-emerald-700/15 bg-emerald-700/8 px-4 py-2 text-emerald-900">
              منصة عقارية سورية للمكاتب والمستخدمين
            </div>

            <div className="space-y-4">
              <h1 className="hero-title max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">دخول أبسط إلى منصة <span className="hero-highlight">عقارية</span></span>
                <span className="hero-line mt-2 sm:mt-3">تعرض <span className="hero-highlight">عقارات سوريا</span> بوضوح أكبر</span>
              </h1>
              <p className="hero-subtitle max-w-xl">
                المنصة تعرض عقارات موجهة للسوق السوري، مع تقسيم واضح بين البيع والإيجار ومحتوى تجريبي من المحافظات الأساسية.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {governorates.slice(0, 8).map((governorate) => (
                <span key={governorate} className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-sm text-slate-700">
                  {governorate}
                </span>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                <div className="stat-label">إعلانات الإيجار</div>
                <div className="stat-value mt-3 text-3xl font-bold text-slate-950">94</div>
              </div>
              <div className="rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                <div className="stat-label">إعلانات البيع</div>
                <div className="stat-value mt-3 text-3xl font-bold text-slate-950">68</div>
              </div>
              <div className="rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                <div className="stat-label">محافظات مفعلة</div>
                <div className="stat-value mt-3 text-3xl font-bold text-slate-950">14</div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-slate-900/6 bg-slate-950 p-6 text-white sm:grid-cols-2">
              <div>
                <div className="text-sm text-white/60">حالة الربط الحالية</div>
                <div className="mt-2 text-2xl font-bold">
                  {isSupabaseReady ? 'Supabase جاهز' : canUseDemoMode ? 'وضع العرض مفعل' : 'الدخول غير مهيأ'}
                </div>
              </div>
              <div className="body-soft text-sm text-white/75">
                {isSupabaseReady
                  ? 'يمكنك تسجيل الدخول فعلياً، مع حماية لوحة التحكم عبر Proxy وجاهزية لإدارة المحتوى العقاري.'
                  : canUseDemoMode
                    ? 'يمكنك معاينة المنصة الآن بأمان، ثم تفعيل الربط لاحقاً عند استكمال مفاتيح Supabase.'
                    : 'هذه البيئة لا تسمح بوضع العرض. جهّز مفاتيح Supabase لتفعيل دخول المكتب بشكل صحيح.'}
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/50 bg-white/55 p-4">
              {audienceNeeds.slice(0, 3).map((need) => (
                <div key={need} className="text-sm leading-7 text-slate-700">
                  • {need}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_24px_80px_rgba(16,42,67,0.12)] backdrop-blur">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">ع</div>
            <h2 className="section-title text-2xl font-bold text-slate-950 sm:text-3xl">تسجيل الدخول</h2>
            <p className="body-soft mt-2 text-[var(--muted)]">
              {canUseDemoMode ? 'ادخل للنظام أو استعرض النسخة التجريبية بسرعة' : 'ادخل للنظام بعد تهيئة ربط Supabase لهذه البيئة'}
            </p>
          </div>

          <form id="owner-login-form" className="mt-8 space-y-6 scroll-mt-28" action={signIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="field-label mb-1 block">البريد الإلكتروني</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={emailValue}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  placeholder="name@company.com"
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

            <button
              type="submit"
              className="btn-base btn-primary w-full"
            >
              دخول للنظام
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            {isSupabaseReady
              ? 'المفاتيح مهيأة. إذا فشل الدخول، فغالباً السبب من بيانات المستخدم أو إعدادات Supabase Auth.'
              : canUseDemoMode
                ? 'تم اكتشاف قيم ناقصة أو تجريبية لـ Supabase، لذلك فُعّل وضع عرض آمن بدلاً من تعطيل الموقع.'
                : 'تم اكتشاف غياب مفاتيح Supabase. وضع العرض مغلق خارج development، لذلك يجب إكمال الإعداد قبل دخول المكتب.'}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="mb-2 text-xs text-slate-400">{canUseDemoMode ? 'للتجربة السريعة' : 'مسارات إضافية'}</p>
            <div className="flex flex-col items-center gap-2">
              {canUseDemoMode ? (
                <Link href="/dashboard?mode=demo" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">
                  فتح لوحة العقارات التجريبية
                </Link>
              ) : null}
              <Link href="/tenant-login" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
                دخول المستأجرين المستقل
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
