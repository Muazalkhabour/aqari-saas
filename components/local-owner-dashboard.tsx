'use client'

import Link from 'next/link'
import { useMemo, useSyncExternalStore } from 'react'
import { BellRing, Camera, Eye, HousePlus, MessageSquareMore, Sparkles, Trash2 } from 'lucide-react'
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

  const prioritizedListings = useMemo(
    () =>
      [...listings].sort((left, right) => {
        if (highlightId === left.id) {
          return -1
        }

        if (highlightId === right.id) {
          return 1
        }

        if (left.lifecycleStatus === 'review' && right.lifecycleStatus !== 'review') {
          return -1
        }

        if (right.lifecycleStatus === 'review' && left.lifecycleStatus !== 'review') {
          return 1
        }

        return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
      }),
    [highlightId, listings]
  )

  const latestRequests = useMemo(
    () => [...requests].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [requests]
  )

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/75 px-4 py-2 text-emerald-900">
              <Sparkles className="h-4 w-4" />
              لوحة المالك المبسطة
            </div>
            <h1 className="hero-title mt-4 text-[1.45rem] font-bold text-slate-950 sm:text-[1.85rem] lg:text-[2.3rem]">
              ابدأ من <span className="hero-highlight">الخطوة التالية</span> بدل قراءة كل شيء مرة واحدة
            </h1>
            <p className="hero-subtitle mt-3 max-w-2xl">
              إذا كان لديك إعلان قيد المراجعة، أكمل صوره أولاً. وإذا وصلك طلب جديد، راجع الطلب ثم افتح الإعلان المرتبط به. بقية التفاصيل بقيت أسفل الصفحة لمن يحتاجها فقط.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/list-property" className="btn-base btn-primary">
              إعلان جديد
              <HousePlus className="h-4 w-4" />
            </Link>
            <Link href="/list-property/photos" className="btn-base btn-secondary">
              أكمل الصور
              <Camera className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">الأولوية الأولى</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {metrics.review > 0
                ? `لديك ${metrics.review} إعلان/إعلانات قيد المراجعة. أضف الصور ثم افتح المعاينة قبل النشر.`
                : 'إذا كان الإعلان جاهزاً، انتقل مباشرة إلى المعاينة ثم انشره ليظهر في البحث.'}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">الأولوية الثانية</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {metrics.newRequests > 0
                ? `وصلت ${metrics.newRequests} طلبات جديدة. ابدأ بالأحدث حتى لا يبرد تفاعل العميل.`
                : 'لا توجد طلبات جديدة الآن. ركز على تحسين العنوان والسعر والصور قبل وصول الزيارات التالية.'}
            </p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
            <div className="text-sm font-semibold text-slate-950">الوضع الحالي</div>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              لديك {metrics.published} إعلان ظاهر للزوار من أصل {metrics.total}، ويمكنك تعديل حالة أي إعلان من البطاقات أسفل الصفحة.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">إجمالي الإعلانات</div>
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
              <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">إعلاناتك الحالية</h2>
              <p className="body-soft mt-2 text-sm text-[var(--muted)]">
                نرتب الإعلانات هنا بحسب ما يحتاج انتباهك أولاً، ثم الأحدث وصولاً.
              </p>
            </div>
            <Link href="/list-property" className="btn-base btn-primary">
              إعلان جديد
              <HousePlus className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {prioritizedListings.length > 0 ? (
              prioritizedListings.map((listing) => {
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
                <h3 className="text-xl font-bold text-slate-950">لا توجد إعلانات منشورة بعد</h3>
                <p className="body-soft mt-3 text-sm text-[var(--muted)]">أنشئ إعلانك الأول ثم انشره ليظهر هنا وفي صفحة البحث ويبدأ باستقبال الطلبات.</p>
              </div>
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-emerald-300" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">طلبات التواصل</h2>
            </div>

            <div className="mt-3 text-sm leading-7 text-white/70">
              نعرض الأحدث أولاً حتى تبدأ بما يحتاج رداً سريعاً.
            </div>

            <div className="mt-6 space-y-3">
              {latestRequests.length > 0 ? (
                latestRequests.map((request) => (
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
                  لم يصل أي طلب بعد. شارك إعلاناتك وراجع الصور والسعر جيداً لرفع فرص التواصل وبدء استقبال العملاء.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h2 className="section-title text-xl font-bold sm:text-2xl">ترتيب العمل المقترح</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">1. أنشئ البيانات الأساسية للإعلان من صفحة إضافة العقار.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">2. ارفع 6 إلى 10 صور واضحة ثم راجع صفحة المعاينة.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">3. انشر الإعلان ثم تابع طلبات التواصل والتحديثات من هذه الصفحة.</div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
