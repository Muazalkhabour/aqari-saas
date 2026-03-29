'use client'

import { useEffect, useState } from 'react'
import { loadOwnerDraftPhotos, subscribeOwnerDraftPhotos, type OwnerDraftPhoto } from '@/lib/owner-photo-draft'

export function useOwnerDraftPhotos() {
  const [photos, setPhotos] = useState<OwnerDraftPhoto[]>(() => loadOwnerDraftPhotos())

  useEffect(() => {
    return subscribeOwnerDraftPhotos(() => {
      setPhotos(loadOwnerDraftPhotos())
    })
  }, [])

  return photos
}