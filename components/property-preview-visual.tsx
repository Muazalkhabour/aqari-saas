import Image from 'next/image'
import { BedDouble, MapPin, Waves } from 'lucide-react'
import { getPropertyCoverImage, type SyrianProperty } from '@/lib/syrian-real-estate-demo'

type PropertyPreviewVisualProps = {
  property: SyrianProperty
  compact?: boolean
}

export function PropertyPreviewVisual({ property, compact = false }: PropertyPreviewVisualProps) {
  const imagePath = getPropertyCoverImage(property)
  const isCoastal = property.governorate === 'اللاذقية' || property.governorate === 'طرطوس'
  const isFurnished = property.furnishing === 'مفروش' || property.furnishing === 'نصف مفروش'
  const heightClass = compact ? 'h-52' : 'h-60'

  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-white/70 bg-slate-100 ${heightClass} shadow-[0_18px_40px_rgba(15,23,42,0.1)]`}>
      <Image
        src={imagePath}
        alt={`صورة تخيلية لشقة ${property.title} في ${property.neighborhood}`}
        fill
        sizes={compact ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 640px'}
        className="object-cover"
        priority={compact}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/8 to-white/8" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/24 to-transparent" />

      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-emerald-700" />
        <span>{property.neighborhood}</span>
      </div>

      <div className="absolute left-4 top-4 rounded-full bg-slate-950/82 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
        صورة توضيحية للعقار
      </div>

      <div className="absolute bottom-4 right-4 left-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div>
          <div className="line-clamp-1 text-sm font-bold text-slate-950">{property.title}</div>
          <div className="mt-1 text-xs text-slate-600">
            {property.rooms} غرف • {property.areaSqm} م²
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          {isCoastal ? <Waves className="h-4 w-4" /> : <BedDouble className="h-4 w-4" />}
          <span>{isCoastal ? 'إطلالة بحرية هادئة' : isFurnished ? 'فرش واضح وأجواء دافئة' : 'تصور داخلي مرتب'}</span>
        </div>
      </div>
    </div>
  )
}