import Link from 'next/link'
import { ArrowLeft, BellRing, Building2, DoorOpen, FileText, MapPinned, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { DeveloperCredit } from '@/components/developer-credit'
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

            <div className="order-1 pulse-glow-soft relative self-start overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:p-6 lg:order-2 lg:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
              <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-emerald-500/18 blur-3xl" />
              <div className="absolute -left-8 bottom-8 h-28 w-28 rounded-full bg-orange-500/18 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                <div className="absolute left-[44%] top-[11rem] h-px w-[24%] bg-gradient-to-r from-emerald-400/0 via-emerald-300/60 to-sky-300/0" />
                <div className="absolute left-[44%] top-[22rem] h-px w-[24%] bg-gradient-to-r from-orange-300/0 via-orange-200/60 to-emerald-300/0" />
                <div className="absolute left-[56%] top-[11rem] h-[11rem] w-px bg-gradient-to-b from-sky-200/0 via-white/25 to-white/0" />
              </div>

              <div className="relative">
                <div className="reveal-fade-up inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                  مشهد المنصة في شاشة واحدة
                </div>
                <h2 className="section-title reveal-fade-up reveal-delay-1 mt-4 text-2xl font-bold sm:text-[2rem]">العقار ليس مجرد إعلان هنا، بل بداية رحلة كاملة من الاكتشاف إلى الإدارة.</h2>
                <p className="body-soft reveal-fade-up reveal-delay-2 mt-3 max-w-xl text-sm text-white/75">
                  في هذا المشهد ترى الفرق مباشرة: عرض عقار واضح، خريطة تساعد على القرار، عقد جاهز للمتابعة، ولوحة تشغيل تعطي المكتب تحكماً فعلياً.
                </p>

                <div className="reveal-fade-up reveal-delay-2 mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/78">
                  <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">بحث + خريطة</div>
                  <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">عقد + دفعات</div>
                  <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">صيانة + إشعارات</div>
                  <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">لوحة تشغيل واحدة</div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <article className="float-soft reveal-fade-up reveal-delay-2 overflow-hidden rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white/55">العقار</div>
                        <div className="mt-2 text-lg font-bold">شقة عائلية في المزة الغربية</div>
                        <div className="mt-2 text-sm text-white/70">3 غرف • 180 م² • جاهزة للسكن</div>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                        <Building2 className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/12 to-white/0 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">إيجار</span>
                        <span className="font-bold text-white">850$ شهرياً</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/75">
                        <div className="rounded-2xl bg-black/15 px-2 py-3">صور واضحة</div>
                        <div className="rounded-2xl bg-black/15 px-2 py-3">وصف مختصر</div>
                        <div className="rounded-2xl bg-black/15 px-2 py-3">تواصل سريع</div>
                      </div>
                    </div>
                  </article>

                  <article className="float-soft-delay reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white/55">الخريطة</div>
                        <div className="mt-2 text-lg font-bold">موقع العرض وقربه من الباحث</div>
                      </div>
                      <div className="rounded-2xl bg-sky-500/14 p-3 text-sky-200">
                        <MapPinned className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-4">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="h-12 rounded-2xl bg-white/8" />
                        <div className="h-12 rounded-2xl bg-white/8" />
                        <div className="h-12 rounded-2xl bg-white/8" />
                        <div className="h-12 rounded-2xl bg-white/8" />
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/15 px-3 py-2 text-xs text-white/75">
                        <span>المزة الغربية</span>
                        <span>الأقرب لك</span>
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-orange-400" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        <span className="h-3 w-3 rounded-full bg-sky-400" />
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                  <article className="reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white/55">العقد والمتابعة</div>
                        <div className="mt-2 text-lg font-bold">التوقيع ليس النهاية، بل بداية المتابعة المنظمة</div>
                      </div>
                      <div className="rounded-2xl bg-orange-500/14 p-3 text-orange-200">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-white/78">
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>حالة العقد</span>
                        <span className="font-bold text-emerald-200">نشط حتى 2027</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>الدفعة القادمة</span>
                        <span className="font-bold text-white">05 أبريل</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>الصيانة</span>
                        <span className="font-bold text-white">طلب واحد مفتوح</span>
                      </div>
                    </div>
                  </article>

                  <article className="reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white/55">لوحة الإدارة</div>
                        <div className="mt-2 text-lg font-bold">المكتب يرى الصورة كاملة في لحظة واحدة</div>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                        <BellRing className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-white/80">
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>عقود تنتهي قريباً</span>
                        <span className="rounded-full bg-amber-400/20 px-2 py-1 font-bold text-amber-200">12</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>طلبات جديدة</span>
                        <span className="rounded-full bg-sky-400/20 px-2 py-1 font-bold text-sky-200">18</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                        <span>إشعارات تحتاج متابعة</span>
                        <span className="rounded-full bg-emerald-400/20 px-2 py-1 font-bold text-emerald-200">7</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
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