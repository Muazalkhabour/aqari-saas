'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Camera, DatabaseZap } from 'lucide-react'
import type { PropertyGalleryImage } from '@/lib/syrian-real-estate-demo'
import { useOwnerDraftPhotos } from '@/components/use-owner-draft-photos'

type OwnerPreviewGalleryProps = {
  fallbackImages: PropertyGalleryImage[]
}

export function OwnerPreviewGallery({ fallbackImages }: OwnerPreviewGalleryProps) {
  const ownerPhotos = useOwnerDraftPhotos()

  const galleryImages = useMemo(() => {
    if (ownerPhotos.length === 0) {
      return fallbackImages
    }

    return ownerPhotos.map((photo, index) => ({
      src: photo.previewUrl,
      label: index === 0 ? 'الصورة الرئيسية المرفوعة' : `صورة مرفوعة ${index + 1}`,
      alt: `صورة حقيقية مرفوعة ${index + 1}`,
    }))
  }, [fallbackImages, ownerPhotos])

  const [featuredImage, ...thumbnailImages] = galleryImages

  if (!featuredImage) {
    return null
  }

  return (
    <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
      <div className="max-w-3xl">
        <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">معرض صور إعلانك</h2>
        <p className="body-soft mt-2 text-sm text-[var(--muted)]">
          {ownerPhotos.length > 0
            ? 'هذه صور إعلانك الحالية كما ستظهر للباحث، فراجعها جيداً قبل النشر النهائي.'
            : 'هذه معاينة مرئية تساعدك على تخيل شكل الإعلان عندما يراه الباحث، مع ترتيب يبدأ بالصورة الأهم ثم اللقطات المساندة.'}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${ownerPhotos.length > 0 ? 'bg-emerald-700/10 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
          {ownerPhotos.length > 0 ? <Camera className="h-4 w-4" /> : <DatabaseZap className="h-4 w-4" />}
          {ownerPhotos.length > 0 ? `تم تحميل ${ownerPhotos.length} صورة لإبراز الإعلان` : 'أضف صورك لتجعل الإعلان أكثر إقناعاً وجاذبية'}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="relative aspect-[16/9]">
            <Image src={featuredImage.src} alt={featuredImage.alt} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" unoptimized={featuredImage.src.startsWith('data:')} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent" />
            <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
              الصورة الرئيسية
            </div>
            <div className="absolute right-4 bottom-4 rounded-2xl bg-white/86 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm backdrop-blur">
              {featuredImage.label}
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {thumbnailImages.slice(0, 4).map((image) => (
            <article key={`${image.src}-${image.label}`} className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[4/3]">
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" unoptimized={image.src.startsWith('data:')} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                <div className="absolute right-3 bottom-3 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
                  {image.label}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}