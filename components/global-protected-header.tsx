'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  BellRing,
  Building2,
  FileText,
  Home,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Palette,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { LiveUnreadNotificationsBadge } from '@/components/live-unread-notifications-badge'
import { INTERNAL_NOTIFICATIONS_CHANGED_EVENT } from '@/lib/internal-notifications-event'
import { isProtectedPathname } from '@/lib/protected-routes'

const navItems = [
  { href: '/dashboard', label: 'اللوحة', icon: LayoutDashboard },
  { href: '/contracts', label: 'العقود', icon: FileText },
  { href: '/notifications', label: 'الإشعارات', icon: BellRing },
  { href: '/maintenance', label: 'الصيانة', icon: LifeBuoy },
  { href: '/office', label: 'المكتب', icon: Palette },
  { href: '/my-properties', label: 'عقاراتي', icon: Building2 },
] as const

type QuickStats = {
  unreadCount: number
  endingSoonCount: number
  overduePaymentsCount: number
  maintenanceOpenCount: number
}

type ViewerContext = {
  officeAuthenticated: boolean
  officeEmail: string | null
  tenantAuthenticated: boolean
  tenantName: string | null
  tenantId: string | null
  demoAvailable: boolean
  hasOfficeAuthProvider: boolean
}

const publicShortcutLinks = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/list-property', label: 'أضف عقارك', icon: Building2 },
  { href: '/search', label: 'ابحث الآن', icon: Search },
] as const

function isRoleActive(pathname: string, matches: string[]) {
  return matches.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(prefix))
}

function withDemoParam(href: string, shouldAppendDemo: boolean) {
  if (!shouldAppendDemo || href.includes('mode=demo')) {
    return href
  }

  return href.includes('?') ? `${href}&mode=demo` : `${href}?mode=demo`
}

function getPathFromHref(href: string) {
  return href.split('?')[0]?.split('#')[0] || href
}

function getRolePillClassName(isActive: boolean, compact = false) {
  if (isActive) {
    return compact
      ? 'ui-active-pill'
      : 'ui-active-card'
  }

  return compact
    ? 'bg-white/92 text-slate-700 shadow-[0_8px_24px_rgba(16,42,67,0.08)] hover:bg-white'
    : 'border-white/60 bg-white/88 text-slate-800 shadow-[0_12px_30px_rgba(16,42,67,0.08)] hover:bg-white'
}

function getDefaultHeaderPillClassName(isActive: boolean) {
  return isActive
    ? 'ui-active-pill'
    : 'bg-white text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:bg-slate-50'
}

function getTenantHeaderPillClassName() {
  return 'bg-white text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:bg-slate-50'
}

function getRoleIconClassName(isActive: boolean, isTenant: boolean) {
  if (isTenant || isActive) {
    return 'bg-emerald-700/10 text-emerald-900'
  }

  return 'bg-emerald-700/10 text-emerald-900'
}

function getRoleDescriptionClassName(isActive: boolean, isTenant: boolean) {
  if (isTenant || isActive) {
    return 'text-slate-600'
  }

  return 'text-slate-600'
}

