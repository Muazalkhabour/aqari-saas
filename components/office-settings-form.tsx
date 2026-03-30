'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Building2, MapPin, PenSquare, Phone, ShieldCheck } from 'lucide-react'
import { saveOfficeSettingsAction } from '@/app/actions/office-settings'
import type { OfficeSettings } from '@/lib/office-settings'

type OfficeSettingsFormProps = {
  settings: OfficeSettings
}

function sourceLabel(source: OfficeSettings['dataSource']) {
  return source === 'database' ? 'بيانات المنصة' : 'إعدادات المكتب'
}

type PreviewState = {
  name: string
  email: string
  phone: string
  whatsappNumber: string
  address: string
  logoUrl: string
  managerName: string
  signatureName: string
  sealLabel: string
}

function toPreviewState(settings: OfficeSettings): PreviewState {
  return {
    name: settings.name,
    email: settings.email || '',
    phone: settings.phone || '',
    whatsappNumber: settings.whatsappNumber || '',
    address: settings.address || '',
    logoUrl: settings.logoUrl || '',
    managerName: settings.managerName || '',
    signatureName: settings.signatureName || '',
    sealLabel: settings.sealLabel || '',
  }
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
}

export function OfficeSettingsForm({ settings }: OfficeSettingsFormProps) {
  const [preview, setPreview] = useState<PreviewState>(() => toPreviewState(settings))

  function updatePreview(field: keyof PreviewState, value: string) {
    setPreview((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex items-center gap-2 text-slate-950">
          <Building2 className="h-5 w-5 text-emerald-700" />
          <h2 className="section-title text-xl font-bold sm:text-2xl">بيانات وهوية المكتب</h2>
        </div>

        <p className="body-soft mt-3 text-sm text-[var(--muted)]">
          هذه البيانات تظهر مباشرة في العقود المطبوعة والتقارير.
        </p>

        <form action={saveOfficeSettingsAction} className="mt-6 space-y-5">
          <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
            <div className="text-base font-bold text-slate-950">الهوية الأساسية</div>
            <p className="mt-2 text-sm text-slate-600">هذه الحقول تظهر في رأس العقود والطباعة.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="field-label mb-1 block">اسم المكتب</label>
                <input id="name" name="name" defaultValue={settings.name} required placeholder="مثال: مكتب الشام للعقارات" onChange={(event) => updatePreview('name', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="managerName" className="field-label mb-1 block">اسم المدير أو المسؤول</label>
                <input id="managerName" name="managerName" defaultValue={settings.managerName || ''} placeholder="الاسم الذي يدير المكتب" onChange={(event) => updatePreview('managerName', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="address" className="field-label mb-1 block">العنوان</label>
                <input id="address" name="address" defaultValue={settings.address || ''} placeholder="دمشق - المزة - مثال" onChange={(event) => updatePreview('address', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
            <div className="text-base font-bold text-slate-950">التواصل الرسمي</div>
            <p className="mt-2 text-sm text-slate-600">استخدم بيانات حقيقية هنا إذا كانت العقود ستُشارك مع عملاء فعليين.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="field-label mb-1 block">البريد الإلكتروني</label>
                <input id="email" name="email" type="email" defaultValue={settings.email || ''} placeholder="office@example.com" onChange={(event) => updatePreview('email', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="phone" className="field-label mb-1 block">الهاتف</label>
                <input id="phone" name="phone" defaultValue={settings.phone || ''} placeholder="+963 ..." onChange={(event) => updatePreview('phone', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="whatsappNumber" className="field-label mb-1 block">رقم WhatsApp</label>
                <input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber || ''} placeholder="الرقم الذي سيستخدم لاحقاً في التواصل المباشر" onChange={(event) => updatePreview('whatsappNumber', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
            <div className="text-base font-bold text-slate-950">التوقيع والطباعة</div>
            <p className="mt-2 text-sm text-slate-600">هذه الحقول تظهر في النسخ المطبوعة وملفات PDF.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="signatureName" className="field-label mb-1 block">اسم التوقيع</label>
                <input id="signatureName" name="signatureName" defaultValue={settings.signatureName || ''} placeholder="الاسم الظاهر بجانب التوقيع" onChange={(event) => updatePreview('signatureName', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div>
                <label htmlFor="sealLabel" className="field-label mb-1 block">وصف الختم</label>
                <input id="sealLabel" name="sealLabel" defaultValue={settings.sealLabel || ''} placeholder="مثال: ختم المكتب العقاري" onChange={(event) => updatePreview('sealLabel', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="logoUrl" className="field-label mb-1 block">رابط الشعار</label>
                <input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl || ''} placeholder="https://... أو /logo.png أو data:image/..." onChange={(event) => updatePreview('logoUrl', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
              </div>
            </div>
          </section>

          <button type="submit" className="btn-base btn-primary w-full">
            حفظ الإعدادات
            <PenSquare className="h-4 w-4" />
          </button>
        </form>
      </section>

      <aside className="grid gap-6">
        <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">معاينة مباشرة</h2>
          </div>

          <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-white text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
            <div className="bg-[linear-gradient(135deg,rgba(5,150,105,0.12),rgba(249,115,22,0.06))] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  {preview.logoUrl ? (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2">
                      <div className="relative h-full w-full">
                        <Image src={preview.logoUrl} alt={preview.name || 'شعار المكتب'} fill unoptimized className="object-contain" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-lg font-bold text-white">
                      {initials(preview.name || 'AQ') || 'AQ'}
                    </div>
                  )}

                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-900">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      معاينة العقد
                    </div>
                    <div className="mt-3 text-2xl font-bold text-slate-950">{preview.name || 'اسم المكتب'}</div>
                    <div className="mt-2 text-sm text-slate-600">{preview.address || 'العنوان سيظهر هنا'} | {preview.phone || preview.email || 'بيانات التواصل ستظهر هنا'}</div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <div className="font-semibold text-slate-950">المصدر</div>
                  <div className="mt-1">{sourceLabel(settings.dataSource)}</div>
                  <div className="mt-3 font-semibold text-slate-950">المسؤول</div>
                  <div className="mt-1">{preview.managerName || 'غير محدد بعد'}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-5 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">التوقيع: {preview.signatureName || 'غير محدد بعد'}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">الختم: {preview.sealLabel || 'غير محدد بعد'}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">WhatsApp: {preview.whatsappNumber || 'غير محدد بعد'}</div>
            </div>
          </div>
        </article>

        <article className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex items-center gap-2 text-slate-950">
            <Phone className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">أين ستظهر؟</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في رأس العقود المطبوعة وملفات PDF.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في بيانات التواصل الظاهرة داخل الواجهات.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">في مسار WhatsApp عند تفعيل التكامل الفعلي.</div>
          </div>

          <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-[var(--surface)] p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-emerald-700" />
              ملاحظة عملية
            </div>
            <p className="mt-2">استخدم شعاراً واضحاً وبيانات تواصل دقيقة، لأن هذه التفاصيل هي التي تمنح العقود والتقارير حضوراً احترافياً يرسخ ثقة العميل.</p>
          </div>
        </article>
      </aside>
    </div>
  )
}