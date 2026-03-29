'use client'

import dynamic from 'next/dynamic'
import type { SyrianProperty } from '@/lib/syrian-real-estate-demo'

const SearchResultsMapClient = dynamic(
  () => import('@/components/search-results-map-client').then((module) => module.SearchResultsMapClient),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="h-[28rem] animate-pulse rounded-[24px] bg-[var(--surface)]" />
      </section>
    ),
  }
)

type SearchResultsMapProps = {
  properties: SyrianProperty[]
}

export function SearchResultsMap({ properties }: SearchResultsMapProps) {
  return <SearchResultsMapClient properties={properties} />
}