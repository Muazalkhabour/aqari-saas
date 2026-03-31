import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PropertyDetailsPageClient } from '@/components/property-details-page-client'
import { getSiteUrl } from '@/lib/env'
import { getPropertyById, getPropertyCoverImage, getPropertyGallery, syrianProperties } from '@/lib/syrian-real-estate-demo'

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return syrianProperties.map((property) => ({ id: property.id }))
}

export async function generateMetadata({ params }: PropertyDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const property = getPropertyById(id)
  const siteUrl = getSiteUrl()

  if (!property) {
    return {
      title: 'تفاصيل العقار | عقاري سوريا',
      description: 'صفحة تفاصيل عقار داخل منصة عقاري سوريا.',
      openGraph: {
        title: 'تفاصيل العقار | عقاري سوريا',
        description: 'صفحة تفاصيل عقار داخل منصة عقاري سوريا.',
        url: `${siteUrl}/properties/${id}`,
        siteName: 'عقاري سوريا',
        images: [
          {
            url: '/listings/interior-luxury-1.svg',
            width: 1200,
            height: 630,
            alt: 'واجهة صفحة تفاصيل عقار في عقاري سوريا',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'تفاصيل العقار | عقاري سوريا',
        description: 'صفحة تفاصيل عقار داخل منصة عقاري سوريا.',
        images: ['/listings/interior-luxury-1.svg'],
      },
    }
  }

  const propertyUrl = `${siteUrl}/properties/${property.id}`
  const coverImage = new URL(getPropertyCoverImage(property), siteUrl).toString()
  const description = `${property.description} السعر: ${property.priceLabel}. الموقع: ${property.governorate} - ${property.neighborhood}.`

  return {
    title: property.title,
    description,
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      type: 'article',
      locale: 'ar_SY',
      url: propertyUrl,
      siteName: 'عقاري سوريا',
      title: `${property.title} | عقاري سوريا`,
      description,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `صورة معاينة لعقار ${property.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${property.title} | عقاري سوريا`,
      description,
      images: [coverImage],
    },
  }
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = await params
  const property = getPropertyById(id)
  const shareUrl = `${getSiteUrl()}/properties/${id}`

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
      shareUrl={shareUrl}
    />
  )
}