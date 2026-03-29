'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Search, X, ZoomIn, ZoomOut } from 'lucide-react'
import type { PropertyGalleryImage } from '@/lib/syrian-real-estate-demo'

type PropertyImageSliderProps = {
  title: string
  images: PropertyGalleryImage[]
}

export function PropertyImageSlider({ title, images }: PropertyImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  if (images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]
  const isCurrentImageDataUrl = currentImage.src.startsWith('data:')

  const goToPrevious = () => {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  }

  const goToNext = () => {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1))
  }

  const openZoom = () => {
    setZoomLevel(1.35)
    setIsZoomOpen(true)
  }

  const closeZoom = () => {
    setIsZoomOpen(false)
    setZoomLevel(1)
  }

  const zoomIn = () => {
    setZoomLevel((level) => Math.min(level + 0.25, 2.5))
  }

  const zoomOut = () => {
    setZoomLevel((level) => Math.max(level - 0.25, 1))
  }

  return (
    <>
      <section className="rounded-[34px] border border-white/60 bg-white/92 p-5 shadow-[0_22px_70px_rgba(16,42,67,0.1)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">صور {title}</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">استعرض جميع الصور المخصصة لهذا العقار، مع تنقل سريع بين اللقطات الأساسية.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={openZoom} className="btn-base btn-secondary btn-sm">
              <Search className="h-4 w-4" />
              تكبير الصورة
            </button>
            <div className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-slate-200 bg-slate-100 p-3">
          <div className="relative overflow-hidden rounded-[24px]">
            <button type="button" onClick={openZoom} className="relative block aspect-[16/9] w-full text-right">
              <Image src={currentImage.src} alt={currentImage.alt} fill sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" priority unoptimized={isCurrentImageDataUrl} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent" />
              <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                {currentImage.label}
              </div>
            </button>

            <button
              type="button"
              onClick={goToPrevious}
              className="btn-base btn-secondary absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 !rounded-full !px-0 !py-0"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="btn-base btn-secondary absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 !rounded-full !px-0 !py-0"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${image.label}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`overflow-hidden rounded-[22px] border bg-slate-100 text-right transition ${
                index === currentIndex
                  ? 'border-emerald-700 shadow-[0_14px_28px_rgba(5,150,105,0.16)]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 33vw, 16vw" className="object-cover" unoptimized={image.src.startsWith('data:')} />
              </div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-800">{image.label}</div>
            </button>
          ))}
        </div>
      </section>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/88 p-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur">
              <div>
                <div className="text-sm font-bold">{currentImage.label}</div>
                <div className="mt-1 text-xs text-white/70">{currentIndex + 1} / {images.length}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={zoomOut} className="btn-base btn-secondary btn-sm">
                  <ZoomOut className="h-4 w-4" />
                  تصغير
                </button>
                <button type="button" onClick={zoomIn} className="btn-base btn-secondary btn-sm">
                  <ZoomIn className="h-4 w-4" />
                  تكبير
                </button>
                <button type="button" onClick={closeZoom} className="btn-base btn-primary btn-sm">
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
              <div className="relative h-full w-full overflow-auto">
                <div className="relative h-full w-full" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 160ms ease' }}>
                  <Image src={currentImage.src} alt={currentImage.alt} fill sizes="100vw" className="object-contain" priority unoptimized={isCurrentImageDataUrl} />
                </div>
              </div>

              <button type="button" onClick={goToPrevious} className="btn-base btn-secondary absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 !rounded-full !px-0 !py-0" aria-label="الصورة السابقة داخل التكبير">
                <ChevronRight className="h-5 w-5" />
              </button>

              <button type="button" onClick={goToNext} className="btn-base btn-secondary absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 !rounded-full !px-0 !py-0" aria-label="الصورة التالية داخل التكبير">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}