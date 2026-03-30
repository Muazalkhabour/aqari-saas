import { governorates } from '@/lib/syrian-real-estate-demo'

type SearchFiltersProps = {
  current: {
    query?: string
    type?: string
    governorate?: string
    minPrice?: string
    maxPrice?: string
    minRooms?: string
    furnishing?: string
  }
}

export function SearchFilters({ current }: SearchFiltersProps) {
  return (
    <form className="grid gap-4 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] lg:grid-cols-6" action="/search">
      <div className="lg:col-span-6">
        <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">ابدأ بفلاتر قليلة</h2>
        <p className="body-soft mt-2 text-sm text-[var(--muted)]">اختر ما يهمك أولاً، ثم أضف المزيد من التحديدات فقط عندما تريد الوصول إلى فرصة أدق.</p>
      </div>

      <div className="lg:col-span-2">
        <label htmlFor="query" className="field-label mb-1 block">
          ما الذي تبحث عنه؟
        </label>
        <input
          id="query"
          name="query"
          defaultValue={current.query ?? ''}
          placeholder="مثال: المزة، مفروش، كراج"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
      </div>

      <div>
        <label htmlFor="type" className="field-label mb-1 block">
          نوع العرض
        </label>
        <select
          id="type"
          name="type"
          defaultValue={current.type ?? 'الكل'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        >
          <option value="الكل">الكل</option>
          <option value="إيجار">إيجار</option>
          <option value="بيع">بيع</option>
        </select>
      </div>

      <div>
        <label htmlFor="governorate" className="field-label mb-1 block">
          المكان
        </label>
        <select
          id="governorate"
          name="governorate"
          defaultValue={current.governorate ?? 'الكل'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 sm:min-w-[11rem] sm:text-base"
        >
          <option value="الكل">كل المحافظات</option>
          {governorates.map((governorate) => (
            <option key={governorate} value={governorate}>
              {governorate}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="minPrice" className="field-label mb-1 block">
          من سعر
        </label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          defaultValue={current.minPrice ?? ''}
          placeholder="150"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
      </div>

      <div>
        <label htmlFor="maxPrice" className="field-label mb-1 block">
          إلى سعر
        </label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          defaultValue={current.maxPrice ?? ''}
          placeholder="60000"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />
      </div>

      <div>
        <label htmlFor="minRooms" className="field-label mb-1 block">
          الغرف
        </label>
        <select
          id="minRooms"
          name="minRooms"
          defaultValue={current.minRooms ?? '0'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        >
          <option value="0">أي عدد</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div>
        <label htmlFor="furnishing" className="field-label mb-1 block">
          الفرش
        </label>
        <select
          id="furnishing"
          name="furnishing"
          defaultValue={current.furnishing ?? 'الكل'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        >
          <option value="الكل">الكل</option>
          <option value="مفروش">مفروش</option>
          <option value="غير مفروش">غير مفروش</option>
          <option value="نصف مفروش">نصف مفروش</option>
        </select>
      </div>

      <div className="flex items-end gap-3 lg:col-span-2">
        <button
          type="submit"
          className="btn-base btn-primary w-full"
        >
          اكتشف النتائج
        </button>
        <a
          href="/search"
          className="btn-base btn-secondary w-full"
        >
          إعادة الضبط
        </a>
      </div>
    </form>
  )
}