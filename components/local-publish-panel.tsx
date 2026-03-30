'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LoaderCircle, UploadCloud } from 'lucide-react'
import { createListingFromFormData, upsertLocalListing } from '@/lib/local-marketplace'

type LocalPublishPanelProps = {
  values: Record<string, string>
}

export function LocalPublishPanel({ values }: LocalPublishPanelProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    startTransition(() => {
      const formData = new FormData()

      Object.entries(values).forEach(([key, value]) => {
        formData.set(key, value)
      })

      const listing = createListingFromFormData(formData)
      upsertLocalListing(listing)
      setFeedback('تم نشر الإعلان بنجاح، ويمكنك الآن متابعته واستقبال الطلبات من لوحة المالك.')
      router.push(`/my-properties?highlight=${listing.id}`)
    })
  }

  return (
    <article className="rounded-[32px] border border-emerald-900/10 bg-emerald-700/5 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
      <div className="flex items-center gap-2 text-slate-950">
        <UploadCloud className="h-5 w-5 text-emerald-700" />
        <h2 className="section-title text-xl font-bold sm:text-2xl">نشر الإعلان</h2>
      </div>

      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
        انشر إعلانك الآن ليظهر ضمن البحث ويبدأ باستقبال الاهتمام والطلبات من الزوار.
      </p>

      <button
        type="button"
        onClick={handlePublish}
        disabled={isPending}
        className="btn-base btn-primary mt-5 w-full"
      >
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