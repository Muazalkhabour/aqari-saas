'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, UploadCloud } from 'lucide-react'
import { publishListingAction } from '@/app/actions/marketplace'
import { loadOwnerDraftPhotos } from '@/lib/owner-photo-draft'

type PublishListingPanelProps = {
  values: {
    title: string
    governorate: string
    district: string
    neighborhood: string
    type: 'بيع' | 'إيجار'
    priceLabel: string
    priceValue: number
    paymentPeriod?: string
    areaSqm: number
    rooms: number
    bathrooms: number
    floor: string
    furnishing: string
    ownership: string
    status: string
    description: string
    highlight: string
    features: string[]
    suitableFor: string[]
    contactName: string
    contactPhone: string
    contactWhatsApp: string
  }
}

export function PublishListingPanel({ values }: PublishListingPanelProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    startTransition(async () => {
      try {
        const result = await publishListingAction(values, loadOwnerDraftPhotos())
        setFeedback('تم حفظ الإعلان في قاعدة البيانات وربطه بحسابك الحالي بنجاح.')
        router.push(result.redirectTo)
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'تعذر نشر الإعلان حالياً')
      }
    })
  }

  return (
    <article className="rounded-[32px] border border-emerald-900/10 bg-emerald-700/5 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
      <div className="flex items-center gap-2 text-slate-950">
        <UploadCloud className="h-5 w-5 text-emerald-700" />
        <h2 className="section-title text-xl font-bold sm:text-2xl">نشر فعلي</h2>
      </div>

      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
        ينشئ هذا الزر إعلاناً فعلياً في قاعدة البيانات ويربطه بحسابك الحالي مع الصور المرحلية إن وجدت.
      </p>

      <button type="button" onClick={handlePublish} disabled={isPending} className="btn-base btn-primary mt-5 w-full">
        {isPending ? 'جارٍ نشر الإعلان...' : 'انشر الآن'}
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
      </button>

      {feedback ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-900/10 bg-white/80 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{feedback}</p>
        </div>
      ) : null}
    </article>
  )
}