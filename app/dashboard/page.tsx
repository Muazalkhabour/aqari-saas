import Link from 'next/link'
import {
  ArrowLeft,
  BellRing,
  Building2,
  CheckCircle2,
  CircleAlert,
  House,
  KeyRound,
  Lightbulb,
  MapPin,
  Palette,
  FileText,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { LiveUnreadNotificationsBadge } from '@/components/live-unread-notifications-badge'
import { getUnreadInternalNotificationsCount } from '@/lib/contract-activity'
import {
  audienceNeeds,
  dashboardMetrics,
  featuredListings,
  governorates,
  marketPulse,
  productSuggestions,
} from '@/lib/syrian-real-estate-demo'
import { OperationsOverviewPanel } from '@/components/operations-overview-panel'
import { PropertyPreviewVisual } from '@/components/property-preview-visual'

const metricIcons = [House, KeyRound, Building2, Users]
export const dynamic = 'force-dynamic'

const activity = [
  'الطلب الأعلى اليوم على إيجارات دمشق وريف دمشق ضمن الميزانية المتوسطة.',
  'العروض الجاهزة للسكن في اللاذقية تسجل تفاعلاً أسرع هذا الأسبوع.',
  'شقق البيع في حلب وحمص تحقق استفسارات أكثر عند ذكر الكراج أو المصعد.',
  'الإعلانات التي تذكر المياه والطاقة الشمسية والخدمات القريبة تحصد تفاعلاً أفضل.',
]

export default async function DashboardPage() {
  const unreadNotificationsCount = await getUnreadInternalNotificationsCount()

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] backdrop-blur sm:p-8 lg:p-10">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-emerald-700/10 to-transparent" />
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
            <div className="space-y-5">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <Sparkles className="h-4 w-4" />
                منصة عقارية سورية تغطي المحافظات الأساسية
              </div>
              <div>
                <h1 className="hero-title max-w-4xl text-[1.7rem] font-bold leading-[1.55] text-slate-950 sm:text-[2.1rem] lg:text-[2.8rem]">
                  <span className="hero-highlight">عقارات</span> للبيع والإيجار في <span className="hero-highlight">سوريا</span>
                  <span className="mt-2 block text-slate-900">بصياغة أقرب لما يبحث عنه السوري</span>
                </h1>
                <p className="hero-subtitle mt-4 max-w-3xl text-base leading-8 sm:text-lg">
                  هذه النسخة تعرض محتوى محلياً من سوريا، مع مؤشرات تساعد المكتب العقاري أو الزائر على الوصول إلى العقار الأنسب بسرعة.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/72 p-4 shadow-[0_16px_40px_rgba(16,42,67,0.06)] sm:p-5">
                <div className="mb-3 text-sm font-semibold text-slate-900">المحافظات المغطاة داخل المعاينة</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {governorates.map((governorate) => (
                  <span
                    key={governorate}
                    className="rounded-2xl border border-slate-900/8 bg-white/88 px-3 py-2 text-center text-sm font-medium text-slate-700 shadow-[0_8px_18px_rgba(16,42,67,0.05)]"
                  >
                    {governorate}
                  </span>
                ))}
                </div>
              </div>
            </div>

            <aside className="rounded-[32px] border border-white/70 bg-white/84 p-5 shadow-[0_20px_50px_rgba(16,42,67,0.08)] backdrop-blur sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <ShieldCheck className="h-4 w-4" />
                وصول سريع للمعاينة والإدارة
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-10 text-slate-950">ابدأ من الإجراء المناسب بدل تزاحم كل الروابط في سطر واحد</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                جمعنا الروابط الأساسية في بطاقة جانبية مرتبة حتى يبقى عنوان الصفحة والوصف واضحين أثناء التصفح.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Link
                  href="/list-property"
                  className="btn-base btn-primary w-full justify-between"
                >
                  اعرض عقارك الآن
                  <PlusCircle className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn-base btn-secondary w-full justify-between"
                >
                  إدارة الدخول
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/my-properties"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <House className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">عقاراتي المحلية</span>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">راجع ما تم نشره محليًا وعدّل بيانات العقارات بسرعة.</div>
                </Link>
                <Link
                  href="/tenant-login"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <Users className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">دخول المستأجر</span>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">افتح البوابة الخاصة بالمستأجر والعقود والدفعات.</div>
                </Link>
                <Link
                  href="/office"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <Palette className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">إعدادات المكتب</span>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">حدّث بيانات المكتب وتفضيلات التشغيل من مكان واحد.</div>
                </Link>
                <Link
                  href="/contracts"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <FileText className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">إدارة العقود</span>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">انتقل مباشرة إلى العقود والمتابعة والتجديدات.</div>
                </Link>
                <Link
                  href="/notifications"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white sm:col-span-2"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-emerald-800" />
                      <span className="text-sm font-bold">الإشعارات الداخلية</span>
                    </div>
                    <LiveUnreadNotificationsBadge initialCount={unreadNotificationsCount} />
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">تابع التنبيهات والتحديثات الداخلية بدون ازدحام في رأس الصفحة.</div>
                </Link>
                <Link
                  href="/dashboard/auth-audit"
                  className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-white sm:col-span-2"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-950">
                    <ShieldCheck className="h-5 w-5 text-emerald-800" />
                    <span className="text-sm font-bold">سجل دخول الأمان</span>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">راجع محاولات الدخول والسجل الأمني من لوحة أوضح.</div>
                </Link>
              </div>

              <div className="mt-5 rounded-[24px] border border-emerald-700/12 bg-emerald-700/10 px-4 py-4 text-sm leading-7 text-emerald-950">
                بيع وإيجار من دمشق إلى اللاذقية وحلب وريف دمشق ضمن واجهة أكثر وضوحًا وتنظيمًا.
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

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-[32px] border border-white/60 bg-white/88 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">نبض السوق السوري</h2>
                <p className="body-soft mt-2 text-sm text-[var(--muted)]">
                  نظرة سريعة على المحافظات الأكثر حضوراً، مع متوسطات تقريبية للمقارنة بين الإيجار والشراء.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
                <TrendingUp className="h-4 w-4" />
                طلب صاعد
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {marketPulse.map((item) => (
                <div key={item.governorate} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 shadow-[0_10px_24px_rgba(16,42,67,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-950">
                      <MapPin className="h-4 w-4 text-emerald-800" />
                      <span className="font-bold">{item.governorate}</span>
                    </div>
                    <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-900">
                      {item.demand}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    <div>متوسط الإيجار: <span className="font-semibold text-slate-900">{item.averageRent}</span></div>
                    <div>متوسط البيع: <span className="font-semibold text-slate-900">{item.averageSale}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-[var(--surface-strong)] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CircleAlert className="h-4 w-4 text-[var(--accent-warm)]" />
                قراءة محلية سريعة
              </div>
              <p className="body-soft mt-3 max-w-3xl text-sm text-[var(--muted)]">
                الإعلان الأقوى هو الذي يذكر الحي بدقة، ونوع الكسوة، والخدمات القريبة، وتفاصيل مثل المصعد والمياه والتدفئة قبل أي وصف عام.
              </p>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(241,245,249,0.92),rgba(255,255,255,0.95))] p-6 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-700/10 p-3 text-emerald-800">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 className="section-title text-xl font-bold sm:text-2xl">ماذا يبحث الزوار اليوم؟</h2>
                <p className="mt-1 text-sm text-slate-600">ملخص سريع للأنماط الأكثر حضورًا في استفسارات الزوار هذا الأسبوع.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {activity.map((item) => (
                <div key={item} className="rounded-[24px] border border-slate-200 bg-white/90 p-4 text-sm leading-7 text-slate-700 shadow-[0_10px_24px_rgba(16,42,67,0.05)]">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
              className="relative overflow-hidden rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_18px_48px_rgba(16,42,67,0.07)]"
            >
              <div className="absolute left-0 top-0 h-36 w-36 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-600/10 blur-3xl" />
              <div className="relative">
                <PropertyPreviewVisual property={listing} compact />

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div
                      className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${listing.type === 'بيع' ? 'bg-orange-500' : 'bg-emerald-700'}`}
                    >
                      {listing.type}
                    </div>
                    <h3 className="card-title text-2xl font-bold text-slate-950">{listing.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {listing.governorate} - {listing.district} - {listing.neighborhood}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-700/12 bg-emerald-700/10 px-4 py-3 text-sm font-bold text-emerald-950">
                    {listing.priceLabel}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="text-[var(--muted)]">المساحة</div>
                    <div className="mt-1 font-bold text-slate-950">{listing.areaSqm} م²</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="text-[var(--muted)]">التقسيم</div>
                    <div className="mt-1 font-bold text-slate-950">{listing.rooms} غرف</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="text-[var(--muted)]">الحالة</div>
                    <div className="mt-1 font-bold text-slate-950">{listing.status}</div>
                  </div>
                </div>

                <p className="body-soft mt-5 text-sm text-[var(--muted)]">{listing.highlight}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.features.map((feature) => (
                    <span key={feature} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[32px] border border-white/60 bg-white/88 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">كيف تصبح المنصة أقرب للسوق السوري؟</h2>
            </div>

            <div className="mt-6 grid gap-4">
              {productSuggestions.map((suggestion) => (
                <div key={suggestion.title} className="rounded-3xl border border-slate-100 bg-[var(--surface-strong)] p-5 shadow-[0_10px_24px_rgba(16,42,67,0.04)]">
                  <h3 className="text-lg font-bold text-slate-950">{suggestion.title}</h3>
                  <p className="body-soft mt-2 text-sm text-[var(--muted)]">{suggestion.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] backdrop-blur">
            <div className="flex items-center gap-2 text-slate-950">
              <CheckCircle2 className="h-5 w-5 text-emerald-800" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">ما الذي يجعل المشروع أكثر فاعلية؟</h2>
            </div>

            <div className="mt-6 space-y-3">
              {audienceNeeds.map((need) => (
                <div key={need} className="flex items-start gap-3 rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                  <p className="body-soft text-sm text-slate-700">{need}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}