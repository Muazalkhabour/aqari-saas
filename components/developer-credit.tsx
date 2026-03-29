import { Code2, ExternalLink } from 'lucide-react'

type DeveloperCreditProps = {
  prominent?: boolean
}

export function DeveloperCredit({ prominent = false }: DeveloperCreditProps) {
  if (prominent) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white/82 p-5 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-6">
        <div className="absolute left-0 top-0 h-24 w-24 -translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-700/10 px-3 py-1.5 text-emerald-900 sm:text-sm">
              <Code2 className="h-4 w-4" />
              بطاقة تعريف المطور
            </div>
            <h2 className="section-title mt-3 text-lg font-bold text-slate-950 sm:text-xl">تم تطوير هذه المنصة بواسطة المبرمج معاذ الشمطي</h2>
            <p className="body-soft mt-2 text-sm text-[var(--muted)]">
              للاطلاع على أعمال المطور أو الانتقال إلى موقعه مباشرة، يمكنك زيارة MUAZ TECH من هنا.
            </p>
          </div>

          <a
            href="https://muazdev.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="btn-base btn-primary btn-sm self-start lg:self-center"
          >
            زيارة موقع MUAZ TECH
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] border border-emerald-700/10 bg-white/70 px-4 py-4 text-center shadow-[0_10px_30px_rgba(16,42,67,0.06)] sm:flex-row sm:text-right">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700/10 text-emerald-900">
        <Code2 className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">تم تطوير هذه المنصة بواسطة المبرمج معاذ الشمطي</p>
        <p className="body-soft mt-1 text-xs text-[var(--muted)]">اضغط للانتقال إلى الموقع الشخصي للمطور.</p>
      </div>
      <a
        href="https://muazdev.vercel.app/"
        target="_blank"
        rel="noreferrer"
        className="btn-base btn-secondary btn-sm btn-pill"
      >
        MUAZ TECH
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}