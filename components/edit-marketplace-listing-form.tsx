'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, Images, LoaderCircle, PencilLine } from 'lucide-react'
import { updateListingAction } from '@/app/actions/marketplace'
import { useOwnerDraftPhotos } from '@/components/use-owner-draft-photos'

type EditMarketplaceListingFormProps = {
  listingId: string
  initialValues: {
    title: string
    governorate: string
    district: string
    neighborhood: string
    type: 'بيع' | 'إيجار'
    priceValue: number
    paymentPeriod: string
    areaSqm: number
    rooms: number
    bathrooms: number
    floor: string
    furnishing: string
    ownership: string
    status: string
    description: string
    highlight: string
    features: string
    suitableFor: string
    contactName: string
    contactPhone: string
    contactWhatsApp: string
  }
  existingImages: Array<{ src: string; label: string }>
}

function formatPriceLabel(priceValue: number, type: 'بيع' | 'إيجار', paymentPeriod: string) {
  const formattedPrice = new Intl.NumberFormat('en-US').format(priceValue)

  if (type === 'بيع') {
    return `${formattedPrice} دولار`
  }

  if (paymentPeriod === 'سنوي') {
    return `${formattedPrice} دولار سنوياً`
  }

  return `${formattedPrice} دولار شهرياً`
}

export function EditMarketplaceListingForm({ listingId, initialValues, existingImages }: EditMarketplaceListingFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const stagedPhotos = useOwnerDraftPhotos()

  const stagedMessage = useMemo(() => {
    if (stagedPhotos.length === 0) {
      return 'لا توجد صور مرحلية جديدة. إذا حفظت الآن فستبقى صور الإعلان الحالية كما هي.'
    }

    return `هناك ${stagedPhotos.length} صورة مرحلية جديدة. عند الحفظ سيتم استبدال صور الإعلان الحالية بها.`
  }, [stagedPhotos.length])

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const type = String(formData.get('type') || initialValues.type) as 'بيع' | 'إيجار'
        const priceValue = Number(formData.get('price') || initialValues.priceValue)
        const paymentPeriod = String(formData.get('paymentPeriod') || initialValues.paymentPeriod)

        const result = await updateListingAction(
          listingId,
          {
            title: String(formData.get('title') || ''),
            governorate: String(formData.get('governorate') || ''),
            district: String(formData.get('district') || ''),
            neighborhood: String(formData.get('neighborhood') || ''),
            type,
            priceValue,
            priceLabel: formatPriceLabel(priceValue, type, paymentPeriod),
            paymentPeriod,
            areaSqm: Number(formData.get('areaSqm') || 0),
            rooms: Number(formData.get('rooms') || 0),
            bathrooms: Number(formData.get('bathrooms') || 0),
            floor: String(formData.get('floor') || ''),
            furnishing: String(formData.get('furnishing') || ''),
            ownership: String(formData.get('ownership') || ''),
            status: String(formData.get('status') || ''),
            description: String(formData.get('description') || ''),
            highlight: String(formData.get('highlight') || ''),
            features: String(formData.get('features') || '').split(/[،،,]/).map((item) => item.trim()).filter(Boolean),
            suitableFor: String(formData.get('suitableFor') || '').split(/[،،,]/).map((item) => item.trim()).filter(Boolean),
            contactName: String(formData.get('contactName') || ''),
            contactPhone: String(formData.get('contactPhone') || ''),
            contactWhatsApp: String(formData.get('contactWhatsApp') || ''),
          },
          stagedPhotos,
        )

        setMessage('تم تحديث الإعلان في قاعدة البيانات بنجاح.')
        router.push(result.redirectTo)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'تعذر تحديث الإعلان حالياً')
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
      <form action={handleSubmit} className="rounded-[36px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] sm:p-8">
        <div className="flex items-center gap-2 text-slate-950">
          <PencilLine className="h-5 w-5 text-emerald-700" />
          <h2 className="section-title text-xl font-bold sm:text-2xl">تعديل بيانات الإعلان</h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input name="title" defaultValue={initialValues.title} className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <select name="type" defaultValue={initialValues.type} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"><option value="بيع">بيع</option><option value="إيجار">إيجار</option></select>
          <input name="governorate" defaultValue={initialValues.governorate} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="district" defaultValue={initialValues.district} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="neighborhood" defaultValue={initialValues.neighborhood} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="price" defaultValue={initialValues.priceValue} inputMode="numeric" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <select name="paymentPeriod" defaultValue={initialValues.paymentPeriod} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"><option value="مرة واحدة">دفعة بيع نهائية</option><option value="شهري">إيجار شهري</option><option value="سنوي">إيجار سنوي</option></select>
          <input name="areaSqm" defaultValue={initialValues.areaSqm} inputMode="numeric" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="rooms" defaultValue={initialValues.rooms} inputMode="numeric" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="bathrooms" defaultValue={initialValues.bathrooms} inputMode="numeric" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="floor" defaultValue={initialValues.floor} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <select name="furnishing" defaultValue={initialValues.furnishing} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"><option value="غير مفروش">غير مفروش</option><option value="نصف مفروش">نصف مفروش</option><option value="مفروش">مفروش</option></select>
          <select name="ownership" defaultValue={initialValues.ownership} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"><option value="مالك مباشر">مالك مباشر</option><option value="مكتب عقاري">مكتب عقاري</option></select>
          <input name="status" defaultValue={initialValues.status} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="contactName" defaultValue={initialValues.contactName} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="contactPhone" defaultValue={initialValues.contactPhone} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="contactWhatsApp" defaultValue={initialValues.contactWhatsApp} className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <input name="highlight" defaultValue={initialValues.highlight} className="sm:col-span-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <textarea name="description" rows={4} defaultValue={initialValues.description} className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <textarea name="features" rows={3} defaultValue={initialValues.features} className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
          <textarea name="suitableFor" rows={2} defaultValue={initialValues.suitableFor} className="sm:col-span-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
        </div>

        <button type="submit" disabled={isPending} className="btn-base btn-primary mt-6 w-full">
          {isPending ? 'جارٍ حفظ التعديلات...' : 'حفظ التعديلات'}
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
        </button>

        {message ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-900/10 bg-emerald-700/5 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{message}</p>
          </div>
        ) : null}
      </form>

      <aside className="space-y-6">
        <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="flex items-center gap-2 text-slate-950">
            <Images className="h-5 w-5 text-emerald-700" />
            <h2 className="section-title text-xl font-bold sm:text-2xl">صور الإعلان الحالية</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {existingImages.map((image, index) => (
              <div key={`${image.src}-${index}`} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                <div className="relative aspect-[4/3]">
                  <Image src={image.src} alt={image.label} fill unoptimized={image.src.startsWith('data:')} className="object-cover" />
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-slate-800">{image.label}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <h2 className="section-title text-xl font-bold sm:text-2xl">تحديث الصور</h2>
          <p className="mt-4 text-sm leading-7 text-white/80">{stagedMessage}</p>
          <a href="/list-property/photos" className="btn-base btn-secondary mt-5 w-full justify-center">اذهب إلى صفحة الصور المرحلية</a>
        </article>
      </aside>
    </div>
  )
}