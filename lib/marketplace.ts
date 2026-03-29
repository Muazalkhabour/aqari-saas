import type { Prisma } from '@prisma/client'
import { prisma } from '@/prisma'
import type { PropertyGalleryImage, SyrianProperty } from '@/lib/syrian-real-estate-demo'

type ListingLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'REVIEW' | 'RESERVED' | 'SOLD' | 'RENTED' | 'REJECTED'
type ListingOfferType = 'SALE' | 'RENT'

type ListingWithImages = Prisma.MarketplaceListingGetPayload<{
  include: {
    images: {
      select: {
        url: true
        caption: true
        sortOrder: true
        isPrimary: true
      }
    }
    owner: {
      select: {
        id: true
        fullName: true
        phone: true
      }
    }
  }
}>

export type MarketplaceCardRecord = {
  listingId: string
  slug: string
  property: SyrianProperty
  coverImageSrc?: string
  galleryImages: PropertyGalleryImage[]
}

export type MarketplaceFilters = {
  query?: string
  type?: string
  governorate?: string
  minPrice?: number
  maxPrice?: number
  minRooms?: number
  furnishing?: string
}

export const marketplaceStatusLabels: Record<ListingLifecycleStatus, string> = {
  DRAFT: 'مسودة',
  PUBLISHED: 'منشور',
  REVIEW: 'قيد المراجعة',
  RESERVED: 'محجوز',
  SOLD: 'مباع',
  RENTED: 'مؤجر',
  REJECTED: 'مرفوض',
}

export const marketplaceStatusTones: Record<ListingLifecycleStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PUBLISHED: 'bg-emerald-700/10 text-emerald-900',
  REVIEW: 'bg-amber-500/10 text-amber-900',
  RESERVED: 'bg-sky-500/10 text-sky-900',
  SOLD: 'bg-slate-900/10 text-slate-800',
  RENTED: 'bg-slate-900/10 text-slate-800',
  REJECTED: 'bg-rose-500/10 text-rose-900',
}

export function isMarketplaceListingPublic(status: ListingLifecycleStatus) {
  return status === 'PUBLISHED' || status === 'RESERVED'
}

function listingOfferTypeToPropertyType(offerType: ListingOfferType): SyrianProperty['type'] {
  return offerType === 'SALE' ? 'بيع' : 'إيجار'
}

function buildGalleryImages(images: ListingWithImages['images'], title: string) {
  return images.map((image, index) => ({
    src: image.url,
    label: image.caption || (index === 0 ? 'الصورة الرئيسية' : `صورة ${index + 1}`),
    alt: image.caption || `صورة للعقار ${title}`,
  }))
}

export function marketplaceListingToPropertyRecord(listing: ListingWithImages): MarketplaceCardRecord {
  const galleryImages = buildGalleryImages(listing.images, listing.title)
  const primaryImage = listing.images.find((image) => image.isPrimary)?.url || listing.images[0]?.url

  return {
    listingId: listing.id,
    slug: listing.slug,
    coverImageSrc: primaryImage,
    galleryImages,
    property: {
      id: listing.slug,
      type: listingOfferTypeToPropertyType(listing.offerType),
      title: listing.title,
      governorate: listing.governorate,
      district: listing.district,
      neighborhood: listing.neighborhood,
      priceLabel: listing.priceLabel,
      priceValue: Number(listing.priceValue),
      currency: 'USD',
      paymentPeriod: (listing.paymentPeriod as SyrianProperty['paymentPeriod'] | null) ?? undefined,
      areaSqm: listing.areaSqm ?? 0,
      rooms: listing.rooms ?? 0,
      bathrooms: listing.bathrooms ?? 0,
      floor: listing.floor || 'غير محدد',
      furnishing: (listing.furnishing as SyrianProperty['furnishing'] | null) ?? 'غير مفروش',
      ownership: (listing.ownership as SyrianProperty['ownership'] | null) ?? 'مالك مباشر',
      status: marketplaceStatusLabels[listing.lifecycleStatus],
      description: listing.description || 'لا يوجد وصف إضافي لهذا الإعلان حالياً.',
      highlight: listing.highlight || 'إعلان منشور عبر المنصة',
      features: listing.features,
      suitableFor: listing.suitableFor,
      contactName: listing.contactName || listing.owner.fullName,
    },
  }
}

function buildPublishedWhere(filters: MarketplaceFilters): Prisma.MarketplaceListingWhereInput {
  const query = filters.query?.trim()

  return {
    lifecycleStatus: { in: ['PUBLISHED', 'RESERVED'] },
    ...(filters.type && filters.type !== 'الكل'
      ? { offerType: filters.type === 'بيع' ? 'SALE' : 'RENT' }
      : {}),
    ...(filters.governorate && filters.governorate !== 'الكل'
      ? { governorate: filters.governorate }
      : {}),
    ...(filters.furnishing && filters.furnishing !== 'الكل'
      ? { furnishing: filters.furnishing }
      : {}),
    ...(filters.minPrice || filters.maxPrice
      ? {
          priceValue: {
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.minRooms ? { rooms: { gte: filters.minRooms } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { governorate: { contains: query, mode: 'insensitive' } },
            { district: { contains: query, mode: 'insensitive' } },
            { neighborhood: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { highlight: { contains: query, mode: 'insensitive' } },
            { features: { has: query } },
            { suitableFor: { has: query } },
          ],
        }
      : {}),
  }
}

const marketplaceListingInclude = {
  images: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
    select: {
      url: true,
      caption: true,
      sortOrder: true,
      isPrimary: true,
    },
  },
  owner: {
    select: {
      id: true,
      fullName: true,
      phone: true,
    },
  },
}

export async function getPublishedMarketplaceListings(filters: MarketplaceFilters) {
  const listings = await prisma.marketplaceListing.findMany({
    where: buildPublishedWhere(filters),
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    include: marketplaceListingInclude,
  })

  return listings.map((listing: ListingWithImages) => marketplaceListingToPropertyRecord(listing))
}

export async function getOwnerMarketplaceListings(ownerId: string) {
  const listings = await prisma.marketplaceListing.findMany({
    where: { ownerId },
    orderBy: [{ updatedAt: 'desc' }],
    include: {
      ...marketplaceListingInclude,
      contactRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return listings
}

export async function getOwnerMarketplaceListingById(ownerId: string, listingId: string) {
  return prisma.marketplaceListing.findFirst({
    where: { id: listingId, ownerId },
    include: {
      ...marketplaceListingInclude,
      contactRequests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getMarketplaceListingByIdentifier(identifier: string) {
  const listing = await prisma.marketplaceListing.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
      lifecycleStatus: { in: ['PUBLISHED', 'RESERVED'] },
    },
    include: marketplaceListingInclude,
  })

  if (!listing) {
    return null
  }

  return marketplaceListingToPropertyRecord(listing)
}

export async function getSimilarMarketplaceListings(listingId: string, governorate: string, offerType: ListingOfferType, limit = 2) {
  const listings = await prisma.marketplaceListing.findMany({
    where: {
      id: { not: listingId },
      lifecycleStatus: { in: ['PUBLISHED', 'RESERVED'] },
      OR: [{ governorate }, { offerType }],
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: marketplaceListingInclude,
  })

  return listings.map((listing: ListingWithImages) => marketplaceListingToPropertyRecord(listing))
}