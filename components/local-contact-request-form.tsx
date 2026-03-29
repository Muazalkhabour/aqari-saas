'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, MessageSquareMore, Send } from 'lucide-react'
import { createLocalContactRequest } from '@/lib/local-marketplace'

type LocalContactRequestFormProps = {
  listingId: string
  listingTitle: string
}

export function LocalContactRequestForm({ listingId, listingTitle }: LocalContactRequestFormProps) {
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => {
      createLocalContactRequest({
        listingId,
        listingTitle,
        fullName: String(formData.get('fullName') || 'زائر مهتم'),
        phone: String(formData.get('phone') || ''),
        preferredTime: String(formData.get('preferredTime') || 'مساءً'),
        message: String(formData.get('message') || `أرغب بمعرفة مزيد من التفاصيل حول ${listingTitle}`),
      })

      setSentMessage('تم حفظ طلب التواصل محلياً. سيظهر الآن داخل لوحة المالك في نفس المتصفح.')
    })
  }

  return (
    <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
      <div className="flex items-center gap-2 text-slate-950">
        <MessageSquareMore className="h-5 w-5 text-emerald-700" />
        <h2 className="section-title text-xl font-bold sm:text-2xl">أرسل طلب تواصل</h2>
      </div>

      <p className="body-soft mt-3 text-sm text-[var(--muted)]">
        النموذج يحاكي استقبال الاستفسارات الآن بدون خادم. كل طلب جديد يُحفظ محلياً ويظهر لصاحب الإعلان داخل لوحة المتابعة.
      </p>

      <form action={handleSubmit} className="mt-5 grid gap-3">
        <input
          name="fullName"
          placeholder="الاسم الكامل"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
        <input
          name="phone"
          placeholder="رقم الهاتف"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
        <select
          name="preferredTime"
          defaultValue="مساءً"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        >
          <option value="صباحاً">صباحاً</option>
          <option value="ظهراً">ظهراً</option>
          <option value="مساءً">مساءً</option>
        </select>
        <textarea
          name="message"
          rows={4}
          defaultValue={`مرحباً، أرغب بالاستفسار عن العقار: ${listingTitle}`}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
        <button type="submit" disabled={isPending} className="btn-base btn-primary w-full">
          {isPending ? 'جارٍ إرسال الطلب...' : 'إرسال طلب التواصل'}
          <Send className="h-4 w-4" />
        </button>
      </form>

      {sentMessage ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-900/10 bg-emerald-700/5 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{sentMessage}</p>
        </div>
      ) : null}
    </article>
  )
}