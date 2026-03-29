import Link from 'next/link'
import { SearchFilters } from '@/components/search-filters'
import { SearchResultsSection } from '@/components/search-results-section'
import { filterProperties } from '@/lib/syrian-real-estate-demo'

type SearchPageProps = {
  searchParams: Promise<{
    query?: string
    type?: string
    governorate?: string
    minPrice?: string
    maxPrice?: string
    minRooms?: string
    furnishing?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  const properties = filterProperties({
    query: params.query,
    type: params.type,
    governorate: params.governorate,
    furnishing: params.furnishing,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRooms: params.minRooms ? Number(params.minRooms) : undefined,
  })

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                بحث وفلترة عقارية لسوريا
              </div>
              <h1 className="hero-title mt-4 max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">ابحث عن <span className="hero-highlight">عقارات</span> للبيع أو الإيجار</span>
                <span className="hero-line mt-2 sm:mt-3">حسب <span className="hero-highlight">المحافظة</span> والميزانية</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-xl">
                نتائج البحث هنا تشمل العقارات التجريبية الموجودة في المنصة، إضافة إلى العقارات التي يقوم المالك بنشرها محلياً من نفس المتصفح.
              </p>
            </div>
            <Link href="/" className="btn-base btn-secondary">
              العودة للرئيسية
            </Link>
          </div>
        </section>

        <SearchFilters current={params} />

        <SearchResultsSection
          staticProperties={properties}
          filters={{
            query: params.query,
            type: params.type,
            governorate: params.governorate,
            furnishing: params.furnishing,
            minPrice: params.minPrice ? Number(params.minPrice) : undefined,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
            minRooms: params.minRooms ? Number(params.minRooms) : undefined,
          }}
        />
      </div>
    </main>
  )
}