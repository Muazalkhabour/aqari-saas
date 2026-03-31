'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUpLeft, MessageCircle, Search, Send, Sparkles } from 'lucide-react'
import { DeveloperCredit } from '@/components/developer-credit'

export function SiteFooter() {
  const pathname = usePathname()
  const latestListingsUrl = '/search'
  const [latestShareUrl] = useState(() => (typeof window === 'undefined' ? latestListingsUrl : new URL(latestListingsUrl, window.location.origin).toString()))
  const shareText = 'تابع أحدث العروض العقارية على عقاري سوريا'
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${latestShareUrl}`)}`
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(latestShareUrl)}&text=${encodeURIComponent(shareText)}`

  return (
    <footer className="border-t border-slate-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,249,0.96))] px-4 py-8 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white/75">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                تابع أحدث العروض
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-[1.9rem]">ابق قريباً من العقارات الجديدة والروابط الجاهزة للمشاركة</h2>
              <p className="body-soft mt-3 max-w-xl text-sm text-white/70">انتقل مباشرة إلى أحدث النتائج، ثم شاركها عبر القنوات التي يعتمد عليها جمهورك اليومي.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={latestListingsUrl} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                <Search className="h-4 w-4" />
                تصفح أحدث العروض
              </Link>
              <Link href="/notifications" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                <ArrowUpLeft className="h-4 w-4" />
                تابع التحديثات
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <MessageCircle className="h-4 w-4 text-emerald-300" />
              واتساب
            </a>
            <a href={telegramShareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <Send className="h-4 w-4 text-sky-300" />
              تلغرام
            </a>
            <Link href={latestListingsUrl} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <Search className="h-4 w-4 text-amber-300" />
              صفحة العروض
            </Link>
          </div>
        </div>

        <div>
          <DeveloperCredit prominent={pathname === '/'} />
        </div>
      </div>
    </footer>
  )
}