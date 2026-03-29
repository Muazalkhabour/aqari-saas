import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Building2, CalendarRange, CreditCard, FileText, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { ContractPrintControls } from '@/components/contract-print-controls'
import { getContractPrintData } from '@/lib/reporting'

export const dynamic = 'force-dynamic'

const arabicDate = new Intl.DateTimeFormat('ar-SY', { dateStyle: 'medium' })

type ContractPrintPageProps = {
  params: Promise<{ contractId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function paymentStatusLabel(status: string) {
  switch (status) {
    case 'PAID':
      return 'مدفوعة'
    case 'OVERDUE':
      return 'متأخرة'
    case 'PENDING':
      return 'مستحقة'
    default:
      return 'ملغاة'
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

export default async function ContractPrintPage({ params, searchParams }: ContractPrintPageProps) {
  const { contractId } = await params
  const search = searchParams ? await searchParams : undefined
  const autoPrint = (Array.isArray(search?.autoprint) ? search?.autoprint[0] : search?.autoprint) === '1'
  const data = await getContractPrintData(contractId)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 print:max-w-none">
        <section className="rounded-[28px] border border-white/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(16,42,67,0.08)] print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">نسخة عقد جاهزة للطباعة أو الحفظ PDF</h1>
              <p className="mt-2 text-sm text-slate-600">يفتح هذا القالب بتنسيق طباعة نظيف حتى يحفظه المكتب مباشرة من المتصفح كملف PDF احترافي.</p>
            </div>
            <ContractPrintControls autoPrint={autoPrint} />
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(16,42,67,0.08)] print:rounded-none print:border-0 print:shadow-none">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(5,150,105,0.12),rgba(249,115,22,0.06))] px-8 py-8 print:bg-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                {data.agency.logoUrl ? (
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2">
                    <Image src={data.agency.logoUrl} alt={data.agency.name} width={64} height={64} unoptimized className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-lg font-bold text-white">
                    {initials(data.agency.name) || 'AQ'}
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-900">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    عقد إيجار قابل للطباعة
                  </div>
                  <h2 className="mt-3 text-3xl font-bold text-slate-950">{data.agency.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{data.agency.address || 'العنوان غير مضاف بعد'} | {data.agency.phone || 'الهاتف غير مضاف بعد'}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-950">رقم العقد</div>
                <div className="mt-1">{data.contract.id}</div>
                <div className="mt-3 font-semibold text-slate-950">تاريخ الإصدار</div>
                <div className="mt-1">{arabicDate.format(new Date())}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-8 py-8">
            <section className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2 text-slate-950">
                  <UserRound className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-lg font-bold">بيانات المستأجر</h3>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                  <div><span className="font-semibold text-slate-950">الاسم:</span> {data.tenant.fullName}</div>
                  <div><span className="font-semibold text-slate-950">الهوية:</span> {data.tenant.nationalId || 'غير متوفر'}</div>
                  <div><span className="font-semibold text-slate-950">الهاتف:</span> {data.tenant.phone || 'غير متوفر'}</div>
                  <div><span className="font-semibold text-slate-950">البريد:</span> {data.tenant.portalEmail || 'غير متوفر'}</div>
                </div>
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2 text-slate-950">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-lg font-bold">بيانات العقار</h3>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                  <div><span className="font-semibold text-slate-950">العقار:</span> {data.contract.propertyTitle}</div>
                  <div><span className="font-semibold text-slate-950">الوحدة:</span> {data.contract.unitNumber}</div>
                  <div><span className="font-semibold text-slate-950">العنوان:</span> {data.contract.propertyAddress || data.agency.address || 'غير متوفر'}</div>
                  <div><span className="font-semibold text-slate-950">الحالة:</span> {data.contract.isActive ? 'عقد نشط' : 'عقد غير نشط'}</div>
                </div>
              </article>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <CalendarRange className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-base font-bold">مدة العقد</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div><span className="font-semibold text-slate-950">البداية:</span> {arabicDate.format(data.contract.startDate)}</div>
                  <div><span className="font-semibold text-slate-950">النهاية:</span> {arabicDate.format(data.contract.endDate)}</div>
                </div>
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <CreditCard className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-base font-bold">القيمة الإيجارية</h3>
                </div>
                <div className="mt-4 text-3xl font-bold text-slate-950">{new Intl.NumberFormat('en-US').format(data.contract.rentAmount)} $</div>
                <div className="mt-2 text-sm text-slate-600">إيجار دوري مع قابلية متابعة الدفعات من لوحة المكتب</div>
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-base font-bold">المرجع التشغيلي</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div><span className="font-semibold text-slate-950">المكتب:</span> {data.agency.name}</div>
                  <div><span className="font-semibold text-slate-950">البريد الإداري:</span> {data.agency.email || 'غير متوفر'}</div>
                  <div><span className="font-semibold text-slate-950">المدير المسؤول:</span> {data.agency.managerName || 'غير متوفر'}</div>
                </div>
              </article>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-slate-950">
                <FileText className="h-4 w-4 text-emerald-700" />
                <h3 className="text-lg font-bold">بنود مختصرة للطباعة</h3>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-700">
                <p>1. يقر الطرفان بأن هذه النسخة تمثل ملخصاً تشغيلياً للعقد المسجل على المنصة، ويمكن إرفاق النسخة القانونية النهائية بصيغة PDF عند الاعتماد الرسمي.</p>
                <p>2. يلتزم المستأجر بسداد الإيجار الدوري المتفق عليه ضمن المواعيد المحددة، وتظهر حالة السداد في لوحة المتابعة المالية.</p>
                <p>3. ترفع طلبات الصيانة عبر بوابة المستأجر أو من خلال المكتب، ويتم تتبع حالتها ضمن لوحة الصيانة الخاصة بالإدارة.</p>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-950">
                <CreditCard className="h-4 w-4 text-emerald-700" />
                <h3 className="text-lg font-bold">سجل الدفعات المرتبط بالعقد</h3>
              </div>

              <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">الوصف</th>
                      <th className="px-4 py-3 font-semibold">الاستحقاق</th>
                      <th className="px-4 py-3 font-semibold">المبلغ</th>
                      <th className="px-4 py-3 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {data.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-slate-950">{payment.notes || 'دفعة إيجار'}</td>
                        <td className="px-4 py-3 text-slate-700">{arabicDate.format(payment.dueDate)}</td>
                        <td className="px-4 py-3 text-slate-950">{new Intl.NumberFormat('en-US').format(payment.amount)} $</td>
                        <td className="px-4 py-3 text-slate-700">{paymentStatusLabel(payment.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-600">توقيع المستأجر</div>
                <div className="mt-14 border-b border-dashed border-slate-300" />
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-600">{data.agency.sealLabel || 'ختم أو توقيع المكتب'}</div>
                <div className="mt-4 text-sm text-slate-700">{data.agency.signatureName || data.agency.managerName || data.agency.name}</div>
                <div className="mt-14 border-b border-dashed border-slate-300" />
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}