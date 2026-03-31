'use client'

import Link from 'next/link'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { ArrowLeft, Bath, BedDouble, Building2, CircleDollarSign, Copy, MapPin, MessageCircle, Ruler, Send, Share2, ShieldCheck, Sparkles } from 'lucide-react'
import { LocalContactRequestForm } from '@/components/local-contact-request-form'
import { OwnerAwarePropertySlider } from '@/components/owner-aware-property-slider'
import { PropertyCard } from '@/components/property-card'
import {
  buildGalleryFromLocalPhotos,
  findLocalListingById,
  isLocalListingPublic,
  loadLocalMarketplaceListings,
  mapLocalListingToProperty,
  subscribeLocalListings,
} from '@/lib/local-marketplace'
import type { PropertyGalleryImage, SyrianProperty } from '@/lib/syrian-real-estate-demo'

const EMPTY_LOCAL_LISTINGS = [] as ReturnType<typeof loadLocalMarketplaceListings>

type PropertyDetailsPageClientProps = {
  propertyId: string
  initialProperty: SyrianProperty | null
  initialGallery: PropertyGalleryImage[]
  initialSimilarProperties: SyrianProperty[]
  shareUrl: string
}

export function PropertyDetailsPageClient({
  propertyId,
  initialProperty,
  initialGallery,
  initialSimilarProperties,
  shareUrl,
}: PropertyDetailsPageClientProps) {
  const localListings = useSyncExternalStore(subscribeLocalListings, loadLocalMarketplaceListings, () => EMPTY_LOCAL_LISTINGS)
  const [currentShareUrl] = useState(() => (typeof window === 'undefined' ? shareUrl : window.location.href))
  const [copyFeedback, setCopyFeedback] = useState('نسخ الرابط')

  const localListing = useMemo(() => {
    if (initialProperty) {
      return null
    }

    return localListings.find((listing) => listing.id === propertyId) ?? findLocalListingById(propertyId)
  }, [initialProperty, localListings, propertyId])

  const property = initialProperty ?? (localListing ? mapLocalListingToProperty(localListing) : null)
  const preferredImages = localListing && localListing.imageDrafts.length > 0
    ? buildGalleryFromLocalPhotos(localListing.imageDrafts)
    : undefined

  const similarProperties = useMemo(() => {
    if (!property) {
      return []
    }

    if (initialProperty) {
      return initialSimilarProperties
    }

    return localListings
      .filter((listing) => listing.id !== property.id && isLocalListingPublic(listing.lifecycleStatus))
      .map(mapLocalListingToProperty)
      .filter((item) => item.governorate === property.governorate || item.type === property.type)
      .slice(0, 2)
  }, [initialProperty, initialSimilarProperties, localListings, property])

  if (!property) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <h1 className="text-2xl font-bold text-slate-950">العقار غير موجود</h1>
          <p className="body-soft mt-3 text-sm text-[var(--muted)]">قد يكون هذا العقار غير متاح حالياً. تصفح أحدث العروض أو سجّل اهتمامك لمتابعة كل جديد.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/search" className="btn-base btn-primary">العودة إلى البحث</Link>
            <Link href="/my-properties" className="btn-base btn-secondary">لوحة عقاراتي</Link>
          </div>
        </div>
      </main>
    )
  }

  const shareText = `شاهد ${property.title} في ${property.governorate} بسعر ${property.priceLabel} على عقاري سوريا`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentShareUrl}`)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(shareText)}`

  async function handleNativeShare() {
    if (typeof navigator === 'undefined' || !navigator.share) {
      await handleCopyLink()
      return
    }

    try {
      await navigator.share({
        title: `${property.title} | عقاري سوريا`,
        text: shareText,
        url: currentShareUrl,
      })
    } catch {
    }
  }

  async function handleCopyLink() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(currentShareUrl)
    setCopyFeedback('تم النسخ')
    window.setTimeout(() => setCopyFeedback('نسخ الرابط'), 1800)
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <Building2 className="h-4 w-4" />
                تفاصيل العقار
              </div>
              <h1 className="hero-title mt-4 max-w-[40rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">{property.title}</span>
                <span className="hero-line mt-2 sm:mt-3">في <span className="hero-highlight">{property.governorate}</span> - {property.neighborhood}</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">راجع الصور والسعر والمواصفات أولاً، ثم قرر إن كنت تريد التواصل.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="btn-base btn-secondary">
                العودة للبحث
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <OwnerAwarePropertySlider title={property.title} fallbackImages={initialGallery} preferredImages={preferredImages} />

          <aside className="space-y-6">
            <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${property.type === 'بيع' ? 'bg-orange-500' : 'bg-emerald-700'}`}>
                      {property.type}
                    </span>
                    <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{property.ownership}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
                    <MapPin className="h-4 w-4 text-emerald-800" />
                    <span>{property.governorate} - {property.district} - {property.neighborhood}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                  <div className="stat-label !text-white/60">السعر</div>
                  <div className="mt-1 text-sm font-bold">{property.priceLabel}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><div className="flex items-center gap-2 text-[var(--muted)]"><Ruler className="h-4 w-4" />المساحة</div><div className="mt-1 font-bold text-slate-950">{property.areaSqm} م²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><div className="flex items-center gap-2 text-[var(--muted)]"><BedDouble className="h-4 w-4" />الغرف</div><div className="mt-1 font-bold text-slate-950">{property.rooms} غرف</div></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><div className="flex items-center gap-2 text-[var(--muted)]"><Bath className="h-4 w-4" />الحمامات</div><div className="mt-1 font-bold text-slate-950">{property.bathrooms}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><div className="flex items-center gap-2 text-[var(--muted)]"><CircleDollarSign className="h-4 w-4" />الفرش</div><div className="mt-1 font-bold text-slate-950">{property.furnishing}</div></div>
              </div>

              <p className="body-soft mt-5 line-clamp-4 text-sm text-[var(--muted)]">{property.description}</p>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-[var(--surface-strong)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Sparkles className="h-4 w-4 text-amber-600" />أبرز نقطة قوة</div>
                <p className="body-soft mt-2 text-sm text-[var(--muted)]">{property.highlight}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {property.features.map((feature) => (
                  <span key={feature} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{feature}</span>
                ))}
              </div>

              <div className="mt-5 rounded-[28px] border border-emerald-900/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.03),rgba(5,150,105,0.08))] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Share2 className="h-4 w-4 text-emerald-700" />
                  شارك هذا العقار بسرعة
                </div>
                <p className="body-soft mt-2 text-sm text-[var(--muted)]">أرسل الرابط مباشرة عبر واتساب أو تلغرام، أو انسخه للمشاركة اليدوية.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={handleNativeShare} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
                    <Share2 className="h-4 w-4" />
                    مشاركة سريعة
                  </button>
                  <button type="button" onClick={handleCopyLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-700/30 hover:text-emerald-800">
                    <Copy className="h-4 w-4" />
                    {copyFeedback}
                  </button>
                  <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-700/15 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100">
                    <MessageCircle className="h-4 w-4" />
                    واتساب
                  </a>
                  <a href={telegramShareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-500/15 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100">
                    <Send className="h-4 w-4" />
                    تلغرام
                  </a>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                الجهة المعلنة: {property.contactName}
              </div>
            </article>

            <LocalContactRequestForm listingId={property.id} listingTitle={property.title} />

            <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
              <h2 className="section-title text-xl font-bold sm:text-2xl">كيف تقرأ هذه الصفحة؟</h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">ابدأ بالصور والسعر لأنهما أسرع عنصرين للحسم.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">بعدها راجع المواصفات ونقطة القوة فقط.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">إذا بقي العقار مناسباً لك، استخدم نموذج التواصل مباشرة.</div>
              </div>
            </article>
          </aside>
        </section>

        {similarProperties.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">عقارات مشابهة</h2>
              <p className="body-soft mt-2 text-sm text-[var(--muted)]">عروض قريبة للمقارنة السريعة.</p>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {similarProperties.map((item) => (
                <PropertyCard key={item.id} property={item} compact />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}