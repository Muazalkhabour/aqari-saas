import { ExternalLink, Sparkles } from 'lucide-react'

type DeveloperCreditProps = {
  prominent?: boolean
}

export function DeveloperCredit({ prominent = false }: DeveloperCreditProps) {
  if (prominent) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-slate-950 p-4 text-white shadow-[0_18px_50px_rgba(2,6,23,0.2)] sm:p-5">
        <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,rgba(16,185,129,0),rgba(16,185,129,0.7),rgba(249,115,22,0.45),rgba(16,185,129,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
        <div className="absolute left-0 top-0 h-28 w-28 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs font-semibold text-white/84 shadow-[0_10px_24px_rgba(2,6,23,0.16)] sm:text-sm">
              <Sparkles className="h-4 w-4" />
              تنفيذ وتطوير
            </div>
            <h2 className="mt-3 flex items-center gap-2 text-[1.65rem] font-bold text-white sm:text-[1.75rem]">
              <span className="text-lg font-semibold text-emerald-100/78 sm:text-xl">&lt;/&gt;</span>
              <span>MUAZ TECH</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/72 sm:text-[0.92rem]">
              منصة عقارية صُممت بعناية لتجمع العروض والإدارة والمتابعة.
            </p>
          </div>

          <a
            href="https://muazdev.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(2,6,23,0.22),0_0_0_1px_rgba(16,185,129,0.08)] transition hover:border-emerald-200/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] lg:self-center"
            style={{ color: '#ffffff' }}
          >
            اكتشف MUAZ TECH
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-slate-950 px-4 py-4 text-center text-white shadow-[0_14px_34px_rgba(2,6,23,0.16)] sm:flex sm:items-center sm:gap-4 sm:text-right">
      <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(16,185,129,0),rgba(16,185,129,0.68),rgba(249,115,22,0.34),rgba(16,185,129,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/7 text-white shadow-[0_0_24px_rgba(16,185,129,0.18)] sm:mx-0">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="relative mt-3 flex-1 sm:mt-0">
        <p className="text-sm font-semibold text-white/84">تنفيذ وتطوير</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-base font-bold text-white sm:justify-start">
          <span className="text-base font-semibold text-emerald-100/78">&lt;/&gt;</span>
          <span>MUAZ TECH</span>
        </p>
        <p className="mt-1 text-xs leading-6 text-white/68">منصة عقارية صُممت بعناية لتجمع العروض والإدارة والمتابعة.</p>
      </div>
      <a
        href="https://muazdev.vercel.app/"
        target="_blank"
        rel="noreferrer"
        className="relative mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.06))] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(16,185,129,0.08)] transition hover:border-emerald-200/24 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] sm:mt-0"
      >
        زيارة الموقع
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}