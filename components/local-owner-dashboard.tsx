'use client'

import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'
import { BellRing, Eye, HousePlus, MessageSquareMore, Trash2 } from 'lucide-react'
import {
  deleteLocalListing,
  isLocalListingPublic,
  listingStatusLabel,
  listingStatusTone,
  loadLocalContactRequests,
  loadLocalMarketplaceListings,
  subscribeLocalContactRequests,
  subscribeLocalListings,
  updateLocalListingStatus,
  type LocalListingStatus,
} from '@/lib/local-marketplace'

type LocalOwnerDashboardProps = {
  highlightId?: string
}

const statusOptions: LocalListingStatus[] = ['published', 'review', 'reserved', 'sold', 'rented', 'draft']
const EMPTY_LISTINGS = [] as ReturnType<typeof loadLocalMarketplaceListings>
const EMPTY_REQUESTS = [] as ReturnType<typeof loadLocalContactRequests>

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export function LocalOwnerDashboard({ highlightId }: LocalOwnerDashboardProps) {
  const listings = useSyncExternalStore(subscribeLocalListings, loadLocalMarketplaceListings, () => EMPTY_LISTINGS)
  const requests = useSyncExternalStore(subscribeLocalContactRequests, loadLocalContactRequests, () => EMPTY_REQUESTS)

  const metrics = useMemo(() => {
    const visibleListings = listings.filter((listing) => isLocalListingPublic(listing.lifecycleStatus))

    return {
      total: listings.length,
      published: visibleListings.length,
      review: listings.filter((listing) => listing.lifecycleStatus === 'review').length,
      newRequests: requests.filter((request) => request.status === 'new').length,
    }
  }, [listings, requests])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">إجمالي الإعلانات المحلية</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{metrics.total}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">المعروض للزوار</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{metrics.published}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">قيد المراجعة</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{metrics.review}</div>
        </article>
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">طلبات تواصل جديدة</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{metrics.newRequests}</div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">عقاراتي المنشورة محلياً</h2>
              <p className="body-soft mt-2 text-sm text-[var(--muted)]">
                كل إعلان هنا محفوظ داخل المتصفح الحالي. يمكنك تغيير حالته أو حذفه أو فتح صفحته العامة فوراً.
              </p>
            </div>
            <Link href="/list-property" className="btn-base btn-primary">
              إعلان جديد
              <HousePlus className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {listings.length > 0 ? (
              listings.map((listing) => {
                const requestCount = requests.filter((request) => request.listingId === listing.id).length
                const highlightClass = highlightId === listing.id ? 'ring-2 ring-emerald-700/30' : ''

                return (
                  <div key={listing.id} className={`rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 ${highlightClass}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${listingStatusTone(listing.lifecycleStatus)}`}>
                            {listingStatusLabel(listing.lifecycleStatus)}
                          </span>
                          <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                            {listing.type}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-slate-950">{listing.title}</h3>
                        <p className="mt-2 text-sm text-[var(--muted)]">{listing.governorate} - {listing.district} - {listing.neighborhood}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">{listing.priceLabel}</div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">تم النشر: <span className="font-bold text-slate-950">{formatDate(listing.publishedAt)}</span></div>
                      <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">الصور المرفوعة: <span className="font-bold text-slate-950">{listing.imageDrafts.length}</span></div>
                      <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">طلبات التواصل: <span className="font-bold text-slate-950">{requestCount}</span></div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <select
                        aria-label={`حالة الإعلان ${listing.title}`}
                        value={listing.lifecycleStatus}
                        onChange={(event) => updateLocalListingStatus(listing.id, event.target.value as LocalListingStatus)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{listingStatusLabel(status)}</option>
                        ))}
                      </select>
                      <Link href={`/properties/${listing.id}`} className="btn-base btn-secondary btn-sm">
                        افتح الصفحة العامة
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteLocalListing(listing.id)}
                        className="btn-base btn-secondary btn-sm"
                      >
                        حذف الإعلان
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--surface)] p-8 text-center">
                <h3 className="text-xl font-bold text-slate-950">لا توجد إعلانات محلية بعد</h3>
                <p className="body-soft mt-3 text-sm text-[var(--muted)]">أنشئ معاينة جديدة ثم اضغط زر النشر المحلي ليظهر إعلانك هنا وفي صفحة البحث.</p>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">طلبات التواصل</h2>
          </div>

          <div className="mt-6 space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/85">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-white">{request.fullName}</div>
                    <div className="text-xs text-white/60">{formatDate(request.createdAt)}</div>
                  </div>
                  <div className="mt-2 text-white/70">الهاتف: {request.phone || 'غير مذكور'}</div>
                  <div className="text-white/70">التوقيت المفضل: {request.preferredTime}</div>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/10 p-3">{request.message}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
                    <MessageSquareMore className="h-4 w-4" />
                    يخص الإعلان: {listings.find((listing) => listing.id === request.listingId)?.title ?? request.listingTitle}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
                لم يصل أي طلب بعد. عندما يفتح الزائر صفحة أي عقار منشور محلياً ويملأ نموذج التواصل سيظهر الطلب هنا مباشرة.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}