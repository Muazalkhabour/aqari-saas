'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/prisma'
import { requireOwnerAccount } from '@/lib/owner-session'
import type { OwnerDraftPhoto } from '@/lib/owner-photo-draft'

type ListingLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'REVIEW' | 'RESERVED' | 'SOLD' | 'RENTED' | 'REJECTED'

type ListingPayload = {
  title: string
  governorate: string
  district: string
  neighborhood: string
  type: 'بيع' | 'إيجار'
  priceLabel: string
  priceValue: number
  paymentPeriod?: string
  areaSqm: number
  rooms: number
  bathrooms: number
  floor: string
  furnishing: string
  ownership: string
  status: string
  description: string
  highlight: string
  features: string[]
  suitableFor: string[]
  contactName: string
  contactPhone: string
  contactWhatsApp: string
}

function sanitizeList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean)
}

function buildSlug(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${base || 'listing'}-${Math.random().toString(36).slice(2, 8)}`
}

function mapOfferType(type: ListingPayload['type']) {
  return type === 'بيع' ? 'SALE' : 'RENT'
}

async function replaceListingImages(listingId: string, photos: OwnerDraftPhoto[]) {
  if (photos.length === 0) {
    return
  }

  await prisma.listingImage.deleteMany({ where: { listingId } })
  await prisma.listingImage.createMany({
    data: photos.map((photo, index) => ({
      listingId,
      url: photo.previewUrl,
      caption: index === 0 ? 'الصورة الرئيسية' : `صورة ${index + 1}`,
      sortOrder: index,
      isPrimary: index === 0,
    })),
  })
}

export async function publishListingAction(payload: ListingPayload, photos: OwnerDraftPhoto[]) {
  const owner = await requireOwnerAccount()
  const now = new Date()

  const listing = await prisma.marketplaceListing.create({
    data: {
      slug: buildSlug(payload.title),
      title: payload.title,
      description: payload.description,
      governorate: payload.governorate,
      district: payload.district,
      neighborhood: payload.neighborhood,
      offerType: mapOfferType(payload.type),
      lifecycleStatus: 'PUBLISHED',
      priceLabel: payload.priceLabel,
      priceValue: payload.priceValue,
      paymentPeriod: payload.paymentPeriod || null,
      areaSqm: payload.areaSqm,
      rooms: payload.rooms,
      bathrooms: payload.bathrooms,
      floor: payload.floor,
      furnishing: payload.furnishing,
      ownership: payload.ownership,
      highlight: payload.highlight,
      features: sanitizeList(payload.features),
      suitableFor: sanitizeList(payload.suitableFor),
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      whatsappNumber: payload.contactWhatsApp,
      publishedAt: now,
      ownerId: owner.id,
    },
  })

  await replaceListingImages(listing.id, photos)

  revalidatePath('/search')
  revalidatePath('/my-properties')
  revalidatePath(`/properties/${listing.slug}`)

  return {
    listingId: listing.id,
    slug: listing.slug,
    redirectTo: `/my-properties?highlight=${listing.id}`,
  }
}

export async function updateListingAction(listingId: string, payload: ListingPayload, photos: OwnerDraftPhoto[]) {
  const owner = await requireOwnerAccount()
  const existing = await prisma.marketplaceListing.findFirst({
    where: { id: listingId, ownerId: owner.id },
  })

  if (!existing) {
    throw new Error('الإعلان غير موجود أو لا تملك صلاحية تعديله')
  }

  const listing = await prisma.marketplaceListing.update({
    where: { id: listingId },
    data: {
      title: payload.title,
      description: payload.description,
      governorate: payload.governorate,
      district: payload.district,
      neighborhood: payload.neighborhood,
      offerType: mapOfferType(payload.type),
      priceLabel: payload.priceLabel,
      priceValue: payload.priceValue,
      paymentPeriod: payload.paymentPeriod || null,
      areaSqm: payload.areaSqm,
      rooms: payload.rooms,
      bathrooms: payload.bathrooms,
      floor: payload.floor,
      furnishing: payload.furnishing,
      ownership: payload.ownership,
      highlight: payload.highlight,
      features: sanitizeList(payload.features),
      suitableFor: sanitizeList(payload.suitableFor),
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      whatsappNumber: payload.contactWhatsApp,
    },
  })

  if (photos.length > 0) {
    await replaceListingImages(listing.id, photos)
  }

  revalidatePath('/search')
  revalidatePath('/my-properties')
  revalidatePath(`/my-properties/${listing.id}/edit`)
  revalidatePath(`/properties/${listing.slug}`)

  return {
    listingId: listing.id,
    redirectTo: `/my-properties?highlight=${listing.id}`,
  }
}

export async function updateListingStatusAction(formData: FormData) {
  const owner = await requireOwnerAccount()
  const listingId = String(formData.get('listingId') || '')
  const status = String(formData.get('status') || '') as ListingLifecycleStatus

  await prisma.marketplaceListing.updateMany({
    where: { id: listingId, ownerId: owner.id },
    data: { lifecycleStatus: status },
  })

  revalidatePath('/my-properties')
  revalidatePath('/search')
}

export async function deleteListingAction(formData: FormData) {
  const owner = await requireOwnerAccount()
  const listingId = String(formData.get('listingId') || '')

  const existing = await prisma.marketplaceListing.findFirst({
    where: { id: listingId, ownerId: owner.id },
    select: { slug: true },
  })

  if (!existing) {
    return
  }

  await prisma.marketplaceListing.delete({
    where: { id: listingId },
  })

  revalidatePath('/my-properties')
  revalidatePath('/search')
  revalidatePath(`/properties/${existing.slug}`)
}

export async function createContactRequestAction(input: {
  listingId: string
  fullName: string
  phone: string
  preferredTime: string
  message: string
}) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: input.listingId },
    select: { ownerId: true, slug: true },
  })

  if (!listing) {
    throw new Error('العقار المطلوب غير متاح حالياً')
  }

  await prisma.contactRequest.create({
    data: {
      listingId: input.listingId,
      ownerId: listing.ownerId,
      fullName: input.fullName,
      phone: input.phone,
      preferredTime: input.preferredTime,
      message: input.message,
    },
  })

  revalidatePath(`/properties/${listing.slug}`)
  revalidatePath('/my-properties')

  return { success: true }
}