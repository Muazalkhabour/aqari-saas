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
  { href: '/#available-apartments', label: 'الشقق المتوفرة', icon: Building2 },
  { href: '/search', label: 'البحث', icon: Search },
  { href: '/auth?mode=signin', label: 'بوابة الدخول', icon: ShieldCheck },
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

function getDefaultHeaderPillClassName(isActive: boolean) {
  return isActive
    ? 'ui-active-pill'
    : 'bg-white text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:bg-slate-50'
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
  const authRole = searchParams.get('role')
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
        : '/auth?mode=signin&role=manager'
  const officeEntryLabel = viewerContext?.officeAuthenticated
    ? 'لوحة المكتب'
    : viewerContext?.demoAvailable
      ? 'معاينة الإدارة'
      : 'دخول المكتب'
  const tenantEntryHref = viewerContext?.tenantAuthenticated ? '/tenant-portal' : '/auth?mode=signin&role=tenant'
  const tenantEntryLabel = viewerContext?.tenantAuthenticated ? 'بوابة المستأجر' : 'دخول المستأجر'
  const ownerEntryHref = pathname.startsWith('/list-property')
    ? '/list-property/preview'
    : pathname.startsWith('/my-properties')
      ? '/my-properties'
      : '/auth?mode=signin&role=owner'

  const roleLinks = [
    {
      href: officeEntryHref,
      label: 'المدير',
      description: viewerContext?.officeAuthenticated
        ? `جلسة مكتب نشطة${viewerContext.officeEmail ? `: ${viewerContext.officeEmail}` : ''}`
        : canUseDemoNavigation
          ? 'الدخول إلى الإدارة والعقود والإشعارات من مكان واحد'
          : 'الإدارة والعقود والإشعارات في لوحة واحدة',
      icon: ShieldCheck,
      matches: ['/dashboard', '/contracts', '/notifications', '/maintenance', '/office'],
    },
    {
      href: ownerEntryHref,
      label: 'صاحب عقار',
      description: pathname.startsWith('/list-property')
        ? 'أكمل المعاينة أو ارفع الصور أو ارجع إلى لوحة المالك'
        : pathname.startsWith('/my-properties')
          ? 'إضافة العقارات ونشرها ومتابعة الطلبات'
          : 'الدخول إلى بوابة المالك ثم متابعة عقاراتك',
      icon: UserRound,
      matches: ['/my-properties', '/list-property'],
    },
    {
      href: tenantEntryHref,
      label: 'مستأجر',
      description: viewerContext?.tenantAuthenticated && viewerContext.tenantName
        ? `جلسة مستأجر نشطة: ${viewerContext.tenantName}`
        : 'العقد والدفعات والتنبيهات في مكان واحد',
      icon: KeyRound,
      matches: ['/tenant-login', '/tenant-portal'],
    },
  ]

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
      <section className="relative overflow-hidden border-b border-slate-900/10 bg-[linear-gradient(90deg,#031b1a_0%,#0b3b37_32%,#102a43_68%,#3f2a1d_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_22%)]" />
        <div className="mx-auto flex max-w-7xl justify-center gap-3 px-4 py-2.5 sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="relative mx-auto flex min-w-0 w-full max-w-[22rem] items-center gap-3 rounded-[24px] border border-emerald-200/10 bg-slate-950/38 px-4 py-2.5 shadow-[0_16px_40px_rgba(2,6,23,0.24)] backdrop-blur-xl sm:mx-0 sm:w-auto sm:max-w-none sm:px-4 sm:py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-emerald-200/14 bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(15,23,42,0.46))] text-emerald-100 shadow-[0_12px_26px_rgba(2,6,23,0.22)] sm:h-12 sm:w-12">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[0.72rem] font-semibold tracking-[0.24em] text-emerald-100/72">AQARI</span>
                <span className="h-1 w-1 rounded-full bg-orange-300/70" />
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] text-white/56">REAL ESTATE</span>
              </div>
              <div className="mt-0.5 text-base font-bold leading-none text-white sm:text-lg">عقاري</div>
              <div className="mt-2 text-[11px] leading-5 text-white/54 sm:text-xs">منصة عقارية للعروض والإدارة والمتابعة بثقة أوضح</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200/10 bg-slate-950/28 px-4 py-2 text-xs font-semibold text-white/80 shadow-[0_10px_24px_rgba(2,6,23,0.18)] backdrop-blur-xl sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-300/90 shadow-[0_0_10px_rgba(110,231,183,0.4)]" />
            كل ما تحتاجه للعقار في واجهة واحدة
          </div>
        </div>
      </section>

      <header className="relative z-40 border-b border-white/60 bg-[rgba(247,248,251,0.9)] shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-white/70 bg-white/84 px-3 py-3 shadow-[0_12px_30px_rgba(16,42,67,0.08)] backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {publicShortcutLinks.map((item) => {
                  const Icon = item.icon
                  const itemPath = getPathFromHref(item.href)
                  const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${getDefaultHeaderPillClassName(isActive)}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                <Link
                  href={officeEntryHref}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${getDefaultHeaderPillClassName((pathname === '/auth' && authRole === 'manager') || pathname === '/login' || isProtected)}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {officeEntryLabel}
                </Link>
                <Link
                  href={tenantEntryHref}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${getDefaultHeaderPillClassName((pathname === '/auth' && authRole === 'tenant') || pathname.startsWith('/tenant-portal'))}`}
                >
                  <KeyRound className="h-4 w-4" />
                  {tenantEntryLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {!isProtected ? null : (
        <section className="border-b border-white/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(248,250,252,0.9))]">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="rounded-[24px] border border-white/70 bg-white/86 p-3 shadow-[0_12px_28px_rgba(16,42,67,0.06)] backdrop-blur sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">لوحة محمية</span>
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/12 bg-emerald-700/10 px-3 py-1 text-emerald-900">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                      جاري تحميل الإشعارات...
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-700/12 bg-emerald-700/10 px-3 py-1 text-emerald-900">إشعارات غير مقروءة: {quickStats.unreadCount}</span>
                  )}
                </div>

                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  <Link href={protectedQuickLinks[0]} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:bg-slate-50 sm:px-4 sm:text-sm">
                      <RefreshCcw className="h-4 w-4" />
                      تجديد جماعي
                      {!isLoading && quickStats.endingSoonCount > 0 ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">{quickStats.endingSoonCount}</span> : null}
                  </Link>
                  <Link href={protectedQuickLinks[1]} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:bg-slate-50 sm:px-4 sm:text-sm">
                      متأخرات
                      {!isLoading && quickStats.overduePaymentsCount > 0 ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-900">{quickStats.overduePaymentsCount}</span> : null}
                  </Link>
                  <Link href={protectedQuickLinks[2]} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:bg-slate-50 sm:px-4 sm:text-sm">
                      صيانة مفتوحة
                      {!isLoading && quickStats.maintenanceOpenCount > 0 ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">{quickStats.maintenanceOpenCount}</span> : null}
                  </Link>
                </div>
              </div>

              <nav className="mt-3 no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                    {protectedNavItems.map((item) => {
                      const Icon = item.icon
                      const itemPath = getPathFromHref(item.href)
                      const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`)
                      const isNotifications = itemPath === '/notifications'

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${isActive ? 'ui-active-pill' : 'bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:bg-slate-50'}`}
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
        </section>
      )}

      <section className="border-b border-white/60 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(248,250,252,0.88))]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
              <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800/80">الأقسام</div>
                    <div className="mt-1 text-base font-bold text-slate-950 sm:text-lg">وصول أسرع إلى الأقسام التي تحتاجها.</div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {roleLinks.map((item) => {
                const Icon = item.icon
                const isAuthActive = pathname === '/auth' && ((item.label === 'المدير' && authRole === 'manager') || (item.label === 'صاحب عقار' && authRole === 'owner') || (item.label === 'مستأجر' && authRole === 'tenant'))
                const isActive = isRoleActive(pathname, item.matches) || isAuthActive

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-[20px] border px-3 py-3 transition ${isActive ? 'ui-active-card' : 'border-white/60 bg-white/88 text-slate-800 shadow-[0_10px_24px_rgba(16,42,67,0.06)] hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-2.5 ${getRoleIconClassName(isActive, false)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold sm:text-base">{item.label}</div>
                        <div className={`mt-1 text-xs sm:text-sm ${getRoleDescriptionClassName(isActive, false)}`}>{item.description}</div>
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
