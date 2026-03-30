'use client'

import { useEffect, useRef, useState } from 'react'
import { BellRing, Building2, FileText, MapPinned } from 'lucide-react'

export function HomePlatformShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  const mobileCards = [
    'العقار',
    'الخريطة',
    'العقد والمتابعة',
    'لوحة الإدارة',
  ]

  function getSwipeCards() {
    const container = scrollContainerRef.current
    if (!container) {
      return []
    }

    return Array.from(container.querySelectorAll<HTMLElement>('[data-swipe-card]'))
  }

  function updateActiveCard() {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const cards = getSwipeCards()
    if (cards.length === 0) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2
    const cardCenters = cards.map((card) => {
      const cardRect = card.getBoundingClientRect()
      return cardRect.left + cardRect.width / 2
    })

    let closestIndex = 0
    let smallestDistance = Number.POSITIVE_INFINITY

    cardCenters.forEach((cardCenter, index) => {
      const distance = Math.abs(cardCenter - containerCenter)
      if (distance < smallestDistance) {
        smallestDistance = distance
        closestIndex = index
      }
    })

    let nextProgress = closestIndex

    if (closestIndex < cards.length - 1) {
      const currentCenter = cardCenters[closestIndex]
      const nextCenter = cardCenters[closestIndex + 1]
      const segmentWidth = Math.abs(nextCenter - currentCenter)

      if (segmentWidth > 0) {
        const interpolatedProgress = closestIndex + (containerCenter - currentCenter) / (nextCenter - currentCenter)
        nextProgress = Number.isFinite(interpolatedProgress)
          ? Math.max(0, Math.min(cards.length - 1, interpolatedProgress))
          : closestIndex
      }
    } else if (closestIndex > 0) {
      const previousCenter = cardCenters[closestIndex - 1]
      const currentCenter = cardCenters[closestIndex]
      const segmentWidth = Math.abs(currentCenter - previousCenter)

      if (segmentWidth > 0) {
        const interpolatedProgress = closestIndex - 1 + (containerCenter - previousCenter) / (currentCenter - previousCenter)
        nextProgress = Number.isFinite(interpolatedProgress)
          ? Math.max(0, Math.min(cards.length - 1, interpolatedProgress))
          : closestIndex
      }
    }

    setActiveCardIndex(closestIndex)
    setScrollProgress(nextProgress)
  }

  function scrollToCard(index: number) {
    const cards = getSwipeCards()
    const targetCard = cards[index]
    if (!targetCard) {
      return
    }

    targetCard.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })

    setActiveCardIndex(index)
    setScrollProgress(index)
  }

  useEffect(() => {
    updateActiveCard()

    function handleResize() {
      updateActiveCard()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="order-1 pulse-glow-soft relative self-start overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:p-6 lg:order-2 lg:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
      <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-emerald-500/18 blur-3xl" />
      <div className="absolute -left-8 bottom-8 h-28 w-28 rounded-full bg-orange-500/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute left-[44%] top-[11rem] h-px w-[24%] bg-gradient-to-r from-emerald-400/0 via-emerald-300/60 to-sky-300/0" />
        <div className="absolute left-[44%] top-[22rem] h-px w-[24%] bg-gradient-to-r from-orange-300/0 via-orange-200/60 to-emerald-300/0" />
        <div className="absolute left-[56%] top-[11rem] h-[11rem] w-px bg-gradient-to-b from-sky-200/0 via-white/25 to-white/0" />
      </div>

      <div className="relative">
        <div className="reveal-fade-up inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
          مشهد المنصة في شاشة واحدة
        </div>
        <h2 className="section-title reveal-fade-up reveal-delay-1 mt-4 text-xl font-bold sm:text-[2rem]">العقار ليس مجرد إعلان هنا، بل بداية رحلة كاملة من الاكتشاف إلى الإدارة.</h2>
        <p className="body-soft reveal-fade-up reveal-delay-2 mt-3 hidden max-w-xl text-sm text-white/75 sm:block">
          في هذا المشهد ترى الفرق مباشرة: عرض عقار واضح، خريطة تساعد على القرار، عقد جاهز للمتابعة، ولوحة تشغيل تعطي المكتب تحكماً فعلياً.
        </p>
        <p className="body-soft reveal-fade-up reveal-delay-2 mt-3 text-sm text-white/75 sm:hidden">
          بحث، خريطة، عقد، وإدارة في تجربة واحدة أوضح وأسرع.
        </p>

        <div className="reveal-fade-up reveal-delay-2 mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/78">
          <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">بحث + خريطة</div>
          <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2">عقد + دفعات</div>
          <div className="hidden rounded-full border border-white/10 bg-white/8 px-3 py-2 sm:block">صيانة + إشعارات</div>
          <div className="hidden rounded-full border border-white/10 bg-white/8 px-3 py-2 sm:block">لوحة تشغيل واحدة</div>
        </div>

        <div className="reveal-fade-up reveal-delay-3 mt-4 sm:hidden">
          <div ref={scrollContainerRef} onScroll={updateActiveCard} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
            <article data-swipe-card className="min-w-[82%] snap-center rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/55">العقار</div>
                  <div className="mt-2 text-base font-bold">شقة عائلية في المزة الغربية</div>
                  <div className="mt-2 text-sm text-white/70">3 غرف • 180 م² • جاهزة للسكن</div>
                </div>
                <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-black/15 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">إيجار</span>
                  <span className="font-bold text-white">850$ شهرياً</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-white/8 px-2 py-3">صور واضحة</div>
                  <div className="rounded-2xl bg-white/8 px-2 py-3">وصف مختصر</div>
                  <div className="rounded-2xl bg-white/8 px-2 py-3">تواصل سريع</div>
                </div>
              </div>
            </article>

            <article data-swipe-card className="min-w-[82%] snap-center rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/55">الخريطة</div>
                  <div className="mt-2 text-base font-bold">موقع العرض وقربه من الباحث</div>
                  <div className="mt-2 text-sm text-white/70">تعرف بسرعة أين يقع العقار وما إذا كان الأقرب لك.</div>
                </div>
                <div className="rounded-2xl bg-sky-500/14 p-3 text-sky-200">
                  <MapPinned className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-black/15 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>الموقع</span>
                  <span className="font-bold text-white">المزة الغربية</span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/8 px-3 py-3 text-xs">
                  <span>حالة العرض</span>
                  <span className="font-bold text-emerald-200">الأقرب لك</span>
                </div>
              </div>
            </article>

            <article data-swipe-card className="min-w-[82%] snap-center rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/55">العقد والمتابعة</div>
                  <div className="mt-2 text-base font-bold">التوقيع بداية المتابعة</div>
                  <div className="mt-2 text-sm text-white/70">كل ما بعد السكن يبقى واضحاً داخل المنصة.</div>
                </div>
                <div className="rounded-2xl bg-orange-500/14 p-3 text-orange-200">
                  <FileText className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-white/80">
                <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                  <span>حالة العقد</span>
                  <span className="font-bold text-emerald-200">نشط حتى 2027</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                  <span>الدفعة القادمة</span>
                  <span className="font-bold text-white">05 أبريل</span>
                </div>
              </div>
            </article>

            <article data-swipe-card className="min-w-[82%] snap-center rounded-[24px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/55">لوحة الإدارة</div>
                  <div className="mt-2 text-base font-bold">كل المؤشرات في مكان واحد</div>
                  <div className="mt-2 text-sm text-white/70">المكتب يرى العقود والطلبات والتنبيهات من لقطة واحدة.</div>
                </div>
                <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                  <BellRing className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80">
                <div className="rounded-2xl bg-black/15 px-3 py-3 text-center">
                  <div className="text-white/55">العقود</div>
                  <div className="mt-1 font-bold text-amber-200">12</div>
                </div>
                <div className="rounded-2xl bg-black/15 px-3 py-3 text-center">
                  <div className="text-white/55">الطلبات</div>
                  <div className="mt-1 font-bold text-sky-200">18</div>
                </div>
                <div className="rounded-2xl bg-black/15 px-3 py-3 text-center">
                  <div className="text-white/55">الإشعارات</div>
                  <div className="mt-1 font-bold text-emerald-200">7</div>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-3">
            <div className="mx-auto grid max-w-[17rem] grid-cols-4 gap-2 rounded-full border border-white/10 bg-white/6 p-1">
              {mobileCards.map((label, index) => {
                const distance = Math.abs(scrollProgress - index)
                const emphasis = Math.max(0, 1 - Math.min(distance, 1))
                const backgroundOpacity = 0.12 + emphasis * 0.78
                const borderOpacity = 0.1 + emphasis * 0.32
                const textOpacity = 0.55 + emphasis * 0.45
                const scale = 0.92 + emphasis * 0.14

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => scrollToCard(index)}
                    aria-label={`الانتقال إلى بطاقة ${label}`}
                    aria-pressed={index === activeCardIndex}
                    className="rounded-full px-1 py-2 text-center text-[11px] font-semibold transition-all duration-300 ease-out"
                    style={{
                      backgroundColor: `rgba(255,255,255,${backgroundOpacity})`,
                      border: `1px solid rgba(255,255,255,${borderOpacity})`,
                      color: index === activeCardIndex
                        ? 'rgb(15 23 42)'
                        : `rgba(255,255,255,${textOpacity})`,
                      transform: `scale(${scale})`,
                      boxShadow: emphasis > 0.2 ? `0 10px 24px rgba(255,255,255,${0.08 + emphasis * 0.12})` : 'none',
                    }}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-white/55">
              {mobileCards.map((label, index) => (
                <button
                  key={`${label}-label`}
                  type="button"
                  onClick={() => scrollToCard(index)}
                  className={index === activeCardIndex
                    ? 'rounded-full bg-white/10 px-2 py-1 text-white transition-all duration-300 ease-out'
                    : 'rounded-full px-2 py-1 text-white/45 transition-all duration-300 ease-out'
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-center text-[11px] text-white/60">
              <span>اسحب أو اضغط للانتقال بين 4 بطاقات</span>
            </div>
          </div>
        </div>

        <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
          <article className="float-soft reveal-fade-up reveal-delay-2 overflow-hidden rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/55">العقار</div>
                <div className="mt-2 text-lg font-bold">شقة عائلية في المزة الغربية</div>
                <div className="mt-2 text-sm text-white/70">3 غرف • 180 م² • جاهزة للسكن</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/12 to-white/0 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">إيجار</span>
                <span className="font-bold text-white">850$ شهرياً</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/75">
                <div className="rounded-2xl bg-black/15 px-2 py-3">صور واضحة</div>
                <div className="rounded-2xl bg-black/15 px-2 py-3">وصف مختصر</div>
                <div className="rounded-2xl bg-black/15 px-2 py-3">تواصل سريع</div>
              </div>
            </div>
          </article>

          <article className="float-soft-delay reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/55">الخريطة</div>
                <div className="mt-2 text-lg font-bold">موقع العرض وقربه من الباحث</div>
              </div>
              <div className="rounded-2xl bg-sky-500/14 p-3 text-sky-200">
                <MapPinned className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="h-12 rounded-2xl bg-white/8" />
                <div className="h-12 rounded-2xl bg-white/8" />
                <div className="h-12 rounded-2xl bg-white/8" />
                <div className="h-12 rounded-2xl bg-white/8" />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/15 px-3 py-2 text-xs text-white/75">
                <span>المزة الغربية</span>
                <span>الأقرب لك</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="h-3 w-3 rounded-full bg-sky-400" />
              </div>
            </div>
          </article>
        </div>

        <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <article className="reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/55">العقد والمتابعة</div>
                <div className="mt-2 text-lg font-bold">التوقيع ليس النهاية، بل بداية المتابعة المنظمة</div>
              </div>
              <div className="rounded-2xl bg-orange-500/14 p-3 text-orange-200">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/78">
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>حالة العقد</span>
                <span className="font-bold text-emerald-200">نشط حتى 2027</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>الدفعة القادمة</span>
                <span className="font-bold text-white">05 أبريل</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>الصيانة</span>
                <span className="font-bold text-white">طلب واحد مفتوح</span>
              </div>
            </div>
          </article>

          <article className="reveal-fade-up reveal-delay-3 rounded-[28px] border border-white/12 bg-white/7 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/55">لوحة الإدارة</div>
                <div className="mt-2 text-lg font-bold">المكتب يرى الصورة كاملة في لحظة واحدة</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/14 p-3 text-emerald-200">
                <BellRing className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-white/80">
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>عقود تنتهي قريباً</span>
                <span className="rounded-full bg-amber-400/20 px-2 py-1 font-bold text-amber-200">12</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>طلبات جديدة</span>
                <span className="rounded-full bg-sky-400/20 px-2 py-1 font-bold text-sky-200">18</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/15 px-4 py-3">
                <span>إشعارات تحتاج متابعة</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 font-bold text-emerald-200">7</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}