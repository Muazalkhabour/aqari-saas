import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, BadgeCheck, BellRing, Building2, DoorOpen, FileText, KeyRound, LayoutDashboard, MapPinned, PlusCircle, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { signIn } from '@/app/login/actions'
import { tenantSignInAction } from '@/app/tenant-login/actions'
import { hasSupabaseCredentials } from '@/lib/env'

type AuthPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type AuthMode = 'signin' | 'register'
type AuthRole = 'manager' | 'owner' | 'tenant'

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeMode(value: string | undefined): AuthMode {
  return value === 'register' ? 'register' : 'signin'
}

function normalizeRole(value: string | undefined): AuthRole | null {
  if (value === 'manager' || value === 'owner' || value === 'tenant') {
    return value
  }

  return null
}

function formatRetryAfter(value: string | string[] | undefined) {
  const seconds = Number(readParam(value) || 0)
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'بعد قليل'
  }

  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return `بعد ${minutes} دقيقة`
}

function buildRoleHref(mode: AuthMode, role?: AuthRole | null) {
  if (!role) {
    return `/auth?mode=${mode}`
  }

  return `/auth?mode=${mode}&role=${role}`
}

function getModeLabel(mode: AuthMode) {
  return mode === 'signin' ? 'تسجيل الدخول' : 'بدء الاستخدام'
}

function getModeDescription(mode: AuthMode, role: AuthRole | null) {
  if (!role) {
    return mode === 'signin'
      ? 'اختر نوع الحساب أولاً، ثم سنعرض لك نموذج الدخول المناسب فقط.'
      : 'اختر نوع المستخدم أولاً، ثم سنعرض لك البداية الأنسب داخل المنصة.'
  }

  if (mode === 'signin' && role) {
    if (role === 'tenant') {
      return 'أدخل بيانات حسابك للوصول إلى العقد والدفعات والصيانة.'
    }

    if (role === 'owner') {
      return 'أدخل بياناتك للانتقال مباشرة إلى لوحة عقاراتك وطلباتك.'
    }

    return 'أدخل بيانات الإدارة للوصول إلى لوحة التشغيل والعقود والإشعارات.'
  }

  if (role === 'owner') {
    return 'ابدأ تجهيز الإعلان والصور أولاً، ثم أكمل إلى لوحة المالك من نفس المسار.'
  }

  if (role === 'tenant') {
    return 'حساب المستأجر يرتبط عادة بعقد فعال داخل النظام، لذلك هذا المسار يوضح لك متى تدخل ومتى يكفي التصفح.'
  }

  return 'حسابات الإدارة تُنشأ مركزياً عادة، لذلك هذا المسار يوضح متى تستخدم الدخول المباشر ومتى تعود للتصفح العام.'
}

function getRoleActionLabel(mode: AuthMode, role: AuthRole) {
  if (mode === 'signin') {
    if (role === 'manager') {
      return 'دخول الإدارة'
    }

    if (role === 'owner') {
      return 'دخول صاحب العقار'
    }

    return 'دخول المستأجر'
  }

  if (role === 'owner') {
    return 'ابدأ كصاحب عقار'
  }

  if (role === 'tenant') {
    return 'فهم مسار المستأجر'
  }

  return 'حسابات الإدارة'
}

function getRoleStepTitle(role: AuthRole | null) {
  if (!role) {
    return 'اختر الدور أولاً حتى لا نعرض لك مساراً لا يخصك.'
  }

  if (role === 'manager') {
    return 'اختر الإدارة إذا كنت تدير التشغيل والعقود والإشعارات.'
  }

  if (role === 'owner') {
    return 'اختر صاحب عقار إذا كنت تريد إضافة إعلان أو متابعة عقاراتك.'
  }

  return 'اختر مستأجر إذا كان لديك حساب مرتبط بعقدك أو دفعاتك داخل النظام.'
}

