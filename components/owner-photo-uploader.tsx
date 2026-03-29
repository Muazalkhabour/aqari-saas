'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Camera, ImagePlus, Info, RotateCcw, Trash2, Upload, WandSparkles } from 'lucide-react'
import {
  clearOwnerDraftPhotos,
  createOwnerDraftPhotos,
  saveOwnerDraftPhotos,
} from '@/lib/owner-photo-draft'
import { useOwnerDraftPhotos } from '@/components/use-owner-draft-photos'

const ownerPhotoChecklist = [
  'ابدأ بصورة الصالون أو الواجهة لأنها أول ما يحكم به الزائر على جودة العقار.',
  'التقط الصور نهاراً مع فتح الستائر والنوافذ للحصول على ضوء طبيعي واضح.',
  'أضف صوراً للمطبخ والحمامات والشرفة وغرفة النوم الرئيسية قبل أي تفاصيل ثانوية.',
  'تجنب الصور المهتزة أو الضيقة جداً، لأن الزائر يريد فهم المساحة لا فقط الزاوية.',
]

export function OwnerPhotoUploader() {
  const [isSaving, setIsSaving] = useState(false)
  const photos = useOwnerDraftPhotos()

  const hasPhotos = photos.length > 0

  const totalSizeLabel = useMemo(() => {
    const totalMegabytes = photos.reduce((sum, photo) => sum + Number(photo.sizeLabel.replace(' MB', '')), 0)
    return `${totalMegabytes.toFixed(1)} MB`
  }, [photos])

  const onFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? [])
    if (fileList.length === 0) {
      return
    }

    setIsSaving(true)
    const nextPhotos = await createOwnerDraftPhotos(fileList)
    const updated = [...photos, ...nextPhotos].slice(0, 10)
    saveOwnerDraftPhotos(updated)
    setIsSaving(false)
    event.target.value = ''
  }

  const removePhoto = (id: string) => {
    const updated = photos.filter((photo) => photo.id !== id)
    saveOwnerDraftPhotos(updated)
  }

  const clearAllPhotos = () => {
    clearOwnerDraftPhotos()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">ارفع صور العقار الحقيقية</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              هذه الصفحة تمنح المالك مساحة لرفع الصور الحقيقية ومعاينتها فوراً. في الوضع الحالي، يتم حفظها محلياً داخل نفس المتصفح بدلاً من قاعدة بيانات.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="btn-base btn-primary cursor-pointer">
              <Upload className="h-4 w-4" />
              {isSaving ? 'جارٍ تجهيز الصور...' : 'اختر الصور الآن'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
            </label>
            {hasPhotos ? (
              <button type="button" onClick={clearAllPhotos} className="btn-base btn-secondary">
                <RotateCcw className="h-4 w-4" />
                مسح الصور المحفوظة
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="stat-label">عدد الصور الحالية</div>
            <div className="stat-value mt-2 text-3xl font-bold text-slate-950">{photos.length}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="stat-label">الحجم التقريبي</div>
            <div className="stat-value mt-2 text-3xl font-bold text-slate-950">{totalSizeLabel}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="stat-label">أفضل عدد للعرض</div>
            <div className="stat-value mt-2 text-3xl font-bold text-slate-950">6 - 10</div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-dashed border-emerald-700/25 bg-emerald-700/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Info className="h-4 w-4 text-emerald-700" />
            ملاحظة عملية
          </div>
          <p className="body-soft mt-2 text-sm text-[var(--muted)]">
            الرفع هنا يحفظ الصور محلياً داخل نفس المتصفح من أجل المعاينة فقط. هذا مناسب الآن لأنك لا تملك قاعدة بيانات، لكنه لن ينتقل إلى جهاز آخر أو متصفح آخر.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex items-center gap-2 text-slate-950">
            <Camera className="h-5 w-5 text-[var(--accent-warm)]" />
            <h3 className="section-title text-xl font-bold sm:text-2xl">معاينة الصور المرفوعة</h3>
          </div>

          {hasPhotos ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo, index) => (
                <article key={photo.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image src={photo.previewUrl} alt={`معاينة الصورة ${index + 1}`} fill unoptimized className="object-cover" />
                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                      صورة {index + 1}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950">{photo.fileName}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{photo.sizeLabel}</div>
                    </div>
                    <button type="button" onClick={() => removePhoto(photo.id)} className="btn-base btn-secondary btn-sm">
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <ImagePlus className="mx-auto h-10 w-10 text-slate-400" />
              <h4 className="section-title mt-4 text-lg font-bold text-slate-950">لا توجد صور مرفوعة بعد</h4>
              <p className="body-soft mt-2 text-sm text-[var(--muted)]">ابدأ برفع صور الصالون والواجهة والمطبخ وغرفة النوم لتكوين عرض بصري أقرب للواقع.</p>
            </div>
          )}
        </article>

        <aside className="space-y-6">
          <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
            <div className="flex items-center gap-2">
              <WandSparkles className="h-5 w-5 text-emerald-300" />
              <h3 className="section-title text-xl font-bold sm:text-2xl">ترتيب الصور الأفضل</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">1. الصالون أو الواجهة الرئيسية</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">2. غرفة النوم الرئيسية</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">3. المطبخ</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">4. الحمام</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">5. الشرفة أو الإطلالة</div>
            </div>
          </article>

          <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <h3 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">نصائح تصوير سريعة</h3>
            <div className="mt-5 space-y-3">
              {ownerPhotoChecklist.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-[var(--muted)]">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}