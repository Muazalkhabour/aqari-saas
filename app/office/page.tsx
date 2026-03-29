import Link from 'next/link'
import { ArrowLeft, Building2, FileText, ShieldCheck } from 'lucide-react'
import { AutoDismissToast } from '@/components/auto-dismiss-toast'
import { OfficeSettingsForm } from '@/components/office-settings-form'
import { getOfficeSettings } from '@/lib/office-settings'

export const dynamic = 'force-dynamic'

type OfficePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function readMessage(value: string | string[] | undefined) {
  const item = Array.isArray(value) ? value[0] : value
  if (item === 'saved') {
    return { message: 'تم حفظ إعدادات المكتب بنجاح، وستظهر الآن في العقود والتقارير.', tone: 'success' as const }
  }

  return null
}

export default async function OfficePage({ searchParams }: OfficePageProps) {
  const settings = await getOfficeSettings()
  const params = searchParams ? await searchParams : undefined
  const successToast = readMessage(params?.success)
  const infoToast = !successToast && settings.dataSource === 'fallback'
    ? { message: 'إعدادات المكتب تعمل حالياً على الحفظ المحلي الاحتياطي حتى تعود قاعدة البيانات.', tone: 'info' as const }
    : null
  const toast = successToast || infoToast

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {toast ? <AutoDismissToast message={toast.message} tone={toast.tone} /> : null}

        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <Building2 className="h-4 w-4" />
                إعدادات المكتب والهوية الرسمية
              </div>
              <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">هوية المكتب، التوقيع، وبيانات العقود</span>
                <span className="hero-line mt-2 sm:mt-3">من مكان واحد</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                هنا نثبت طبقة المكتب التي ستغذي العقد، لوحة التقارير، والإشعارات القادمة.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-base btn-secondary">
                العودة إلى اللوحة
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/contracts/contract-rima/print" className="btn-base btn-secondary" target="_blank" rel="noreferrer">
                راجع العقد الحالي
                <FileText className="h-4 w-4" />
              </Link>
              <Link href="/contracts" className="btn-base btn-secondary">
                إدارة العقود
                <FileText className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  تمهيد لمسار الإشعارات و WhatsApp
                </div>
              </div>
            </div>
          </div>
        </section>

        <OfficeSettingsForm settings={settings} />
      </div>
    </main>
  )
}