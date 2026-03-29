import { Building2, MapPin, PenSquare, Phone, ShieldCheck } from 'lucide-react'
import { saveOfficeSettingsAction } from '@/app/actions/office-settings'
import type { OfficeSettings } from '@/lib/office-settings'

type OfficeSettingsFormProps = {
  settings: OfficeSettings
}

function sourceLabel(source: OfficeSettings['dataSource']) {
  return source === 'database' ? 'قاعدة البيانات' : 'حفظ محلي احتياطي'
}

export function OfficeSettingsForm({ settings }: OfficeSettingsFormProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex items-center gap-2 text-slate-950">
          <Building2 className="h-5 w-5 text-emerald-700" />
          <h2 className="section-title text-xl font-bold sm:text-2xl">بيانات وهوية المكتب</h2>
        </div>

        <p className="body-soft mt-3 text-sm text-[var(--muted)]">
          هذه البيانات ستنعكس مباشرة على العقود المطبوعة، التقارير، وقنوات التنبيه.
        </p>

        <form action={saveOfficeSettingsAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="field-label mb-1 block">اسم المكتب</label>
            <input id="name" name="name" defaultValue={settings.name} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="email" className="field-label mb-1 block">البريد الإلكتروني</label>
            <input id="email" name="email" type="email" defaultValue={settings.email || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="phone" className="field-label mb-1 block">الهاتف</label>
            <input id="phone" name="phone" defaultValue={settings.phone || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="whatsappNumber" className="field-label mb-1 block">رقم WhatsApp</label>
            <input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="managerName" className="field-label mb-1 block">اسم المدير أو المسؤول</label>
            <input id="managerName" name="managerName" defaultValue={settings.managerName || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="field-label mb-1 block">العنوان</label>
            <input id="address" name="address" defaultValue={settings.address || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="signatureName" className="field-label mb-1 block">اسم التوقيع</label>
            <input id="signatureName" name="signatureName" defaultValue={settings.signatureName || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div>
            <label htmlFor="sealLabel" className="field-label mb-1 block">وصف الختم</label>
            <input id="sealLabel" name="sealLabel" defaultValue={settings.sealLabel || ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="logoUrl" className="field-label mb-1 block">رابط الشعار</label>
            <input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl || ''} placeholder="https://... أو data:image/..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          </div>

          <button type="submit" className="btn-base btn-primary sm:col-span-2">
            حفظ إعدادات المكتب
            <PenSquare className="h-4 w-4" />
          </button>
        </form>
      </section>

      <aside className="grid gap-6">
        <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">المعاينة الحالية</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-7 text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">المكتب: {settings.name}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">المصدر: {sourceLabel(settings.dataSource)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">التوقيع: {settings.signatureName || 'غير محدد بعد'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">الختم: {settings.sealLabel || 'غير محدد بعد'}</div>
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex items-center gap-2 text-slate-950">
            <Phone className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">أين ستظهر هذه البيانات؟</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في رأس العقود المطبوعة وتقارير PDF.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في روابط التواصل والإشعارات الداخلية مستقبلاً.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في مسار WhatsApp عندما نفعّل التكامل الفعلي.</div>
          </div>

          <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-[var(--surface)] p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-emerald-700" />
              نصيحة تنفيذية
            </div>
            <p className="mt-2">إذا كان لديك شعار حقيقي الآن، ضعه كرابط محلي أو Data URL أو رابط خارجي من domain مسموح داخل ALLOWED_EXTERNAL_LOGO_HOSTS. تقارير PDF تدعم حالياً PNG و JPG و Data URL للصيغ النقطية.</p>
          </div>
        </article>
      </aside>
    </div>
  )
}