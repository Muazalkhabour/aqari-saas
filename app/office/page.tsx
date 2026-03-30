import Link from 'next/link'
import { ArrowLeft, Building2, FileText, ShieldCheck, Sparkles } from 'lucide-react'
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
    return { message: 'تم حفظ إعدادات المكتب، وستظهر الآن في العقود والتقارير.', tone: 'success' as const }
  }

  return null
}

export default async function OfficePage({ searchParams }: OfficePageProps) {
  const settings = await getOfficeSettings()
  const params = searchParams ? await searchParams : undefined
  const successToast = readMessage(params?.success)
  const infoToast = !successToast && settings.dataSource === 'fallback'
    ? { message: 'إعدادات المكتب جاهزة الآن لتوحيد الهوية ورفع الثقة في العقود والتقارير.', tone: 'info' as const }
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
                إعدادات المكتب
              </div>
              <h1 className="hero-title mt-4 max-w-[36rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">هوية المكتب والعقود</span>
                <span className="hero-line mt-2 sm:mt-3">من صفحة واحدة</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                ثبّت الاسم والتوقيع وبيانات التواصل هنا، ثم راجع المعاينة قبل اعتمادها.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-base btn-secondary">
                العودة إلى اللوحة
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/contracts/contract-rima/print" className="btn-base btn-secondary" target="_blank" rel="noreferrer">
                راجع العقد
                <FileText className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  جاهز للعقود والطباعة
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <Building2 className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">ابدأ بالهوية</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">ثبّت الاسم والشعار والعنوان والهاتف أولاً لأنها تظهر مباشرة في الطباعة والتقارير.</p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">ثم راجع التوقيع</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">اضبط التوقيع والختم قبل إرسال أي عقد أو PDF حتى تظهر النسخة بشكل رسمي وواضح.</p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <Sparkles className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">بعد الحفظ</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">افتح معاينة العقد مباشرة وتأكد أن الهوية الجديدة ظهرت كما تريد.</p>
          </article>
        </section>

        <OfficeSettingsForm settings={settings} />
      </div>
    </main>
  )
}