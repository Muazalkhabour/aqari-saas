'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { BellRing, CheckCheck, CheckCircle2, CircleAlert, RotateCcw, Trash2 } from 'lucide-react'
import { FloatingToast } from '@/components/floating-toast'
import { INTERNAL_NOTIFICATIONS_CHANGED_EVENT } from '@/lib/internal-notifications-event'
import type { InternalNotificationItem } from '@/lib/contract-activity'

type InternalNotificationsCenterProps = {
  notifications: InternalNotificationItem[]
  activeTab: string
  currentPage: number
}

const PAGE_SIZE = 8

function notificationTone(severity: InternalNotificationItem['severity'], isRead: boolean) {
  if (isRead) {
    return 'border-slate-200 bg-slate-50 text-slate-700'
  }

  switch (severity) {
    case 'high':
      return 'border-rose-200 bg-rose-50 text-rose-900'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

function notificationLabel(item: InternalNotificationItem) {
  if (item.type === 'contract-terminated') {
    return 'إنهاء عقد'
  }

  return 'تجديد عقد'
}

function buildTabHref(tab: string) {
  return tab === 'all' ? '/notifications' : `/notifications?tab=${tab}`
}

function buildPageHref(page: number, activeTab: string) {
  const params = new URLSearchParams()

  if (activeTab !== 'all') {
    params.set('tab', activeTab)
  }

  if (page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()
  return query ? `/notifications?${query}` : '/notifications'
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])

  if (currentPage <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  return Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((left, right) => left - right)
}

export function InternalNotificationsCenter({ notifications, activeTab, currentPage }: InternalNotificationsCenterProps) {
  const [items, setItems] = useState(notifications)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ id: number; message: string; tone: 'success' | 'error'; visible: boolean } | null>(null)
  const toastIdRef = useRef(0)

  const unreadCount = items.filter((item) => !item.readAt).length
  const filteredNotifications = items.filter((item) => {
    if (activeTab === 'unread') {
      return !item.readAt
    }

    if (activeTab === 'read') {
      return Boolean(item.readAt)
    }

    return true
  })
  const totalPages = Math.max(Math.ceil(filteredNotifications.length / PAGE_SIZE), 1)
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filteredNotifications.slice(pageStart, pageStart + PAGE_SIZE)

  const pageNumbers = buildPageNumbers(safePage, totalPages)

  const counts = useMemo(() => ({
    all: items.length,
    unread: items.filter((item) => !item.readAt).length,
    read: items.filter((item) => Boolean(item.readAt)).length,
  }), [items])

  useEffect(() => {
    if (!toast) {
      return
    }

    if (!toast.visible) {
      const removeTimeoutId = window.setTimeout(() => {
        setToast((currentToast) => currentToast?.id === toast.id ? null : currentToast)
      }, 280)

      return () => {
        window.clearTimeout(removeTimeoutId)
      }
    }

    const hideTimeoutId = window.setTimeout(() => {
      setToast((currentToast) => currentToast?.id === toast.id ? { ...currentToast, visible: false } : currentToast)
    }, 2200)

    return () => {
      window.clearTimeout(hideTimeoutId)
    }
  }, [toast])

  function showToast(message: string, tone: 'success' | 'error') {
    toastIdRef.current += 1
    setToast({ id: toastIdRef.current, message, tone, visible: true })
  }

  function hideToast() {
    setToast((currentToast) => currentToast ? { ...currentToast, visible: false } : currentToast)
  }

  function syncUnreadCount(nextItems: InternalNotificationItem[]) {
    const nextUnreadCount = nextItems.filter((item) => !item.readAt).length
    window.dispatchEvent(new CustomEvent(INTERNAL_NOTIFICATIONS_CHANGED_EVENT, {
      detail: { unreadCount: nextUnreadCount },
    }))
  }

  function applyNotifications(nextItems: InternalNotificationItem[]) {
    setItems(nextItems)
    syncUnreadCount(nextItems)
  }

  async function manageNotifications(action: 'mark-read' | 'mark-all-read' | 'reset-demo' | 'clear-all', notificationId?: string) {
    const response = await fetch('/api/internal-notifications/manage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, notificationId }),
    })

    if (!response.ok) {
      throw new Error('Failed to update notifications')
    }

    const data = await response.json() as { notifications: InternalNotificationItem[] }
    applyNotifications(data.notifications)
  }

  function handleMarkRead(notificationId: string) {
    startTransition(() => {
      void manageNotifications('mark-read', notificationId)
        .then(() => {
          showToast('تم تعليم الإشعار كمقروء.', 'success')
        })
        .catch(() => {
          showToast('تعذر تحديث الإشعار حالياً.', 'error')
        })
    })
  }

  function handleMarkAllRead() {
    startTransition(() => {
      void manageNotifications('mark-all-read')
        .then(() => {
          showToast('تم تعليم كل الإشعارات كمقروءة.', 'success')
        })
        .catch(() => {
          showToast('تعذر تحديث كل الإشعارات حالياً.', 'error')
        })
    })
  }

  function handleResetDemo() {
    startTransition(() => {
      void manageNotifications('reset-demo')
        .then(() => {
          showToast('تمت إعادة توليد الإشعارات التجريبية.', 'success')
        })
        .catch(() => {
          showToast('تعذر إعادة توليد الإشعارات الآن.', 'error')
        })
    })
  }

  function handleClearAll() {
    startTransition(() => {
      void manageNotifications('clear-all')
        .then(() => {
          showToast('تم مسح الإشعارات الداخلية.', 'success')
        })
        .catch(() => {
          showToast('تعذر مسح الإشعارات حالياً.', 'error')
        })
    })
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {toast ? (
          <FloatingToast
            message={toast.message}
            tone={toast.tone}
            visible={toast.visible}
            onClose={hideToast}
          />
        ) : null}

        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <BellRing className="h-4 w-4" />
                مركز الإشعارات الداخلية
              </div>
              <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">الإشعارات التشغيلية الخاصة بالعقود</span>
                <span className="hero-line mt-2 sm:mt-3">مع تعليم كمقروء وربط مباشر بالعقد</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                هذه الصفحة تعطي المكتب صندوق متابعة داخلياً مستقلاً عن البريد، بحيث يرى ما تم تجديده أو إنهاؤه ويغلق الإشعارات بعد المراجعة.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/contracts" className="btn-base btn-secondary">العودة إلى العقود</Link>
              <button type="button" onClick={handleMarkAllRead} disabled={isPending || unreadCount === 0} className="btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                تعليم الكل كمقروء
                <CheckCheck className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleResetDemo} disabled={isPending} className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                إعادة توليد تجريبي
                <RotateCcw className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleClearAll} disabled={isPending || items.length === 0} className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-60">
                مسح الإشعارات
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                {isPending ? 'جار تحديث الإشعارات...' : `غير المقروء: ${unreadCount}`}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={buildTabHref('all')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'all' ? 'ui-active-pill' : 'bg-slate-100 text-slate-700'}`}>
              الكل ({counts.all})
            </Link>
            <Link href={buildTabHref('unread')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'unread' ? 'ui-active-pill' : 'bg-slate-100 text-slate-700'}`}>
              غير المقروء ({counts.unread})
            </Link>
            <Link href={buildTabHref('read')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'read' ? 'ui-active-pill' : 'bg-slate-100 text-slate-700'}`}>
              المقروء ({counts.read})
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <article className="rounded-[32px] border border-dashed border-slate-300 bg-white/88 p-8 text-center shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <h2 className="text-xl font-bold text-slate-950">لا توجد إشعارات داخلية حالياً</h2>
              <p className="mt-3 text-sm text-slate-600">ستظهر هنا إشعارات التجديد والإنهاء القادمة من إدارة العقود.</p>
            </article>
          ) : (
            pageItems.map((item) => {
              const isRead = Boolean(item.readAt)

              return (
                <article key={item.id} className={`rounded-[32px] border p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] ${notificationTone(item.severity, isRead)}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-900">
                          {notificationLabel(item)}
                        </span>
                        {isRead ? (
                          <span className="rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-700">مقروءة</span>
                        ) : (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-900">جديدة</span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-bold">{item.title}</h2>
                      <p className="mt-2 text-sm leading-7">{item.message}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-80">
                        <span>{new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</span>
                        {item.readAt ? <span>قُرئت في {new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.readAt))}</span> : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/contracts#contract-card-${item.contractId}`} className="btn-base btn-secondary btn-sm">
                        فتح العقد
                        <CircleAlert className="h-4 w-4" />
                      </Link>
                      {!isRead ? (
                        <button type="button" onClick={() => handleMarkRead(item.id)} disabled={isPending} className="btn-base btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-60">
                          تعليم كمقروء
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })
          )}

          {filteredNotifications.length > PAGE_SIZE ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/60 bg-white/92 p-4 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
              <div className="text-sm text-slate-600">
                الصفحة {safePage} من {totalPages}
              </div>
              <div className="flex flex-wrap gap-2">
                {safePage > 1 ? <Link href={buildPageHref(safePage - 1, activeTab)} className="btn-base btn-secondary btn-sm">السابق</Link> : null}
                {pageNumbers.map((page, index) => {
                  const previousPage = pageNumbers[index - 1]
                  const showGap = previousPage && page - previousPage > 1

                  return (
                    <span key={page} className="contents">
                      {showGap ? <span className="inline-flex items-center px-2 text-sm text-slate-400">...</span> : null}
                      <Link
                        href={buildPageHref(page, activeTab)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold ${page === safePage ? 'ui-active-pill' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {page}
                      </Link>
                    </span>
                  )
                })}
                {safePage < totalPages ? <Link href={buildPageHref(safePage + 1, activeTab)} className="btn-base btn-secondary btn-sm">التالي</Link> : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
