import Link from 'next/link'
import { ArrowLeft, Building2, LayoutDashboard } from 'lucide-react'
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
                لوحة متابعة المالك
              </div>
              <h1 className="hero-title mt-4 max-w-[34rem] text-[1.55rem] font-bold text-slate-950 sm:text-[1.95rem] lg:text-[2.55rem]">
                <span className="hero-line">إدارة <span className="hero-highlight">عقاراتك</span> وطلبات التواصل</span>
                <span className="hero-line mt-2 sm:mt-3">من نفس المتصفح وبدون قاعدة بيانات</span>
              </h1>
              <p className="hero-subtitle mt-3 max-w-2xl">هنا ترى الإعلانات المحلية التي نشرتها، تغير حالتها، وتراجع الرسائل القادمة من الزوار ضمن تجربة محلية كاملة.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/list-property" className="btn-base btn-primary">
                إعلان جديد
                <Building2 className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-base btn-secondary">
                العودة للرئيسية
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <LocalOwnerDashboard highlightId={params.highlight} />
      </div>
    </main>
  )
}