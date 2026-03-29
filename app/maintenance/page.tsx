import Link from 'next/link'
import { ArrowLeft, LifeBuoy, Mail } from 'lucide-react'
import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { MaintenanceRequestsDashboard } from '@/components/maintenance-requests-dashboard'

export const dynamic = 'force-dynamic'

type MaintenancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function readToast(searchParams?: Record<string, string | string[] | undefined>) {
  const success = readParam(searchParams?.success)
  const error = readParam(searchParams?.error)
  const info = readParam(searchParams?.info)

  if (error === 'invalid-maintenance-update') {
    return {
      message: 'تعذر تحديث طلب الصيانة. تحقق من الحالة والموعد ثم أعد المحاولة.',
      tone: 'error' as const,
      actions: [{ label: 'فتح طلبات الصيانة', href: '/maintenance#maintenance-requests' }],
    }
  }

  if (error === 'invalid-payment') {
    return {
      message: 'تعذر تأكيد الدفعة المحددة. أعد المحاولة من القائمة.',
      tone: 'error' as const,
      actions: [{ label: 'الانتقال إلى الدفعات', href: '/maintenance#maintenance-payments' }],
    }
  }

  if (success === 'maintenance-updated') {
    return {
      message: 'تم تحديث حالة طلب الصيانة بنجاح.',
      tone: 'success' as const,
      actions: [{ label: 'مراجعة الطلبات', href: '/maintenance#maintenance-requests' }],
    }
  }

  if (success === 'payment-confirmed') {
    return {
      message: 'تم تأكيد الدفعة وتحديث حالتها إلى مدفوعة.',
      tone: 'success' as const,
      actions: [
        { label: 'عرض الدفعات', href: '/maintenance#maintenance-payments' },
        { label: 'فتح العقود', href: '/contracts?outstanding=with-outstanding' },
      ],
    }
  }

  if (info === 'notifications-dispatched') {
    return {
      message: 'تم تحديث السجل ومحاولة إرسال الإشعارات التشغيلية.',
      tone: 'info' as const,
      actions: [
        { label: 'سجل الإرسال', href: '/maintenance#maintenance-notification-log' },
        { label: 'فتح الإشعارات', href: '/notifications' },
      ],
    }
  }

  return null
}

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const params = searchParams ? await searchParams : undefined
  const toast = readToast(params)

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} actions={toast.actions} /> : null}

        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <LifeBuoy className="h-4 w-4" />
                لوحة صيانة للمكتب أو المالك
              </div>
              <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">طلبات الصيانة، المتابعة، والإشعارات</span>
                <span className="hero-line mt-2 sm:mt-3">من نفس لوحة التشغيل</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                صفحة تشغيل مخصصة للمكتب العقاري أو المالك لمتابعة الأعطال، تحديث الحالات، وتأكيد الدفعات.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-base btn-secondary">
                العودة للوحة الرئيسية
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  جاهزة للإرسال البريدي عند تفعيل SMTP
                </div>
              </div>
            </div>
          </div>
        </section>

        <MaintenanceRequestsDashboard />
      </div>
    </main>
  )
}