function readToast(params: Record<string, string | string[] | undefined> | undefined, role: AuthRole | null) {
  const error = readParam(params?.error)
  const retryAfterLabel = formatRetryAfter(params?.retryAfter)

  if (!error || !role) {
    return null
  }

  if (role === 'tenant') {
    if (error === 'missing-fields') {
      return {
        message: 'أدخل البريد الإلكتروني وكلمة المرور قبل محاولة الدخول إلى بوابة المستأجر.',
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى نموذج المستأجر', href: buildRoleHref('signin', 'tenant') }],
      }
    }

    if (error === 'invalid-credentials') {
      return {
        message: 'بيانات المستأجر غير صحيحة. راجع البريد الإلكتروني أو كلمة المرور ثم أعد المحاولة.',
        tone: 'warning' as const,
        actions: [{ label: 'العودة إلى نموذج المستأجر', href: buildRoleHref('signin', 'tenant') }],
      }
    }

    if (error === 'session-unavailable') {
      return {
        message: 'تعذر إكمال الدخول حالياً. حاول مرة أخرى بعد قليل أو تواصل مع فريق المنصة.',
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى نموذج المستأجر', href: buildRoleHref('signin', 'tenant') }],
      }
    }

    if (error === 'too-many-attempts') {
      return {
        message: `تم إيقاف محاولات دخول المستأجر مؤقتاً بسبب كثرة المحاولات الفاشلة. حاول ${retryAfterLabel}.`,
        tone: 'error' as const,
        actions: [{ label: 'العودة إلى نموذج المستأجر', href: buildRoleHref('signin', 'tenant') }],
      }
    }

    return null
  }

  if (error === 'missing-fields') {
    return {
      message: role === 'owner'
        ? 'أدخل البريد الإلكتروني وكلمة المرور قبل محاولة دخول حساب صاحب العقار.'
        : 'أدخل البريد الإلكتروني وكلمة المرور قبل محاولة دخول الإدارة.',
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى نموذج الدخول', href: buildRoleHref('signin', role) }],
    }
  }

  if (error === 'invalid-credentials') {
    return {
      message: role === 'owner'
        ? 'بيانات صاحب العقار غير صحيحة. راجع البريد الإلكتروني أو كلمة المرور ثم أعد المحاولة.'
        : 'بيانات الإدارة غير صحيحة. راجع الحساب أو كلمة المرور ثم أعد المحاولة.',
      tone: 'warning' as const,
      actions: [{ label: 'العودة إلى نموذج الدخول', href: buildRoleHref('signin', role) }],
    }
  }

  if (error === 'auth-unavailable') {
    return {
      message: 'خدمة الدخول غير متاحة حالياً. حاول لاحقاً أو تواصل مع فريق المنصة لتفعيل حسابك.',
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى بوابة الدخول', href: buildRoleHref('signin', role) }],
    }
  }

  if (error === 'too-many-attempts') {
    return {
      message: `تم إيقاف محاولات الدخول مؤقتاً بسبب كثرة المحاولات الفاشلة. حاول ${retryAfterLabel}.`,
      tone: 'error' as const,
      actions: [{ label: 'العودة إلى بوابة الدخول', href: buildRoleHref('signin', role) }],
    }
  }

  return null
}

