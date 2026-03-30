'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { PropertyGallery } from '@/components/property-gallery'
import { PropertyCard } from '@/components/property-card'
import { SearchResultsMap } from '@/components/search-results-map'
import {
  buildGalleryFromLocalPhotos,
  filterLocalListings,
  isLocalListingPublic,
  loadLocalMarketplaceListings,
  mapLocalListingToProperty,
  subscribeLocalListings,
} from '@/lib/local-marketplace'
import { getPropertyCoverImage, getPropertyGallery, type SyrianProperty } from '@/lib/syrian-real-estate-demo'

const EMPTY_SEARCH_LOCAL_LISTINGS = [] as ReturnType<typeof loadLocalMarketplaceListings>

type SearchResultsSectionProps = {
  staticProperties: SyrianProperty[]
  filters: {
    query?: string
    type?: string
    governorate?: string
    minPrice?: number
    maxPrice?: number
    minRooms?: number
    furnishing?: string
  }
}

export function SearchResultsSection({ staticProperties, filters }: SearchResultsSectionProps) {
  const localListings = useSyncExternalStore(subscribeLocalListings, loadLocalMarketplaceListings, () => EMPTY_SEARCH_LOCAL_LISTINGS)

  const properties = useMemo(() => {
    const publicLocalProperties = filterLocalListings(localListings, filters)
      .filter((listing) => isLocalListingPublic(listing.lifecycleStatus))
      .map(mapLocalListingToProperty)

    return [...publicLocalProperties, ...staticProperties]
  }, [filters, localListings, staticProperties])

  const searchGalleryImages = useMemo(() => {
    if (properties.length === 0) {
      return []
    }

    return properties.slice(0, 5).flatMap((property, index) => {
      const localListing = localListings.find((listing) => listing.id === property.id)
      if (localListing && localListing.imageDrafts.length > 0) {
        return buildGalleryFromLocalPhotos(localListing.imageDrafts).slice(0, index === 0 ? 3 : 1)
      }

      if (index === 0) {
        return getPropertyGallery(property).slice(0, 3)
      }

      return [{
        src: getPropertyCoverImage(property),
        label: property.title,
        alt: `صورة رئيسية لعقار ${property.title}`,
      }]
    }).slice(0, 5)
  }, [localListings, properties])

  return (
    <>
      <section className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-slate-950">عدد النتائج</div>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              لديك الآن <span className="font-bold text-slate-950">{properties.length}</span> فرصة يمكن مقارنتها واختيار الأنسب منها.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">إذا كانت كثيرة</div>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">أضف السعر أو الغرف أو الفرش لتضييقها.</p>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">إذا كانت قليلة</div>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">أزل بعض الفلاتر أو جرّب محافظة أو كلمة أوسع.</p>
          </div>
        </div>
      </section>

      {properties.length > 0 ? <SearchResultsMap properties={properties} /> : null}

      {searchGalleryImages.length > 0 ? (
        <PropertyGallery
          title="لمحة سريعة من النتائج"
            description="لقطات سريعة تساعدك على مقارنة العروض بصرياً قبل فتح التفاصيل الكاملة أو طلب التواصل."
          images={searchGalleryImages}
        />
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {properties.length > 0 ? (
          properties.map((property) => <PropertyCard key={property.id} property={property} />)
        ) : (
          <div className="xl:col-span-2 rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-[0_20px_60px_rgba(16,42,67,0.06)]">
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">لا توجد نتائج مطابقة حالياً</h2>
            <p className="body-soft mt-3 text-sm text-[var(--muted)]">
              جرّب توسيع نطاق البحث أو إزالة بعض الفلاتر، فقد تكون الفرصة المناسبة بانتظار تعديل صغير فقط.
            </p>
          </div>
        )}
      </section>
    </>
  )
}