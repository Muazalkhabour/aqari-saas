import Link from 'next/link'
import { ArrowLeft, Building2, DoorOpen, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { DeveloperCredit } from '@/components/developer-credit'
import { HomePlatformShowcase } from '@/components/home-platform-showcase'
import { PropertyGallery } from '@/components/property-gallery'
import { PropertyCard } from '@/components/property-card'
import { featuredListings, getPropertyCoverImage, getPropertyGallery, governorates, heroStats } from '@/lib/syrian-real-estate-demo'

export default function Home() {
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

          <div className="relative grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
            <div className="order-2 space-y-6 lg:order-1">
              <div className="eyebrow-text reveal-fade-up inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-center text-emerald-900 sm:w-auto sm:justify-start">
                <Sparkles className="h-4 w-4" />
                اكتشف العروض الجديدة وابدأ رحلتك العقارية من هنا
              </div>

              <div className="reveal-fade-up reveal-delay-1 space-y-4">
                <h1 className="hero-title max-w-[36rem] text-[1.6rem] font-bold text-slate-950 sm:text-[2rem] lg:text-[2.75rem]">
                  <span className="hero-line">اكتشف عقارك القادم</span>
                  <span className="hero-line mt-2 sm:mt-3">وتابع أفضل <span className="hero-highlight">الفرص والتحديثات</span> أولاً بأول</span>
                </h1>
                <p className="hero-subtitle max-w-xl">
                  تصفح العروض المميزة، قارن بسهولة، ثم ادخل إلى حسابك أو ابدأ الانضمام لتبقى قريباً من كل جديد في السوق.
                </p>
              </div>

              <form action="/search" className="reveal-fade-up reveal-delay-2 grid gap-3 rounded-[28px] border border-white/60 bg-white/85 p-4 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:grid-cols-2 lg:grid-cols-[1.3fr_1.15fr_0.95fr_auto]">
                <input
                  name="query"
                  placeholder="مثال: شقة مفروشة في المزة أو شقة للبيع في حلب"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                />
                <select
                  name="governorate"
                  defaultValue="الكل"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:min-w-[11rem] sm:text-base"
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
                  تصفح الآن
                </button>
              </form>

              <div className="reveal-fade-up reveal-delay-3 grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-slate-900/6 bg-white/70 p-4">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value mt-2 text-3xl font-bold text-slate-950">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="reveal-fade-up reveal-delay-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/search"
                  className="btn-base btn-primary w-full sm:w-auto"
                >
                  ابدأ البحث الآن
                  <Search className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth?mode=signin"
                  className="btn-base btn-secondary w-full sm:w-auto"
                >
                  دخول أو إنشاء حساب
                  <DoorOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <HomePlatformShowcase />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-900/6 bg-white/65 p-5 shadow-[0_10px_30px_rgba(16,42,67,0.05)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="section-title text-lg font-bold text-slate-950 sm:text-xl">ثلاثة مسارات واضحة بعد الواجهة الرئيسية</h2>
              <p className="body-soft mt-2 max-w-2xl text-sm text-[var(--muted)]">
                سواء كنت تبحث عن عقار، أو تدير إعلانك، أو تتابع عقدك، ستجد المسار المناسب بسرعة ومن دون تعقيد.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/auth?mode=signin" className="btn-base btn-secondary w-full sm:w-auto">
                افتح بوابة الدخول الموحدة
                <DoorOpen className="h-4 w-4" />
              </Link>
              <Link href="/search" className="btn-base btn-secondary w-full sm:w-auto">
                متابعة التصفح
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-3">
            <article className="rounded-[24px] border border-slate-200/70 bg-slate-50/75 p-4">
              <div className="flex items-center gap-2 text-slate-950">
                <Search className="h-5 w-5 text-emerald-700" />
                <div className="text-base font-bold">باحث عن عقار</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">هذا المستخدم لا يحتاج أن يرى تفاصيل الإدارة أو النشر. يكفيه البحث، الفلاتر، وصفحات العقارات.</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">ابدأ من هنا لاكتشاف العروض المناسبة ومتابعة ما يستحق اهتمامك.</p>
            </article>
            <article className="rounded-[24px] border border-slate-200/70 bg-slate-50/75 p-4">
              <div className="flex items-center gap-2 text-slate-950">
                <Building2 className="h-5 w-5 text-emerald-700" />
                <div className="text-base font-bold">صاحب عقار</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">أضف إعلانك، حسّن حضوره، وابقَ قريباً من الطلبات والتحديثات أولاً بأول.</p>
            </article>
            <article className="rounded-[24px] border border-slate-200/70 bg-slate-50/75 p-4">
              <div className="flex items-center gap-2 text-slate-950">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <div className="text-base font-bold">مدير أو مستأجر</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">إدارة أو متابعة أو سكن، كل تجربة تبدأ من مدخل واضح وتستمر برسائل وتحديثات منظمة.</p>
            </article>
          </div>
        </section>

        <PropertyGallery
          title="صور العقارات المعروضة الآن"
          description="معرض سريع يمنحك لمحة عن أبرز العروض الحالية ويقربك من قرارك التالي بثقة أكبر."
          images={homepageGalleryImages}
        />

        <section id="available-apartments" className="rounded-[28px] border border-slate-900/6 bg-white/65 p-5 shadow-[0_10px_30px_rgba(16,42,67,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">الشقق المتوفرة الآن</h2>
              <p className="body-soft mt-2 text-sm text-[var(--muted)]">وصول سريع إلى أبرز الشقق المتاحة حالياً لتبدأ المقارنة والاختيار مباشرة.</p>
            </div>
            <Link href="/search" className="btn-base btn-secondary w-full sm:w-auto">
              عرض كل الشقق
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {featuredListings.map((property) => (
            <PropertyCard key={property.id} property={property} compact />
          ))}
          </div>
        </section>

        <DeveloperCredit prominent />
      </div>
    </main>
  )
}