export function GlobalProtectedHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [viewerContext, setViewerContext] = useState<ViewerContext | null>(null)
  const isProtected = isProtectedPathname(pathname)
  const isDemoPreview = searchParams.get('mode') === 'demo'

  useEffect(() => {
    let isActive = true

    fetch('/api/viewer-context', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: ViewerContext | null) => {
        if (isActive && data) {
          setViewerContext(data)
        }
      })
      .catch(() => {
        if (isActive) {
          setViewerContext(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!isProtected) {
      return
    }

    let isActive = true

    fetch('/api/operations/quick-stats', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { unreadCount: 0, endingSoonCount: 0, overduePaymentsCount: 0, maintenanceOpenCount: 0 }))
      .then((data: QuickStats) => {
        if (isActive) {
          setQuickStats({
            unreadCount: Number(data.unreadCount || 0),
            endingSoonCount: Number(data.endingSoonCount || 0),
            overduePaymentsCount: Number(data.overduePaymentsCount || 0),
            maintenanceOpenCount: Number(data.maintenanceOpenCount || 0),
          })
        }
      })
      .catch(() => {
        if (isActive) {
          setQuickStats({ unreadCount: 0, endingSoonCount: 0, overduePaymentsCount: 0, maintenanceOpenCount: 0 })
        }
      })

    return () => {
      isActive = false
    }
  }, [isProtected, pathname])

  useEffect(() => {
    function handleNotificationsChanged(event: Event) {
      const customEvent = event as CustomEvent<{ unreadCount?: number }>

      setQuickStats((currentStats) => ({
        unreadCount: Number(customEvent.detail?.unreadCount || 0),
        endingSoonCount: currentStats?.endingSoonCount || 0,
        overduePaymentsCount: currentStats?.overduePaymentsCount || 0,
        maintenanceOpenCount: currentStats?.maintenanceOpenCount || 0,
      }))
    }

    window.addEventListener(INTERNAL_NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)

    return () => {
      window.removeEventListener(INTERNAL_NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged)
    }
  }, [])

  const isLoading = quickStats === null
  const canUseDemoNavigation = Boolean(isDemoPreview && viewerContext?.demoAvailable && !viewerContext?.officeAuthenticated)
  const officeEntryHref = viewerContext?.officeAuthenticated
    ? '/dashboard'
    : canUseDemoNavigation
      ? '/dashboard?mode=demo'
      : viewerContext?.demoAvailable
        ? '/dashboard?mode=demo'
        : '/login'
  const officeEntryLabel = viewerContext?.officeAuthenticated
    ? 'لوحة المكتب'
    : viewerContext?.demoAvailable
      ? 'معاينة الإدارة'
      : 'دخول المكتب'
  const tenantEntryHref = viewerContext?.tenantAuthenticated ? '/tenant-portal' : '/tenant-login'
  const tenantEntryLabel = viewerContext?.tenantAuthenticated ? 'بوابة المستأجر' : 'دخول المستأجر'

  const roleLinks = [
    {
      href: officeEntryHref,
      label: 'المدير',
      description: viewerContext?.officeAuthenticated
        ? `جلسة مكتب نشطة${viewerContext.officeEmail ? `: ${viewerContext.officeEmail}` : ''}`
        : canUseDemoNavigation
          ? 'معاينة development نشطة للتنقل داخل الإدارة'
          : 'لوحة التشغيل والعقود والإشعارات',
      icon: ShieldCheck,
      matches: ['/dashboard', '/contracts', '/notifications', '/maintenance', '/office'],
    },
    {
      href: pathname.startsWith('/list-property') ? '/list-property/preview' : '/my-properties',
      label: 'صاحب عقار',
      description: pathname.startsWith('/list-property')
        ? 'أكمل المعاينة أو ارفع الصور أو عد إلى لوحة المالك'
        : 'الإضافة والنشر والمتابعة المحلية',
      icon: UserRound,
      matches: ['/my-properties', '/list-property'],
    },
    {
      href: pathname.startsWith('/properties') ? pathname : '/search',
      label: 'عميل',
      description: pathname.startsWith('/properties')
        ? 'أنت داخل صفحة عقار عامة الآن'
        : 'البحث واستعراض العقارات العامة',
      icon: Search,
      matches: ['/search', '/properties'],
    },
    {
      href: tenantEntryHref,
      label: 'مستأجر',
      description: viewerContext?.tenantAuthenticated && viewerContext.tenantName
        ? `جلسة مستأجر نشطة: ${viewerContext.tenantName}`
        : 'البوابة والعقد والدفعات',
      icon: KeyRound,
      matches: ['/tenant-login', '/tenant-portal'],
    },
  ]

  const compactRoleLinks = roleLinks.map((item) => ({
    ...item,
    isActive: isRoleActive(pathname, item.matches),
  }))

  const protectedNavItems = navItems.map((item) => ({
    ...item,
    href: withDemoParam(item.href, canUseDemoNavigation),
  }))

  const protectedQuickLinks = [
    withDemoParam('/contracts/bulk-renew', canUseDemoNavigation),
    withDemoParam('/contracts?outstanding=overdue-only', canUseDemoNavigation),
    withDemoParam('/maintenance#maintenance-requests', canUseDemoNavigation),
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(247,248,251,0.9)] shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-white/70 bg-white/84 px-3 py-3 shadow-[0_12px_30px_rgba(16,42,67,0.08)] backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {publicShortcutLinks.map((item) => {
                  const Icon = item.icon
                  const itemPath = getPathFromHref(item.href)
                  const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${getDefaultHeaderPillClassName(isActive)}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                <Link
                  href={officeEntryHref}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${getDefaultHeaderPillClassName(pathname === '/login' || isProtected)}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {officeEntryLabel}
                </Link>
                <Link
                  href={tenantEntryHref}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${getTenantHeaderPillClassName()}`}
                >
                  <KeyRound className="h-4 w-4" />
                  {tenantEntryLabel}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {compactRoleLinks.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={`compact-${item.label}`}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${item.label === 'مستأجر' ? getTenantHeaderPillClassName() : getRolePillClassName(item.isActive, true)}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {!isProtected ? null : (
        <section className="border-b border-white/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(248,250,252,0.9))]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-white/70 bg-white/88 p-4 shadow-[0_14px_36px_rgba(16,42,67,0.08)] backdrop-blur sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/80">Office Control</div>
                  <div className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">شريط تنقل موحّد للصفحات المحمية</div>
                  <div className="mt-1 text-sm text-slate-600">روابط الإدارة السريعة موجودة هنا، لكن القسم لم يعد ثابتًا فوق المحتوى أثناء النزول داخل الصفحة.</div>
                </div>

                <div className="inline-flex self-start rounded-full border border-emerald-700/12 bg-emerald-700/10 px-4 py-2 text-sm font-semibold text-emerald-900">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                      جاري تحميل الإشعارات...
                    </span>
                  ) : (
                    <span>إشعارات غير مقروءة: {quickStats.unreadCount}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">روابط تشغيل سريعة</div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={protectedQuickLinks[0]} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-slate-50">
                      <RefreshCcw className="h-4 w-4" />
                      تجديد جماعي
                      {!isLoading && quickStats.endingSoonCount > 0 ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">{quickStats.endingSoonCount}</span> : null}
                    </Link>
                    <Link href={protectedQuickLinks[1]} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-slate-50">
                      متأخرات
                      {!isLoading && quickStats.overduePaymentsCount > 0 ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-900">{quickStats.overduePaymentsCount}</span> : null}
                    </Link>
                    <Link href={protectedQuickLinks[2]} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-slate-50">
                      صيانة مفتوحة
                      {!isLoading && quickStats.maintenanceOpenCount > 0 ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">{quickStats.maintenanceOpenCount}</span> : null}
                    </Link>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-3">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">تنقل الإدارة</div>
                  <nav className="flex flex-wrap gap-2">
                    {protectedNavItems.map((item) => {
                      const Icon = item.icon
                      const itemPath = getPathFromHref(item.href)
                      const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
                      const isNotifications = itemPath === '/notifications'

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'ui-active-pill' : 'bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-slate-50'}`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                          {isNotifications && !isLoading ? <LiveUnreadNotificationsBadge initialCount={quickStats.unreadCount} /> : null}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-white/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(248,250,252,0.88))]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/80">Role Switch</div>
                <div className="mt-1 text-xl font-bold text-slate-950">شريط تنقل موحّد بين المدير وصاحب العقار والعميل</div>
                <div className="mt-1 text-sm text-slate-600">اختر المنظور الذي تريد العمل منه ثم أكمل مباشرة من الروابط الأقرب للسياق الحالي.</div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
              {roleLinks.map((item) => {
                const Icon = item.icon
                const isActive = isRoleActive(pathname, item.matches)
                const isTenant = item.label === 'مستأجر'

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-[24px] border px-4 py-4 transition ${isTenant ? 'border-white/60 bg-white/88 text-slate-800 shadow-[0_12px_30px_rgba(16,42,67,0.08)] hover:bg-white' : getRolePillClassName(isActive)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-3 ${getRoleIconClassName(isActive, isTenant)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-base font-bold">{item.label}</div>
                        <div className={`mt-1 text-sm ${getRoleDescriptionClassName(isActive, isTenant)}`}>{item.description}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
