import Link from 'next/link'
import { ArrowLeft, Building2, LayoutDashboard, KeyRound, MapPinned, PlusCircle, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { DeveloperCredit } from '@/components/developer-credit'
import { PropertyGallery } from '@/components/property-gallery'
import { PropertyCard } from '@/components/property-card'
import { featuredListings, getPropertyCoverImage, getPropertyGallery, governorates, heroStats, syrianProperties } from '@/lib/syrian-real-estate-demo'
import { isDevelopmentDemoModeEnabled } from '@/lib/env'

export default function Home() {
  const canUseDemoMode = isDevelopmentDemoModeEnabled()
  const homepageGalleryImages = [
    ...getPropertyGallery(featuredListings[0]),
    ...featuredListings.slice(1, 3).map((property) => ({
      src: getPropertyCoverImage(property),
      label: property.title,
      alt: `صورة رئيسية لعقار ${property.title}`,
    })),
  ].slice(0, 5)

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] sm:p-8 lg:p-10">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-700/10 to-transparent" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
                <Sparkles className="h-4 w-4" />
                منصة عقارات سورية للبيع والإيجار
              </div>

              <div className="space-y-4">
                <h1 className="hero-title max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                  <span className="hero-line">ابحث عن شقتك في <span className="hero-highlight">سوريا</span></span>
                  <span className="hero-line mt-2 sm:mt-3">واعرض <span className="hero-highlight">عقارك</span> بثقة أوضح</span>
                </h1>
                <p className="hero-subtitle max-w-xl">
                  واجهة واضحة تجمع بين البحث السريع والعروض المميزة، وتعرض ما يهم المستخدم السوري فعلاً في مختلف المحافظات.
                </p>
              </div>

              <form action="/search" className="grid gap-3 rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:grid-cols-[1.3fr_1.15fr_0.95fr_auto]">
                <input
                  name="query"
                  placeholder="مثال: شقة مفروشة في المزة أو شقة للبيع في حلب"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
                <select
                  name="governorate"
                  defaultValue="الكل"
                  className="min-w-[11rem] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:text-base"
                >
                  <option value="الكل">كل المحافظات</option>
                  {governorates.map((governorate) => (
                    <option key={governorate} value={governorate}>
                      {governorate}
                    </option>
                  ))}
                </select>
                <select
                  name="type"
                  defaultValue="الكل"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                >
                  <option value="الكل">بيع وإيجار</option>
                  <option value="إيجار">إيجار</option>
                  <option value="بيع">بيع</option>
                </select>
                <button
                  type="submit"
                  className="btn-base btn-primary"
                >
                  <Search className="h-4 w-4" />
                  ابحث الآن
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value mt-2 text-3xl font-bold text-slate-950">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/list-property"
                  className="btn-base btn-primary"
                >
                  اعرض شقتك للبيع أو الإيجار
                  <PlusCircle className="h-4 w-4" />
                </Link>
                <Link
                  href="/search"
                  className="btn-base btn-secondary"
                >
                  تصفح العقارات الحالية
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Link
                  href="/tenant-login"
                  className="btn-base btn-secondary"
                >
                  دخول المستأجر
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <div>
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  لماذا ستنجح المنصة؟
                </div>
                <h2 className="section-title mt-4 text-xl font-bold sm:text-2xl">لأنها تختصر قرار السكن أو الشراء بخطوات أوضح.</h2>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <MapPinned className="h-4 w-4 text-emerald-300" />
                    تغطية محلية حقيقية
                  </div>
                  <p className="body-soft mt-2 text-sm text-white/75">المحافظة والحي والخدمات القريبة أهم من الوصف العام، لذلك تتقدم هنا على أي كلام تسويقي.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    ثقة أعلى للمستخدم
                  </div>
                  <p className="body-soft mt-2 text-sm text-white/75">إظهار الجهة المعلنة وحالة العقار، مع تفاصيل عملية مثل الفرش والمصعد والمياه.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Building2 className="h-4 w-4 text-emerald-300" />
                    مناسب للمكاتب والمالكين
                  </div>
                  <p className="body-soft mt-2 text-sm text-white/75">بنية جاهزة للإعلانات والبحث اليوم، وقابلة للتوسع لاحقاً نحو إدارة العملاء والمكاتب.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">المعروض حالياً على المنصة</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              {syrianProperties.length} عقاراً تجريبياً بين البيع والإيجار في المحافظات الأعلى طلباً.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/list-property"
              className="btn-base btn-primary"
            >
              أضف عقارك الآن
              <PlusCircle className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="btn-base btn-secondary"
            >
              انتقل إلى البحث المتقدم
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="inline-flex rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-900">
              مدير المنصة
            </div>
            <div className="mt-4 flex items-center gap-3 text-slate-950">
              <LayoutDashboard className="h-6 w-6 text-emerald-700" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">تشغيل المكتب والإدارة</h2>
            </div>
            <p className="body-soft mt-3 text-sm text-[var(--muted)]">
              ادخل إلى لوحة المكتب، العقود، الإشعارات، الصيانة، وسجل الأمان من منظور المدير أو المكتب العقاري.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login" className="btn-base btn-primary">
                دخول المدير
                <ShieldCheck className="h-4 w-4" />
              </Link>
              {canUseDemoMode ? (
                <Link href="/dashboard?mode=demo" className="btn-base btn-secondary">
                  معاينة لوحة الإدارة
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-900">
              صاحب عقار
            </div>
            <div className="mt-4 flex items-center gap-3 text-slate-950">
              <Building2 className="h-6 w-6 text-orange-600" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">عرض العقار ومتابعته</h2>
            </div>
            <p className="body-soft mt-3 text-sm text-[var(--muted)]">
              ابدأ بإضافة عقارك، ارفع الصور، راجع المعاينة، ثم تابع طلبات التواصل وحالة الإعلان من لوحة المالك المحلية.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/list-property" className="btn-base btn-primary">
                أضف عقارك
                <PlusCircle className="h-4 w-4" />
              </Link>
              <Link href="/my-properties" className="btn-base btn-secondary">
                لوحة صاحب العقار
                <UserRound className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="inline-flex rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-900">
              عميل أو مستأجر
            </div>
            <div className="mt-4 flex items-center gap-3 text-slate-950">
              <KeyRound className="h-6 w-6 text-sky-700" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">البحث والاستئجار</h2>
            </div>
            <p className="body-soft mt-3 text-sm text-[var(--muted)]">
              تصفح العقارات العامة، افتح صفحات التفاصيل، ثم ادخل إلى بوابة المستأجر إذا كان لديك عقد أو حساب فعال داخل النظام.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/search" className="btn-base btn-primary">
                ابدأ البحث
                <Search className="h-4 w-4" />
              </Link>
              <Link href="/tenant-login" className="btn-base btn-secondary">
                دخول المستأجر
                <ShieldCheck className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </section>

        <PropertyGallery
          title="صور العقارات المعروضة الآن"
          description="معرض سريع وواضح يعطي الزائر انطباعاً بصرياً مباشراً عن الشقق الحالية قبل الدخول إلى كل بطاقة بالتفصيل."
          images={homepageGalleryImages}
        />

        <section className="grid gap-5 xl:grid-cols-2">
          {featuredListings.map((property) => (
            <PropertyCard key={property.id} property={property} compact />
          ))}
        </section>

        <DeveloperCredit prominent />
      </div>
    </main>
  )
}