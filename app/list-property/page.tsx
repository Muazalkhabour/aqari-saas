import Link from 'next/link'
import { Camera, CheckCircle2, ClipboardList, Eye, Info, PlusCircle, Sparkles } from 'lucide-react'
import {
  governorates,
  ownerFeatureSuggestions,
  ownerListingChecklist,
  ownerPublishingAdvantages,
} from '@/lib/syrian-real-estate-demo'

export default function ListPropertyPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] sm:p-8 lg:p-10">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-700/10 to-transparent" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
                <PlusCircle className="h-4 w-4" />
                مسار مبسط لصاحب العقار
              </div>

              <div>
                <h1 className="hero-title max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                  <span className="hero-line">جهّز <span className="hero-highlight">إعلان العقار</span> على 3 خطوات فقط</span>
                  <span className="hero-line mt-2 sm:mt-3">بيانات ثم صور ثم معاينة</span>
                </h1>
                <p className="hero-subtitle mt-4 max-w-xl">
                  ابدأ بالبيانات الأساسية هنا، ثم ارفع الصور، ثم راجع المعاينة. لا تحتاج أكثر من هذا المسار.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  '1. أدخل الأساسيات: العنوان، الموقع، السعر.',
                  '2. أضف المواصفات المختصرة فقط: المساحة، الغرف، الحالة.',
                  '3. انتقل إلى المعاينة ثم أكمل الصور قبل النشر.',
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-900/6 bg-white/75 p-5 text-sm leading-7 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <div className="flex items-center gap-2 text-white">
                <ClipboardList className="h-5 w-5 text-emerald-300" />
                <h2 className="section-title text-xl font-bold sm:text-2xl">ما الذي تحتاجه فعلاً هنا؟</h2>
              </div>

              <div className="mt-5 space-y-3">
                {ownerListingChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/85">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                لا تكتب كل شيء. إذا وضحت الموقع والسعر والحالة وأبرز ميزة، فقد أنجزت المهم.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">أدخل بيانات العقار</h2>
                <p className="body-soft mt-2 text-sm text-[var(--muted)]">
                  املأ الحقول المهمة فقط. بقية التحسينات ستظهر في مرحلة الصور والمعاينة.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
                <Eye className="h-4 w-4" />
                الخطوة 1 من 3
              </div>
            </div>

            <form action="/list-property/preview" className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="text-base font-bold text-slate-950">الأساسيات</div>
                <p className="mt-2 text-sm text-slate-600">هذه الحقول تحدد إن كان الزائر سيكمل القراءة أم لا.</p>
              </div>

              <input
                name="title"
                defaultValue="شقة واسعة للبيع في حي هادئ"
                placeholder="عنوان الإعلان"
                className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <select
                name="type"
                defaultValue="بيع"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              >
                <option value="بيع">بيع</option>
                <option value="إيجار">إيجار</option>
              </select>

              <select
                name="ownership"
                defaultValue="مالك مباشر"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              >
                <option value="مالك مباشر">مالك مباشر</option>
                <option value="مكتب عقاري">مكتب عقاري</option>
              </select>

              <select
                name="governorate"
                defaultValue="دمشق"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              >
                {governorates.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>

              <input
                name="district"
                defaultValue="المزة"
                placeholder="المنطقة"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="neighborhood"
                defaultValue="المزة الغربية"
                placeholder="الحي"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="price"
                defaultValue="76000"
                placeholder="السعر بالأرقام"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <select
                name="paymentPeriod"
                defaultValue="مرة واحدة"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              >
                <option value="مرة واحدة">دفعة بيع نهائية</option>
                <option value="شهري">إيجار شهري</option>
                <option value="سنوي">إيجار سنوي</option>
              </select>

              <div className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="text-base font-bold text-slate-950">المواصفات المختصرة</div>
                <p className="mt-2 text-sm text-slate-600">أدخل فقط ما يساعد على المقارنة السريعة.</p>
              </div>

              <input
                name="areaSqm"
                defaultValue="145"
                placeholder="المساحة بالمتر"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="rooms"
                defaultValue="4"
                placeholder="عدد الغرف"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="bathrooms"
                defaultValue="2"
                placeholder="عدد الحمامات"
                inputMode="numeric"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="floor"
                defaultValue="الطابق الثالث"
                placeholder="الطابق"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <select
                name="furnishing"
                defaultValue="غير مفروش"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              >
                <option value="غير مفروش">غير مفروش</option>
                <option value="نصف مفروش">نصف مفروش</option>
                <option value="مفروش">مفروش</option>
              </select>

              <div className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div className="text-base font-bold text-slate-950">نقطة القوة والتواصل</div>
                <p className="mt-2 text-sm text-slate-600">اختم الرسالة بأوضح ميزة، ثم أضف وسائل التواصل الأساسية.</p>
              </div>

              <input
                name="status"
                defaultValue="سجل جاهز"
                placeholder="الحالة الحالية"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="contactName"
                defaultValue="أبو يزن"
                placeholder="اسم جهة الإعلان"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="contactPhone"
                defaultValue="+963 944 000 111"
                placeholder="رقم الهاتف"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="contactWhatsApp"
                defaultValue="+963 944 000 111"
                placeholder="رقم واتساب"
                className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <input
                name="highlight"
                defaultValue="مناسبة للاستثمار والسكن العائلي"
                placeholder="أبرز نقطة قوة في العقار"
                className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <textarea
                name="description"
                rows={4}
                defaultValue="شقة واسعة في حي مطلوب، مناسبة للسكن العائلي أو للاستثمار طويل الأمد، مع إطلالة جيدة وخدمات قريبة."
                placeholder="وصف العقار"
                className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <textarea
                name="features"
                rows={3}
                defaultValue="كراج، واجهة جنوبية، كسوة حديثة، منطقة هادئة"
                placeholder="المزايا مفصولة بفاصلة عربية أو إنكليزية"
                className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <textarea
                name="suitableFor"
                rows={2}
                defaultValue="عائلات، استثمار"
                placeholder="يناسب من؟"
                className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              />

              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-base btn-primary"
                >
                  أنشئ معاينة الإعلان
                  <Eye className="h-4 w-4" />
                </button>
                <Link
                  href="/list-property/photos"
                  className="btn-base btn-secondary"
                >
                  ارفع الصور الحقيقية
                  <Camera className="h-4 w-4" />
                </Link>
                <Link
                  href="/my-properties"
                  className="btn-base btn-secondary"
                >
                  عقاراتي
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <div className="flex items-center gap-2 text-slate-950">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <h2 className="section-title text-xl font-bold sm:text-2xl">اقتراحات جاهزة للاختصار</h2>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {ownerFeatureSuggestions.map((feature) => (
                  <span key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                    {feature}
                  </span>
                ))}
              </div>
              <p className="body-soft mt-4 text-sm text-[var(--muted)]">
                اذكر 4 إلى 6 مزايا فقط. لا تحوّل الإعلان إلى قائمة طويلة.
              </p>
            </article>

            <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-300" />
                <h2 className="section-title text-xl font-bold sm:text-2xl">بعد هذه الصفحة</h2>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
                {ownerPublishingAdvantages.slice(0, 3).map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="mt-2 text-white/70">{item.description}</div>
                  </div>
                ))}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">الانتقال الطبيعي بعد تعبئة البيانات هو رفع الصور ثم مراجعة المعاينة، وليس القفز بين صفحات كثيرة.</div>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  )
}
