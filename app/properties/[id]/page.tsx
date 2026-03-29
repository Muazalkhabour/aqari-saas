import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PropertyDetailsPageClient } from '@/components/property-details-page-client'
import { getPropertyById, getPropertyGallery, syrianProperties } from '@/lib/syrian-real-estate-demo'

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return syrianProperties.map((property) => ({ id: property.id }))
}

export async function generateMetadata({ params }: PropertyDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const property = getPropertyById(id)

  if (!property) {
    return {
      title: 'تفاصيل العقار | عقاري سوريا',
      description: 'صفحة تفاصيل عقار داخل منصة عقاري سوريا.',
    }
  }

  return {
    title: `${property.title} | عقاري سوريا`,
    description: `${property.description} السعر: ${property.priceLabel}. الموقع: ${property.governorate} - ${property.neighborhood}.`,
  }
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = await params
  const property = getPropertyById(id)

  if (!property && !id.startsWith('owner-')) {
    notFound()
  }

  const gallery = property ? getPropertyGallery(property) : []
  const similarProperties = property
    ? syrianProperties
        .filter((item) => item.id !== property.id && (item.governorate === property.governorate || item.type === property.type))
        .slice(0, 2)
    : []

  return (
    <PropertyDetailsPageClient
      propertyId={id}
      initialProperty={property ?? null}
      initialGallery={gallery}
      initialSimilarProperties={similarProperties}
    />
  )
}