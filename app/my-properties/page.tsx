import Link from 'next/link'
import { ArrowLeft, Building2, LayoutDashboard, Search, Sparkles } from 'lucide-react'
import { LocalOwnerDashboard } from '@/components/local-owner-dashboard'

type MyPropertiesPageProps = {
  searchParams: Promise<{ highlight?: string }>
}

export default async function MyPropertiesPage({ searchParams }: MyPropertiesPageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[36px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_24px_80px_rgba(16,42,67,0.12)] sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="eyebrow-text inline-flex items-center gap-2 rounded-full border border-emerald-800/10 bg-white/70 px-4 py-2 text-emerald-900">
                <LayoutDashboard className="h-4 w-4" />
                لوحة المالك
              </div>
              <h1 className="hero-title mt-4 max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">تابع عقاراتك</span>
                <span className="hero-line mt-2 sm:mt-3">ثم راجع الطلبات الجديدة</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">هذه هي شاشة المتابعة الأساسية للمالك: إعلانك أولاً، ثم طلبات التواصل، ثم أي تعديل سريع تحتاجه.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/list-property" className="btn-base btn-primary">
                إعلان جديد
                <Building2 className="h-4 w-4" />
              </Link>
              <Link href="/search" className="btn-base btn-secondary">
                افتح البحث
                <Search className="h-4 w-4" />
              </Link>
              <Link href="/auth?mode=signin&role=owner" className="btn-base btn-secondary">
                بوابة المالك
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="flex items-center gap-2 text-slate-950">
              <Sparkles className="h-5 w-5 text-emerald-700" />
              <div className="text-base font-bold">ابدأ من هنا</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">ابدأ بمراجعة حالة الإعلانات لمعرفة ما يحتاج تعديلاً سريعاً.</p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="text-base font-bold text-slate-950">الإجراء الأسرع</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">أضف إعلاناً جديداً أو حدّث الصور إذا كنت تريد تحسين عرض عقار موجود.</p>
          </article>
          <article className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
            <div className="text-base font-bold text-slate-950">بعد النشر</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">تابع طلبات التواصل هنا، ثم افتح البحث لترى كيف يظهر إعلانك للزوار.</p>
          </article>
        </section>

        <LocalOwnerDashboard highlightId={params.highlight} />
      </div>
    </main>
  )
}