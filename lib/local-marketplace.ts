import type { SyrianProperty } from '@/lib/syrian-real-estate-demo'
import { loadOwnerDraftPhotos, type OwnerDraftPhoto } from '@/lib/owner-photo-draft'

export type LocalListingStatus = 'draft' | 'published' | 'review' | 'reserved' | 'sold' | 'rented'

export type LocalContactRequest = {
  id: string
  listingId: string
  listingTitle: string
  fullName: string
  phone: string
  message: string
  preferredTime: string
  createdAt: string
  status: 'new' | 'contacted' | 'closed'
}

export type LocalMarketplaceListing = {
  id: string
  title: string
  governorate: string
  district: string
  neighborhood: string
  type: SyrianProperty['type']
  priceLabel: string
  priceValue: number
  paymentPeriod?: SyrianProperty['paymentPeriod']
  areaSqm: number
  rooms: number
  bathrooms: number
  floor: string
  furnishing: SyrianProperty['furnishing']
  ownership: SyrianProperty['ownership']
  status: string
  description: string
  highlight: string
  features: string[]
  suitableFor: string[]
  contactName: string
  contactPhone: string
  contactWhatsApp: string
  lifecycleStatus: LocalListingStatus
  isVerified: boolean
  createdAt: string
  publishedAt: string
  imageDrafts: OwnerDraftPhoto[]
}

export const LOCAL_MARKETPLACE_LISTINGS_KEY = 'aqari-local-marketplace-listings'
export const LOCAL_CONTACT_REQUESTS_KEY = 'aqari-local-contact-requests'

const listingListeners = new Set<() => void>()
const requestListeners = new Set<() => void>()
const emptyListings: LocalMarketplaceListing[] = []
const emptyRequests: LocalContactRequest[] = []
let listingsRawCache: string | null = null
let listingsValueCache: LocalMarketplaceListing[] = emptyListings
let requestsRawCache: string | null = null
let requestsValueCache: LocalContactRequest[] = emptyRequests

function notifyListeners(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener())
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function safelyWriteArray<T>(key: string, items: T[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(items))
}

function readCachedListings() {
  if (!isBrowser()) {
    return listingsValueCache
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_MARKETPLACE_LISTINGS_KEY)
    if (!raw) {
      listingsRawCache = null
      listingsValueCache = emptyListings
      return listingsValueCache
    }

    if (raw === listingsRawCache) {
      return listingsValueCache
    }

    const parsed = JSON.parse(raw) as LocalMarketplaceListing[]
    listingsRawCache = raw
    listingsValueCache = Array.isArray(parsed) ? parsed : emptyListings
    return listingsValueCache
  } catch {
    listingsRawCache = null
    listingsValueCache = emptyListings
    return listingsValueCache
  }
}

function readCachedRequests() {
  if (!isBrowser()) {
    return requestsValueCache
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CONTACT_REQUESTS_KEY)
    if (!raw) {
      requestsRawCache = null
      requestsValueCache = emptyRequests
      return requestsValueCache
    }

    if (raw === requestsRawCache) {
      return requestsValueCache
    }

    const parsed = JSON.parse(raw) as LocalContactRequest[]
    requestsRawCache = raw
    requestsValueCache = Array.isArray(parsed) ? parsed : emptyRequests
    return requestsValueCache
  } catch {
    requestsRawCache = null
    requestsValueCache = emptyRequests
    return requestsValueCache
  }
}

export function subscribeLocalListings(listener: () => void) {
  listingListeners.add(listener)
  return () => listingListeners.delete(listener)
}

export function subscribeLocalContactRequests(listener: () => void) {
  requestListeners.add(listener)
  return () => requestListeners.delete(listener)
}

export function loadLocalMarketplaceListings() {
  return readCachedListings()
}

export function saveLocalMarketplaceListings(items: LocalMarketplaceListing[]) {
  listingsValueCache = items
  listingsRawCache = JSON.stringify(items)
  safelyWriteArray(LOCAL_MARKETPLACE_LISTINGS_KEY, items)
  notifyListeners(listingListeners)
}

