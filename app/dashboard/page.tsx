import Link from 'next/link'
import {
  BellRing,
  Building2,
  CheckCircle2,
  FileText,
  House,
  KeyRound,
  Palette,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import { LiveUnreadNotificationsBadge } from '@/components/live-unread-notifications-badge'
import { OperationsOverviewPanel } from '@/components/operations-overview-panel'
import { getUnreadInternalNotificationsCount } from '@/lib/contract-activity'
import { dashboardMetrics, marketPulse } from '@/lib/syrian-real-estate-demo'

const metricIcons = [House, KeyRound, Building2, Users]

const focusSteps = [
  {
    title: 'ابدأ بالعقود والمدفوعات',
    description: 'راجع ما يقترب من الاستحقاق قبل أي شيء آخر حتى لا تضيع المتابعات اليومية.',
    icon: FileText,
  },
  {
    title: 'ثم افتح التنبيهات والصيانة',
    description: 'بعد تثبيت اليوم المالي، التقط الطلبات العاجلة والمشكلات التشغيلية سريعاً.',
    icon: BellRing,
  },
  {
    title: 'أجّل الاستعراض إلى النهاية',
    description: 'لوحة الإدارة هنا للعمل اليومي فقط، أما السوق والبحث فبقيا في صفحاتهما المتخصصة.',
    icon: CheckCircle2,
  },
]

const quickLinks = [
  {
    href: '/contracts',
    title: 'إدارة العقود',
    description: 'العقود، التجديدات، والمدفوعات من شاشة واحدة.',
    icon: FileText,
  },
  {
    href: '/maintenance',
    title: 'طلبات الصيانة',
    description: 'المتابعة اليومية للأعطال والطلبات المعلقة.',
    icon: Wrench,
  },
  {
    href: '/office',
    title: 'إعدادات المكتب',
    description: 'الهوية، التوقيع، وقنوات التواصل الرسمية.',
    icon: Palette,
  },
  {
    href: '/dashboard/auth-audit',
    title: 'سجل الأمان',
    description: 'محاولات الدخول والتنبيهات الأمنية.',
    icon: ShieldCheck,
  },
]

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const unreadNotificationsCount = await getUnreadInternalNotificationsCount()

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] backdrop-blur sm:p-8 lg:p-10">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-emerald-700/10 to-transparent" />
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
            <div className="space-y-5">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <ShieldCheck className="h-4 w-4" />
                لوحة الإدارة اليومية
              </div>

              <div>
                <h1 className="hero-title max-w-4xl text-[1.7rem] font-bold leading-[1.55] text-slate-950 sm:text-[2.1rem] lg:text-[2.7rem]">
                  ابدأ يوم المكتب من <span className="hero-highlight">الأولويات التشغيلية</span>
                  <span className="mt-2 block text-slate-900">بدلاً من إغراق المدير بكل شيء دفعة واحدة</span>
                </h1>
                <p className="hero-subtitle mt-4 max-w-3xl text-base leading-8 sm:text-lg">
                  هذه الشاشة صارت مخصصة لما يحتاجه المدير الآن: متابعة العقود، التقاط التنبيهات، ثم مراجعة الأداء السريع. صفحات السوق والاستعراض بقيت خارج هذه اللوحة حتى تبقى القراءة أسرع.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {focusSteps.map(({ title, description, icon: Icon }) => (
                  <article key={title} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
                    <div className="flex items-center gap-2 text-slate-950">
                      <Icon className="h-5 w-5 text-emerald-700" />
                      <h2 className="text-base font-bold">{title}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[32px] border border-white/70 bg-white/84 p-5 shadow-[0_20px_50px_rgba(16,42,67,0.08)] backdrop-blur sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                اختصارات العمل اليومي
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-10 text-slate-950">أسرع طريق إلى ما يحتاج متابعة اليوم</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                خففنا عدد المداخل داخل اللوحة نفسها. الروابط هنا فقط للأقسام التي يحتاجها المدير أثناء التشغيل.
              </p>

              <div className="mt-5 space-y-3">
                {quickLinks.map(({ href, title, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-start justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-950">{title}</div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">{description}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-700/10 bg-white p-3 text-emerald-800">
                      <Icon className="h-5 w-5" />
                    </div>
                  </Link>
                ))}

                <Link
                  href="/notifications"
                  className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-right text-white shadow-[0_14px_34px_rgba(15,23,42,0.2)] transition hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-emerald-300" />
                      <span className="text-sm font-bold">الإشعارات الداخلية</span>
                    </div>
                    <LiveUnreadNotificationsBadge initialCount={unreadNotificationsCount} />
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/75">افتح التنبيهات العاجلة فوراً بدون المرور على أقسام ثانوية.</div>
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map(({ title, value, delta }, index) => {
            const Icon = metricIcons[index]

            return (
              <article
                key={title}
                className="rounded-[28px] border border-white/60 bg-white/88 p-5 shadow-[0_18px_46px_rgba(16,42,67,0.07)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="stat-label">{title}</p>
                    <p className="stat-value mt-3 text-3xl font-bold text-slate-950">{value}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-700/10 bg-emerald-700/10 p-3 text-emerald-800">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50/90 px-3 py-2 text-sm font-medium text-emerald-800">{delta}</div>
              </article>
            )
          })}
        </section>

        <OperationsOverviewPanel />

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">نبض السوق في سطرين</h2>
                <p className="body-soft mt-2 text-sm text-[var(--muted)]">
                  احتفظنا بملخص صغير فقط حتى لا تتحول لوحة الإدارة إلى صفحة استكشاف سوق.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
                <TrendingUp className="h-4 w-4" />
                ملخص سريع
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {marketPulse.slice(0, 3).map((item) => (
                <div key={item.governorate} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 shadow-[0_10px_24px_rgba(16,42,67,0.04)]">
                  <div className="text-base font-bold text-slate-950">{item.governorate}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-900">{item.demand}</div>
                  <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    <div>متوسط الإيجار: <span className="font-semibold text-slate-900">{item.averageRent}</span></div>
                    <div>متوسط البيع: <span className="font-semibold text-slate-900">{item.averageSale}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">تذكير تشغيلي</h2>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">إذا تراكمت عليك المهام، ابدأ بالعقود ثم التنبيهات ثم الصيانة. هذا الترتيب يقلل احتمال ضياع الحالات الحرجة.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">اجعل إعدادات المكتب والعلامة الرسمية محدثة دائماً قبل إرسال أي عقد أو تقرير PDF للعميل.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">الإعلانات العامة وتجربة المالك والمستأجر لم تعد داخل هذه اللوحة كي يبقى المدير في سياق تشغيل واحد.</div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
