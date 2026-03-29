import Link from 'next/link'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import { OwnerPhotoUploader } from '@/components/owner-photo-uploader'

export default function ListPropertyPhotosPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <Upload className="h-4 w-4" />
                صفحة رفع الصور الحقيقية
              </div>
              <h1 className="hero-title mt-4 max-w-[38rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">ارفع <span className="hero-highlight">صور عقارك</span> الحقيقية</span>
                <span className="hero-line mt-2 sm:mt-3">بدلاً من الاكتفاء بالصور التخيلية</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">
                هذه الصفحة تساعد المالك على تجهيز صور حقيقية واضحة قبل ربطها لاحقاً بعملية النشر النهائي والتخزين الدائم.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/list-property" className="btn-base btn-secondary">
                العودة لإدخال البيانات
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/list-property/preview" className="btn-base btn-primary">
                ارجع إلى المعاينة
                <Camera className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <OwnerPhotoUploader />
      </div>
    </main>
  )
}