import Link from 'next/link'
import { Bath, BedDouble, CircleDollarSign, MapPin, Ruler, ShieldCheck, Sparkles } from 'lucide-react'
import { PropertyPreviewVisual } from '@/components/property-preview-visual'
import type { SyrianProperty } from '@/lib/syrian-real-estate-demo'

type PropertyCardProps = {
  property: SyrianProperty
  compact?: boolean
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(16,42,67,0.12)]">
      <div className="absolute left-0 top-0 h-36 w-36 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-600/10 blur-3xl transition group-hover:bg-emerald-600/15" />
      <div className="relative space-y-5">
        <Link href={`/properties/${property.id}`} className="block">
          <PropertyPreviewVisual property={property} compact={compact} />
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold text-white ${property.type === 'بيع' ? 'bg-orange-500' : 'bg-emerald-700'}`}>
                {property.type}
              </span>
              <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                {property.ownership}
              </span>
            </div>
            <h3 className="card-title text-xl font-bold text-slate-950 sm:text-2xl">
              <Link href={`/properties/${property.id}`} className="transition hover:text-emerald-800">
                {property.title}
              </Link>
            </h3>
            <div className="flex items-start gap-2 text-sm text-[var(--muted)]">
              <MapPin className="h-4 w-4 text-emerald-800" />
              <span className="min-w-0 break-words">
                {property.governorate} - {property.district} - {property.neighborhood}
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-right text-white sm:w-auto">
            <div className="stat-label !text-white/60">السعر</div>
            <div className="mt-1 text-sm font-bold">{property.priceLabel}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Ruler className="h-4 w-4" />
              المساحة
            </div>
            <div className="mt-1 font-bold text-slate-950">{property.areaSqm} م²</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <BedDouble className="h-4 w-4" />
              الغرف
            </div>
            <div className="mt-1 font-bold text-slate-950">{property.rooms} غرف</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Bath className="h-4 w-4" />
              الحمامات
            </div>
            <div className="mt-1 font-bold text-slate-950">{property.bathrooms}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <CircleDollarSign className="h-4 w-4" />
              الفرش
            </div>
            <div className="mt-1 font-bold text-slate-950">{property.furnishing}</div>
          </div>
        </div>

        {!compact ? <p className="body-soft line-clamp-3 text-sm text-[var(--muted)]">{property.description}</p> : null}

        <div className="rounded-2xl border border-dashed border-slate-200 bg-[var(--surface-strong)] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Sparkles className="h-4 w-4 text-amber-600" />
            لماذا قد يناسبك؟
          </div>
          <p className="body-soft mt-2 text-sm text-[var(--muted)]">{property.highlight}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.features.slice(0, compact ? 3 : 5).map((feature) => (
            <span key={feature} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            الجهة المعلنة: {property.contactName}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/properties/${property.id}`}
              className="btn-base btn-primary btn-sm"
            >
              عرض التفاصيل
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}