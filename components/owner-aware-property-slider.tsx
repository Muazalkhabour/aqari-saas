'use client'

import { useMemo } from 'react'
import { Camera, DatabaseZap } from 'lucide-react'
import type { PropertyGalleryImage } from '@/lib/syrian-real-estate-demo'
import { PropertyImageSlider } from '@/components/property-image-slider'
import { useOwnerDraftPhotos } from '@/components/use-owner-draft-photos'

type OwnerAwarePropertySliderProps = {
  title: string
  fallbackImages: PropertyGalleryImage[]
  preferredImages?: PropertyGalleryImage[]
}

export function OwnerAwarePropertySlider({ title, fallbackImages, preferredImages }: OwnerAwarePropertySliderProps) {
  const ownerPhotos = useOwnerDraftPhotos()

  const images = useMemo(() => {
    if (preferredImages && preferredImages.length > 0) {
      return preferredImages
    }

    if (ownerPhotos.length === 0) {
      return fallbackImages
    }

    return ownerPhotos.map((photo, index) => ({
      src: photo.previewUrl,
      label: index === 0 ? 'الصورة الرئيسية المرفوعة' : `صورة مرفوعة ${index + 1}`,
      alt: `صورة حقيقية مرفوعة ${index + 1}`,
    }))
  }, [fallbackImages, ownerPhotos, preferredImages])

  const helperText = preferredImages && preferredImages.length > 0
    ? 'تُعرض هنا الصور المحفوظة مع هذا الإعلان المحلي المنشور'
    : ownerPhotos.length > 0
      ? 'تُعرض هنا صور حقيقية مرفوعة محلياً من نفس المتصفح'
      : 'لا توجد صور حقيقية مرفوعة في هذا المتصفح، لذلك تظهر صور العرض الافتراضية'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${(preferredImages && preferredImages.length > 0) || ownerPhotos.length > 0 ? 'bg-emerald-700/10 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
          {(preferredImages && preferredImages.length > 0) || ownerPhotos.length > 0 ? <Camera className="h-4 w-4" /> : <DatabaseZap className="h-4 w-4" />}
          {helperText}
        </div>
      </div>

      <PropertyImageSlider title={title} images={images} />
    </div>
  )
}