const roleMeta: Record<AuthRole, {
  label: string
  badge: string
  title: string
  description: string
  icon: LucideIcon
}> = {
  manager: {
    label: 'مدير المنصة',
    badge: 'تشغيل وإدارة',
    title: 'ادخل إلى لوحة الإدارة والعقود والإشعارات',
    description: 'هذا المسار مخصص للمدير أو المكتب المسؤول عن تشغيل المنصة والعقارات والعقود وطلبات الصيانة.',
    icon: LayoutDashboard,
  },
  owner: {
    label: 'صاحب عقار',
    badge: 'إضافة ومتابعة',
    title: 'ادخل لمتابعة عقاراتك أو ابدأ تجهيز إعلانك',
    description: 'هذا المسار مخصص لمالك العقار الذي يريد إدارة الإعلانات ومتابعة الطلبات والصور وحالة النشر.',
    icon: Building2,
  },
  tenant: {
    label: 'مستأجر',
    badge: 'عقد ودفعات',
    title: 'ادخل إلى بوابة المستأجر والعقد والدفعات',
    description: 'هذا المسار يخدم المستأجر للوصول إلى عقده، دفعاته، والتنبيهات وطلبات الصيانة الخاصة به.',
    icon: KeyRound,
  },
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = searchParams ? await searchParams : undefined
  const mode = normalizeMode(readParam(params?.mode))
  const role = normalizeRole(readParam(params?.role))
  const toast = readToast(params, role)
  const isSupabaseReady = hasSupabaseCredentials()
  const emailValue = readParam(params?.email) || ''
  const portalEmailValue = readParam(params?.portalEmail) || ''
  const selectedRole = role ? roleMeta[role] : null
  const SelectedRoleIcon = selectedRole?.icon
  const currentModeLabel = getModeLabel(mode)
  const currentModeDescription = getModeDescription(mode, role)

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}

        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] sm:p-8 lg:p-10">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-700/10 to-transparent" />
          <div className="absolute -top-8 right-12 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-8 left-12 h-40 w-40 rounded-full bg-emerald-700/12 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="space-y-6">
              <div className="eyebrow-text reveal-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
                <Sparkles className="h-4 w-4" />
                بوابة موحدة للدخول أو بدء الاستخدام
              </div>

              <div className="reveal-fade-up reveal-delay-1 space-y-4">
                <h1 className="hero-title max-w-[36rem] text-[1.65rem] font-bold text-slate-950 sm:text-[2.05rem] lg:text-[2.85rem]">
                  <span className="hero-line">بوابة واحدة بدل صفحات متفرقة</span>
                  <span className="hero-line mt-2 sm:mt-3">ابدأ من <span className="hero-highlight">دورك الصحيح</span> ثم أكمل الإجراء المناسب</span>
                </h1>
                <p className="hero-subtitle max-w-2xl">
                  هذا المسار صار مرتباً على ثلاث خطوات واضحة: اختر الدور، اختر نوع الإجراء، ثم أكمل إلى المكان المناسب دون خلط بين الإدارة والمالك والمستأجر.
                </p>
              </div>

              <div className="reveal-fade-up reveal-delay-2 grid gap-3 rounded-[28px] border border-white/60 bg-white/80 p-4 sm:grid-cols-3">
                <div className={`rounded-2xl border px-4 py-4 ${role ? 'border-emerald-200 bg-emerald-50/80' : 'border-slate-200 bg-slate-50/80'}`}>
                  <div className="text-xs font-semibold text-slate-500">الخطوة 1</div>
                  <div className="mt-2 text-base font-bold text-slate-950">اختيار الدور</div>
                  <div className="mt-2 text-sm text-slate-600">{getRoleStepTitle(role)}</div>
                </div>
                <div className={`rounded-2xl border px-4 py-4 ${mode ? 'border-emerald-200 bg-emerald-50/80' : 'border-slate-200 bg-slate-50/80'}`}>
                  <div className="text-xs font-semibold text-slate-500">الخطوة 2</div>
                  <div className="mt-2 text-base font-bold text-slate-950">نوع الإجراء</div>
                  <div className="mt-2 text-sm text-slate-600">{currentModeLabel}: {currentModeDescription}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="text-xs font-semibold text-slate-500">الخطوة 3</div>
                  <div className="mt-2 text-base font-bold text-slate-950">النتيجة</div>
                  <div className="mt-2 text-sm text-slate-600">
                    {role === 'manager' ? 'لوحة الإدارة' : role === 'owner' ? 'لوحة عقاراتي أو مسار إعداد الإعلان' : 'بوابة المستأجر'}
                  </div>
                </div>
              </div>

              <div className="reveal-fade-up reveal-delay-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(roleMeta) as AuthRole[]).map((roleKey) => {
                  const item = roleMeta[roleKey]
                  const Icon = item.icon
                  const isActive = roleKey === role

                  return (
                    <Link
                      key={roleKey}
                      href={buildRoleHref(mode, roleKey)}
                      className={`rounded-[28px] border px-4 py-4 transition ${isActive ? 'ui-active-card' : 'border-white/60 bg-white/88 text-slate-800 shadow-[0_12px_30px_rgba(16,42,67,0.08)] hover:bg-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-700/10 p-3 text-emerald-900">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-500">{item.badge}</div>
                          <div className="mt-1 text-base font-bold">{item.label}</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {selectedRole && SelectedRoleIcon ? (
                <div className="reveal-fade-up reveal-delay-3 grid gap-4 rounded-[28px] border border-slate-900/6 bg-slate-950 p-6 text-white sm:grid-cols-[0.92fr_1.08fr]">
                  <div>
                    <div className="text-sm text-white/60">الدور الحالي</div>
                    <div className="mt-2 flex items-center gap-3 text-2xl font-bold">
                      <SelectedRoleIcon className="h-6 w-6 text-emerald-300" />
                      {selectedRole.label}
                    </div>
                  </div>
                  <div className="body-soft text-sm text-white/75">
                    {selectedRole.description}
                  </div>
                </div>
              ) : (
                <div className="reveal-fade-up reveal-delay-3 rounded-[28px] border border-slate-900/6 bg-slate-950 p-6 text-white">
                  <div className="text-sm text-white/60">قبل أي نموذج</div>
                  <div className="mt-2 text-2xl font-bold">اختر نوع الحساب أولاً ثم أكمل.</div>
                  <div className="mt-3 text-sm leading-7 text-white/75">بهذه الطريقة لا نفتح لك نموذج إدارة إذا كنت مالكاً، ولا نعرض لك مسار مستأجر إذا كنت تريد فقط نشر عقار.</div>
                </div>
              )}

              <div className="pulse-glow-soft reveal-fade-up reveal-delay-3 relative overflow-hidden rounded-[30px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
                <div className="relative">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">من داخل المنصة</div>
                  <h2 className="section-title mt-4 text-xl font-bold sm:text-2xl">الدخول هنا لا يفتح نموذجاً فقط، بل يوصلك إلى تجربة كاملة بحسب دورك.</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <article className="float-soft rounded-[24px] border border-white/10 bg-white/7 p-4 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-white/55">البحث والخرائط</div>
                          <div className="mt-2 text-base font-bold">اكتشاف العروض قبل الدخول</div>
                        </div>
                        <MapPinned className="h-5 w-5 text-sky-200" />
                      </div>
                      <div className="mt-3 rounded-2xl bg-black/15 px-4 py-3 text-sm text-white/75">ابدأ من العقار الأقرب لك، ثم ادخل عندما تكون الخطوة التالية مرتبطة بحسابك.</div>
                    </article>
                    <article className="float-soft-delay rounded-[24px] border border-white/10 bg-white/7 p-4 backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-white/55">العقود والمتابعة</div>
                          <div className="mt-2 text-base font-bold">كل دور يفتح لوحة مختلفة</div>
                        </div>
                        <FileText className="h-5 w-5 text-orange-200" />
                      </div>
                      <div className="mt-3 rounded-2xl bg-black/15 px-4 py-3 text-sm text-white/75">المالك يتابع إعلاناته، المستأجر يرى عقده، والإدارة تراقب التشغيل الكامل.</div>
                    </article>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-white/78 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/8 px-3 py-3">إشعارات مرتبة</div>
                    <div className="rounded-2xl bg-white/8 px-3 py-3">مسار واضح لكل دور</div>
                    <div className="rounded-2xl bg-white/8 px-3 py-3">انتقال أسرع للوحة المناسبة</div>
                  </div>
                </div>
              </div>

              <div className="reveal-fade-up reveal-delay-3 flex flex-wrap gap-3">
                <Link href="/search" className="btn-base btn-primary">
                  تصفح العقارات أولاً
                  <Search className="h-4 w-4" />
                </Link>
                <Link href="/" className="btn-base btn-secondary">
                  العودة إلى الصفحة الرئيسية
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="reveal-fade-up reveal-delay-2 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] backdrop-blur sm:p-8">
              <div className="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1">
                <Link
                  href={buildRoleHref('signin', role)}
                  className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${mode === 'signin' ? 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href={buildRoleHref('register', role)}
                  className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  إنشاء حساب أو بدء الاستخدام
                </Link>
              </div>

              {!selectedRole ? (
                <div className="mt-8 grid gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-900">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      اختر الدور للمتابعة
                    </div>
                    <h2 className="section-title mt-4 text-2xl font-bold text-slate-950">من سيدخل الآن؟</h2>
                    <p className="body-soft mt-3 text-sm text-[var(--muted)]">اختر نوع الحساب لنأخذك مباشرة إلى التجربة المناسبة داخل المنصة.</p>
                  </div>

                  <div className="grid gap-3">
                    {(Object.keys(roleMeta) as AuthRole[]).map((roleKey) => {
                      const item = roleMeta[roleKey]
                      const Icon = item.icon

                      return (
                        <Link
                          key={`chooser-${roleKey}`}
                          href={buildRoleHref(mode, roleKey)}
                          className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 transition hover:bg-white"
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-emerald-700/10 p-3 text-emerald-900">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-lg font-bold text-slate-950">{item.label}</div>
                                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item.badge}</div>
                              </div>
                              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                              <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                                {getRoleActionLabel(mode, roleKey)}
                                <ArrowLeft className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                    إذا كان هدفك الآن فقط استكشاف العقارات، فلا تحتاج الدخول من هذه الصفحة أصلاً. استخدم البحث أولاً ثم ارجع لهذه البوابة فقط عند الحاجة إلى حساب أو لوحة خاصة.
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-900">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {selectedRole.badge}
                    </div>
                    <h2 className="section-title mt-4 text-2xl font-bold text-slate-950">{selectedRole.title}</h2>
                    <p className="body-soft mt-3 text-sm text-[var(--muted)]">{currentModeDescription}</p>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">المسار الحالي</div>
                    <div className="mt-2 text-base font-bold text-slate-950">
                      {selectedRole.label} / {currentModeLabel}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{selectedRole.description}</p>
                  </div>

                  {mode === 'signin' ? (
                <div className="mt-8">
                  {role === 'tenant' ? (
                    <>
                      <form className="space-y-6" action={tenantSignInAction}>
                        <input type="hidden" name="returnPath" value="/auth?mode=signin&role=tenant" />
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
                            <label htmlFor="tenantPassword" className="field-label mb-1 block">كلمة المرور</label>
                            <input
                              id="tenantPassword"
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
                          دخول المستأجر
                          <DoorOpen className="h-4 w-4" />
                        </button>
                      </form>

                      <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
                        هذا المسار مخصص للمستأجرين المشتركين في المنصة للوصول السريع إلى العقود والدفعات وطلبات الصيانة والتنبيهات.
                      </div>
                    </>
                  ) : (
                    <>
                      <form className="space-y-6" action={signIn}>
                        <input type="hidden" name="returnPath" value={buildRoleHref('signin', role)} />
                        <input type="hidden" name="successPath" value={role === 'owner' ? '/my-properties' : '/dashboard'} />
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

                        <button type="submit" className="btn-base btn-primary w-full">
                          {role === 'owner' ? 'دخول صاحب العقار' : 'دخول الإدارة'}
                          <DoorOpen className="h-4 w-4" />
                        </button>
                      </form>

                      <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                        {isSupabaseReady
                          ? role === 'owner'
                            ? 'إذا نجح الدخول فسيتم توجيهك مباشرة إلى لوحة صاحب العقار بدلاً من خلطك مع مسار الإدارة.'
                            : 'إذا نجح الدخول فسيتم توجيهك مباشرة إلى لوحة الإدارة حيث تبدأ كل مهام التشغيل.'
                          : 'هذا المسار مخصص للحسابات المعتمدة. إذا لم يكن لديك حساب بعد، ابدأ بطلب الانضمام وسيصلك كل جديد وتحديث من فريق المنصة.'}
                      </div>
                    </>
                  )}
                </div>
                  ) : (
                    <div className="mt-8 grid gap-4">
                  {role === 'owner' ? (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-3 text-slate-950">
                        <PlusCircle className="h-5 w-5 text-emerald-700" />
                        <div className="text-lg font-bold">ابدأ كصاحب عقار</div>
                      </div>
                      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
                        في النسخة الحالية، أفضل بداية عملية لصاحب العقار هي تجهيز الإعلان ورفع الصور ثم متابعة الطلبات من لوحة المالك.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href="/list-property" className="btn-base btn-primary">
                          ابدأ إضافة العقار
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <Link href={buildRoleHref('signin', 'owner')} className="btn-base btn-secondary">
                          لدي حساب بالفعل
                          <UserRound className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : role === 'tenant' ? (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-3 text-slate-950">
                        <KeyRound className="h-5 w-5 text-emerald-700" />
                        <div className="text-lg font-bold">انضمام المستأجر</div>
                      </div>
                      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
                        حسابات المستأجرين تنشأ عادة عند وجود عقد فعال داخل النظام. إذا كنت تملك حساباً جاهزاً فادخل مباشرة إلى البوابة.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={buildRoleHref('signin', 'tenant')} className="btn-base btn-primary">
                          لدي حساب مستأجر
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <Link href="/search" className="btn-base btn-secondary">
                          تصفح العقارات أولاً
                          <Search className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-3 text-slate-950">
                        <ShieldCheck className="h-5 w-5 text-emerald-700" />
                        <div className="text-lg font-bold">حسابات الإدارة</div>
                      </div>
                      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
                        هذا المسار مخصص لإدارة التشغيل والعقود والمتابعة اليومية داخل المنصة من حساب معتمد.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={buildRoleHref('signin', 'manager')} className="btn-base btn-primary">
                          لدي حساب إداري
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <Link href="/search" className="btn-base btn-secondary">
                          العودة لتصفح المنصة
                          <Search className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}