export function loadLocalContactRequests() {
  return readCachedRequests()
}

export function saveLocalContactRequests(items: LocalContactRequest[]) {
  requestsValueCache = items
  requestsRawCache = JSON.stringify(items)
  safelyWriteArray(LOCAL_CONTACT_REQUESTS_KEY, items)
  notifyListeners(requestListeners)
}

export function listingStatusLabel(status: LocalListingStatus) {
  switch (status) {
    case 'draft':
      return 'مسودة'
    case 'published':
      return 'منشور'
    case 'review':
      return 'قيد المراجعة'
    case 'reserved':
      return 'محجوز'
    case 'sold':
      return 'مباع'
    case 'rented':
      return 'مؤجر'
  }
}

export function listingStatusTone(status: LocalListingStatus) {
  switch (status) {
    case 'published':
      return 'bg-emerald-700/10 text-emerald-900'
    case 'review':
      return 'bg-amber-500/10 text-amber-900'
    case 'reserved':
      return 'bg-sky-500/10 text-sky-900'
    case 'sold':
    case 'rented':
      return 'bg-slate-900/10 text-slate-800'
    case 'draft':
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function buildLocalListingId() {
  return `owner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function mapLocalListingToProperty(listing: LocalMarketplaceListing): SyrianProperty {
  return {
    id: listing.id,
    type: listing.type,
    title: listing.title,
    governorate: listing.governorate,
    district: listing.district,
    neighborhood: listing.neighborhood,
    priceLabel: listing.priceLabel,
    priceValue: listing.priceValue,
    currency: 'USD',
    paymentPeriod: listing.paymentPeriod,
    areaSqm: listing.areaSqm,
    rooms: listing.rooms,
    bathrooms: listing.bathrooms,
    floor: listing.floor,
    furnishing: listing.furnishing,
    ownership: listing.ownership,
    status: listing.status,
    description: listing.description,
    highlight: listing.highlight,
    features: listing.features,
    suitableFor: listing.suitableFor,
    contactName: listing.contactName,
  }
}

export function buildGalleryFromLocalPhotos(photos: OwnerDraftPhoto[]) {
  return photos.map((photo, index) => ({
    src: photo.previewUrl,
    label: index === 0 ? 'الصورة الرئيسية المرفوعة' : `صورة مرفوعة ${index + 1}`,
    alt: `صورة حقيقية مرفوعة ${index + 1}`,
  }))
}

export function isLocalListingPublic(status: LocalListingStatus) {
  return status === 'published' || status === 'reserved'
}

export function findLocalListingById(id: string) {
  return loadLocalMarketplaceListings().find((listing) => listing.id === id) ?? null
}

export function createListingFromFormData(formData: FormData): LocalMarketplaceListing {
  const type = String(formData.get('type') || 'بيع') as SyrianProperty['type']
  const paymentPeriod = String(formData.get('paymentPeriod') || (type === 'بيع' ? 'مرة واحدة' : 'شهري')) as SyrianProperty['paymentPeriod']
  const priceValue = Number(formData.get('price') || (type === 'بيع' ? 50000 : 250))
  const formattedPrice = new Intl.NumberFormat('en-US').format(priceValue)
  const priceLabel = type === 'بيع'
    ? `${formattedPrice} دولار`
    : paymentPeriod === 'سنوي'
      ? `${formattedPrice} دولار سنوياً`
      : `${formattedPrice} دولار شهرياً`

  const split = (value: FormDataEntryValue | null, fallback: string[]) => {
    if (!value) {
      return fallback
    }

    const normalized = String(value).trim()
    if (!normalized) {
      return fallback
    }

    return normalized.split(/[،،,]/).map((item) => item.trim()).filter(Boolean)
  }

  const now = new Date().toISOString()

  return {
    id: buildLocalListingId(),
    title: String(formData.get('title') || 'شقة جديدة جاهزة للنشر'),
    governorate: String(formData.get('governorate') || 'دمشق'),
    district: String(formData.get('district') || 'المزة'),
    neighborhood: String(formData.get('neighborhood') || 'المزة الغربية'),
    type,
    priceLabel,
    priceValue,
    paymentPeriod,
    areaSqm: Number(formData.get('areaSqm') || 120),
    rooms: Number(formData.get('rooms') || 3),
    bathrooms: Number(formData.get('bathrooms') || 2),
    floor: String(formData.get('floor') || 'الطابق الثالث'),
    furnishing: String(formData.get('furnishing') || 'غير مفروش') as SyrianProperty['furnishing'],
    ownership: String(formData.get('ownership') || 'مالك مباشر') as SyrianProperty['ownership'],
    status: String(formData.get('status') || 'جاهزة للسكن'),
    description: String(formData.get('description') || 'إعلان جديد ببيانات محلية محفوظة داخل المتصفح.'),
    highlight: String(formData.get('highlight') || 'إعلان محلي جاهز للعرض'),
    features: split(formData.get('features'), ['مياه مستقرة', 'مصعد', 'منطقة هادئة']),
    suitableFor: split(formData.get('suitableFor'), ['عائلات']),
    contactName: String(formData.get('contactName') || 'المالك'),
    contactPhone: String(formData.get('contactPhone') || '+963 000 000 000'),
    contactWhatsApp: String(formData.get('contactWhatsApp') || ''),
    lifecycleStatus: 'published',
    isVerified: false,
    createdAt: now,
    publishedAt: now,
    imageDrafts: loadOwnerDraftPhotos(),
  }
}

export function upsertLocalListing(listing: LocalMarketplaceListing) {
  const current = loadLocalMarketplaceListings()
  const existingIndex = current.findIndex((item) => item.id === listing.id)

  if (existingIndex >= 0) {
    current[existingIndex] = listing
    saveLocalMarketplaceListings(current)
    return listing
  }

  saveLocalMarketplaceListings([listing, ...current])
  return listing
}

export function deleteLocalListing(id: string) {
  const next = loadLocalMarketplaceListings().filter((listing) => listing.id !== id)
  saveLocalMarketplaceListings(next)
}

export function updateLocalListingStatus(id: string, status: LocalListingStatus) {
  const next = loadLocalMarketplaceListings().map((listing) =>
    listing.id === id ? { ...listing, lifecycleStatus: status } : listing
  )
  saveLocalMarketplaceListings(next)
}

export function createLocalContactRequest(input: Omit<LocalContactRequest, 'id' | 'createdAt' | 'status'>) {
  const request: LocalContactRequest = {
    ...input,
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  }

  saveLocalContactRequests([request, ...loadLocalContactRequests()])
  return request
}

export function filterLocalListings(listings: LocalMarketplaceListing[], filters: {
  type?: string
  governorate?: string
  minPrice?: number
  maxPrice?: number
  minRooms?: number
  furnishing?: string
  query?: string
}) {
  return listings.filter((listing) => {
    if (filters.type && filters.type !== 'الكل' && listing.type !== filters.type) {
      return false
    }

    if (filters.governorate && filters.governorate !== 'الكل' && listing.governorate !== filters.governorate) {
      return false
    }

    if (filters.furnishing && filters.furnishing !== 'الكل' && listing.furnishing !== filters.furnishing) {
      return false
    }

    if (filters.minPrice && listing.priceValue < filters.minPrice) {
      return false
    }

    if (filters.maxPrice && listing.priceValue > filters.maxPrice) {
      return false
    }

    if (filters.minRooms && listing.rooms < filters.minRooms) {
      return false
    }

    if (filters.query) {
      const query = filters.query.trim()
      if (query) {
        const haystack = [
          listing.title,
          listing.governorate,
          listing.district,
          listing.neighborhood,
          listing.description,
          listing.highlight,
          listing.contactName,
          ...listing.features,
          ...listing.suitableFor,
        ].join(' ')

        if (!haystack.includes(query)) {
          return false
        }
      }
    }

    return true
  })
}