'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarRange, RefreshCcw } from 'lucide-react'

type BulkRenewReviewContract = {
  id: string
  tenantName: string
  propertyId: string
  propertyTitle: string
  unitNumber: string
  endDate: string
  proposedEndDate: string
  rentAmount: number
  totalOutstanding: number
}

type BulkRenewReviewFormProps = {
  action: (formData: FormData) => void | Promise<void>
  extensionMonths: number
  contracts: BulkRenewReviewContract[]
}

type PropertyGroup = {
  propertyId: string
  propertyTitle: string
  contracts: BulkRenewReviewContract[]
}

function groupContractsByProperty(contracts: BulkRenewReviewContract[]): PropertyGroup[] {
  const groups = new Map<string, PropertyGroup>()

  contracts.forEach((contract) => {
    const existingGroup = groups.get(contract.propertyId)
    if (existingGroup) {
      existingGroup.contracts.push(contract)
      return
    }

    groups.set(contract.propertyId, {
      propertyId: contract.propertyId,
      propertyTitle: contract.propertyTitle,
      contracts: [contract],
    })
  })

  return Array.from(groups.values())
}

export function BulkRenewReviewForm({ action, extensionMonths, contracts }: BulkRenewReviewFormProps) {
  const propertyGroups = useMemo(() => groupContractsByProperty(contracts), [contracts])
  const [selectedIds, setSelectedIds] = useState<string[]>(() => contracts.map((contract) => contract.id))

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCount = selectedIds.length
  const selectedPropertySummaries = useMemo(
    () => propertyGroups.map((group) => ({
      propertyId: group.propertyId,
      propertyTitle: group.propertyTitle,
      selectedCount: group.contracts.filter((contract) => selectedIdsSet.has(contract.id)).length,
      totalCount: group.contracts.length,
    })),
    [propertyGroups, selectedIdsSet]
  )
  const selectedPropertiesCount = selectedPropertySummaries.filter((group) => group.selectedCount > 0).length

  const toggleContract = (contractId: string) => {
    setSelectedIds((current) => (current.includes(contractId) ? current.filter((id) => id !== contractId) : [...current, contractId]))
  }

  const selectPropertyContracts = (propertyContracts: BulkRenewReviewContract[]) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      propertyContracts.forEach((contract) => next.add(contract.id))
      return Array.from(next)
    })
  }

  const deselectPropertyContracts = (propertyContracts: BulkRenewReviewContract[]) => {
    const propertyIds = new Set(propertyContracts.map((contract) => contract.id))
    setSelectedIds((current) => current.filter((contractId) => !propertyIds.has(contractId)))
  }

  const selectAllContracts = () => {
    setSelectedIds(contracts.map((contract) => contract.id))
  }

  const clearAllContracts = () => {
    setSelectedIds([])
  }

  return (
    <form action={action} className="space-y-6">
      {selectedIds.map((contractId) => (
        <input key={contractId} type="hidden" name="contractIds" value={contractId} />
      ))}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-white/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">العقود المحددة حالياً</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{selectedCount}</div>
          <p className="mt-2 text-sm text-slate-600">من أصل {contracts.length} عقداً جاهزاً للتجديد الجماعي.</p>
        </div>
        <div className="rounded-[28px] border border-white/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">مدة التمديد</div>
          <div className="mt-3 text-3xl font-bold text-slate-950">{extensionMonths} شهر</div>
          <p className="mt-2 text-sm text-slate-600">يمكن تعديلها قبل تنفيذ العملية لجميع العقود المختارة.</p>
        </div>
        <div className="rounded-[28px] border border-white/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
          <div className="stat-label">نوع التنفيذ</div>
          <div className="mt-3 text-xl font-bold text-slate-950">تجديد مع حفظ السجل والإشعارات</div>
          <p className="mt-2 text-sm text-slate-600">يشمل السجل الكامل والتنبيهات المهمة لضمان متابعة أوضح بعد التنفيذ.</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-title text-xl font-bold text-slate-950 sm:text-2xl">ملخص التحديد الحي قبل التنفيذ</h2>
            <p className="mt-2 text-sm text-slate-600">{selectedPropertiesCount} عقارات فيها عقود محددة حالياً من أصل {propertyGroups.length} عقارات.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            {selectedCount} عقداً محدداً للتنفيذ الآن
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {selectedPropertySummaries.map((group) => {
            const isActive = group.selectedCount > 0

            return (
              <a
                key={group.propertyId}
                href={`#bulk-renew-property-${group.propertyId}`}
                className={`rounded-[24px] border p-4 text-right transition ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {group.selectedCount} / {group.totalCount}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{group.propertyId}</div>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-950">{group.propertyTitle}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {isActive ? `جاهز حالياً بـ ${group.selectedCount} عقود محددة.` : 'لا توجد عقود محددة لهذا العقار حالياً.'}
                </p>
              </a>
            )
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        <div className="flex items-center gap-2 text-slate-950">
          <CalendarRange className="h-5 w-5 text-emerald-700" />
          <h2 className="section-title text-xl font-bold sm:text-2xl">إعدادات التنفيذ الجماعي</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="extensionMonths" className="mb-1 block text-sm font-semibold text-slate-700">مدة التمديد بالأشهر</label>
            <input id="extensionMonths" name="extensionMonths" type="number" min="1" max="24" step="1" defaultValue={String(extensionMonths)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label htmlFor="rentAdjustment" className="mb-1 block text-sm font-semibold text-slate-700">زيادة موحدة على الإيجار</label>
            <input id="rentAdjustment" name="rentAdjustment" type="number" min="0" step="1" defaultValue="0" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          سيتم تمديد كل عقد مختار انطلاقاً من تاريخ نهايته الحالي مع تسجيل الحدث وإرسال الإشعارات المرتبطة تلقائياً.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={selectAllContracts} className="btn-base btn-secondary">
            تحديد جميع العقود
          </button>
          <button type="button" onClick={clearAllContracts} className="btn-base btn-secondary">
            إلغاء تحديد جميع العقود
          </button>
        </div>
      </section>

      <section className="space-y-5">
        {propertyGroups.map((group) => {
          const selectedInGroup = group.contracts.filter((contract) => selectedIdsSet.has(contract.id)).length

          return (
            <div id={`bulk-renew-property-${group.propertyId}`} key={group.propertyId} className="rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_20px_60px_rgba(16,42,67,0.08)] scroll-mt-28">
              <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800/70">{group.propertyId}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-950">{group.propertyTitle}</h3>
                    <div className={`rounded-full px-3 py-1 text-xs font-bold ${selectedInGroup > 0 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {selectedInGroup} / {group.contracts.length}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{selectedInGroup} من {group.contracts.length} عقود محددة لهذا العقار.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => selectPropertyContracts(group.contracts)} className="btn-base btn-secondary">
                    تحديد كل عقود العقار
                  </button>
                  <button type="button" onClick={() => deselectPropertyContracts(group.contracts)} className="btn-base btn-secondary">
                    إلغاء تحديد عقود العقار
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {group.contracts.map((contract) => {
                  const isSelected = selectedIdsSet.has(contract.id)

                  return (
                    <label key={contract.id} className="flex cursor-pointer flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 transition hover:border-emerald-200 hover:bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800/70">{contract.id}</div>
                          <h4 className="mt-2 text-xl font-bold text-slate-950">{contract.tenantName}</h4>
                          <p className="mt-2 text-sm text-slate-600">الوحدة {contract.unitNumber}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleContract(contract.id)}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-700"
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">نهاية حالية: <span className="font-bold text-slate-950">{contract.endDate}</span></div>
                        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">نهاية مقترحة: <span className="font-bold text-slate-950">{contract.proposedEndDate}</span></div>
                        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">الإيجار الحالي: <span className="font-bold text-slate-950">{contract.rentAmount} $</span></div>
                        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">المبالغ المعلقة: <span className="font-bold text-slate-950">{contract.totalOutstanding} $</span></div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={selectedCount === 0} className="btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          تنفيذ التجديد الجماعي
          <RefreshCcw className="h-4 w-4" />
        </button>
        <Link href="/contracts?lifecycle=ending-soon" className="btn-base btn-secondary">
          مراجعة العقود القريبة أولاً
        </Link>
      </div>
    </form>
  )
}