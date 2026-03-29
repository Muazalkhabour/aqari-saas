export type OwnerDraftPhoto = {
  id: string
  fileName: string
  sizeLabel: string
  previewUrl: string
}

export const OWNER_DRAFT_PHOTOS_KEY = 'aqari-owner-draft-photos'

const ownerDraftListeners = new Set<() => void>()
const emptyOwnerDraftPhotos: OwnerDraftPhoto[] = []
let ownerDraftPhotosCache: OwnerDraftPhoto[] = emptyOwnerDraftPhotos
let ownerDraftPhotosRawCache: string | null = null

function notifyOwnerDraftListeners() {
  ownerDraftListeners.forEach((listener) => listener())
}

function formatSizeLabel(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('تعذر قراءة الصورة'))
    }

    reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الصورة'))
    reader.readAsDataURL(file)
  })
}

async function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('تعذر تجهيز الصورة'))
    image.src = src
  })
}

async function compressImage(file: File) {
  const sourceUrl = await fileToDataUrl(file)
  const image = await loadImageElement(sourceUrl)

  const maxWidth = 1600
  const maxHeight = 1200
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const targetWidth = Math.max(1, Math.round(image.width * scale))
  const targetHeight = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    return sourceUrl
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export async function createOwnerDraftPhotos(files: File[]) {
  const limitedFiles = files.slice(0, 10)

  return Promise.all(
    limitedFiles.map(async (file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: file.name,
      sizeLabel: formatSizeLabel(file.size),
      previewUrl: await compressImage(file),
    }))
  )
}

export function loadOwnerDraftPhotos() {
  if (typeof window === 'undefined') {
    return ownerDraftPhotosCache
  }

  try {
    const raw = window.localStorage.getItem(OWNER_DRAFT_PHOTOS_KEY)
    if (!raw) {
      ownerDraftPhotosRawCache = null
      ownerDraftPhotosCache = emptyOwnerDraftPhotos
      return ownerDraftPhotosCache
    }

    if (raw === ownerDraftPhotosRawCache) {
      return ownerDraftPhotosCache
    }

    const parsed = JSON.parse(raw) as OwnerDraftPhoto[]
    ownerDraftPhotosRawCache = raw
    ownerDraftPhotosCache = Array.isArray(parsed) ? parsed : emptyOwnerDraftPhotos
    return ownerDraftPhotosCache
  } catch {
    ownerDraftPhotosRawCache = null
    ownerDraftPhotosCache = emptyOwnerDraftPhotos
    return ownerDraftPhotosCache
  }
}

export function subscribeOwnerDraftPhotos(listener: () => void) {
  ownerDraftListeners.add(listener)

  return () => {
    ownerDraftListeners.delete(listener)
  }
}

export function saveOwnerDraftPhotos(photos: OwnerDraftPhoto[]) {
  if (typeof window === 'undefined') {
    return
  }

  ownerDraftPhotosCache = photos
  ownerDraftPhotosRawCache = JSON.stringify(photos)
  window.localStorage.setItem(OWNER_DRAFT_PHOTOS_KEY, JSON.stringify(photos))
  notifyOwnerDraftListeners()
}

export function clearOwnerDraftPhotos() {
  if (typeof window === 'undefined') {
    return
  }

  ownerDraftPhotosCache = emptyOwnerDraftPhotos
  ownerDraftPhotosRawCache = null
  window.localStorage.removeItem(OWNER_DRAFT_PHOTOS_KEY)
  notifyOwnerDraftListeners()
}