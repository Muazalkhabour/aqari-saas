import Link from 'next/link'
import { Camera, CheckCircle2, Eye, RefreshCw } from 'lucide-react'
import { LocalPublishPanel } from '@/components/local-publish-panel'
import { OwnerPreviewGallery } from '@/components/owner-preview-gallery'
import { PropertyCard } from '@/components/property-card'
import { getPropertyGallery, type ListingType, type SyrianProperty } from '@/lib/syrian-real-estate-demo'

type PreviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback
  }

  return value && value.trim() ? value.trim() : fallback
}

function readNumber(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(readParam(value, String(fallback)))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function splitList(value: string | string[] | undefined, fallback: string[]) {
  const normalized = readParam(value, '')

  if (!normalized) {
    return fallback
  }

  return normalized
    .split(/[،،,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatPriceLabel(price: number, type: ListingType, paymentPeriod: string) {
  const formattedPrice = new Intl.NumberFormat('en-US').format(price)

  if (type === 'بيع') {
    return `${formattedPrice} دولار`
  }

  if (paymentPeriod === 'سنوي') {
    return `${formattedPrice} دولار سنوياً`
  }

  return `${formattedPrice} دولار شهرياً`
}

function buildPreviewProperty(searchParams: Record<string, string | string[] | undefined>): SyrianProperty {
  const type = readParam(searchParams.type, 'بيع') as ListingType
  const paymentPeriod = readParam(searchParams.paymentPeriod, type === 'بيع' ? 'مرة واحدة' : 'شهري') as
    | 'شهري'
    | 'سنوي'
    | 'مرة واحدة'
  const priceValue = readNumber(searchParams.price, type === 'بيع' ? 50000 : 250)

  return {
    id: 'owner-preview',
    type,
    title: readParam(searchParams.title, 'شقة جاهزة للعرض على المنصة'),
    governorate: readParam(searchParams.governorate, 'دمشق'),
    district: readParam(searchParams.district, 'المزة'),
    neighborhood: readParam(searchParams.neighborhood, 'المزة الغربية'),
    priceLabel: formatPriceLabel(priceValue, type, paymentPeriod),
    priceValue,
    currency: 'USD',
    paymentPeriod,
    areaSqm: readNumber(searchParams.areaSqm, 120),
    rooms: readNumber(searchParams.rooms, 3),
    bathrooms: readNumber(searchParams.bathrooms, 2),
    floor: readParam(searchParams.floor, 'الطابق الثالث'),
    furnishing: readParam(searchParams.furnishing, 'غير مفروش') as SyrianProperty['furnishing'],
    ownership: readParam(searchParams.ownership, 'مالك مباشر') as SyrianProperty['ownership'],
    status: readParam(searchParams.status, 'جاهزة للسكن'),
    description: readParam(
      searchParams.description,
      'هذه معاينة أولية للإعلان، ويمكن تحسينها لاحقاً بإضافة الصور والموقع الأدق ووسيلة التواصل.'
    ),
    highlight: readParam(searchParams.highlight, 'إعلان واضح يركز على عناصر الثقة والقرار'),
    features: splitList(searchParams.features, ['مياه مستقرة', 'مصعد', 'منطقة هادئة']),
    suitableFor: splitList(searchParams.suitableFor, ['عائلات']),
    contactName: readParam(searchParams.contactName, 'المالك'),
  }
}

export default async function ListPropertyPreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams
  const property = buildPreviewProperty(params)
  const previewGallery = getPropertyGallery(property)
  const publishValues = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? (value[0] ?? '') : (value ?? '')])
  )

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_26px_90px_rgba(16,42,67,0.14)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
                <Eye className="h-4 w-4" />
                الخطوة 3 من 3
              </div>
              <h1 className="hero-title mt-4 max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">راجع المعاينة</span>
                <span className="hero-line mt-2 sm:mt-3">ثم انشر أو عدّل</span>
              </h1>
              <p className="hero-subtitle mt-4 max-w-xl">
                هذه آخر محطة قبل النشر. إذا كان العنوان والسعر والصور واضحين هنا، فانشر وانتقل بعدها إلى لوحة المالك.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/list-property"
                className="btn-base btn-secondary"
              >
                عدّل البيانات
                <RefreshCw className="h-4 w-4" />
              </Link>
              <Link
                href="/list-property/photos"
                className="btn-base btn-primary"
              >
                ارفع الصور الحقيقية
                <Camera className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <PropertyCard property={property} />
            <OwnerPreviewGallery fallbackImages={previewGallery} />
          </div>

          <aside className="space-y-6">
            <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <div className="flex items-center gap-2 text-slate-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <h2 className="section-title text-xl font-bold sm:text-2xl">ما الذي تراجعه؟</h2>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">هل العنوان والحي والسعر واضحون من أول نظرة؟</div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">هل المواصفات كافية للمقارنة السريعة؟</div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">هل ظهرت نقطة القوة بوضوح؟</div>
              </div>
            </article>

            <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <h2 className="section-title text-xl font-bold sm:text-2xl">خطوتك التالية كمالك</h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">إذا كانت الصور ناقصة، عد لصفحة الصور الآن.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">إذا كانت البيانات مكتملة، استخدم زر النشر أدناه.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">بعد النشر ستجد الإعلان في لوحة المالك مباشرة.</div>
              </div>
            </article>

            <LocalPublishPanel values={publishValues} />
          </aside>
        </section>
      </div>
    </main>
  )
}