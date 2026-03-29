import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getOfficeSettings } from '@/lib/office-settings'
import { sendEmailNotification } from '@/lib/notifications'

const CONTRACT_HISTORY_PATH = path.join(process.cwd(), 'data', 'contract-history.json')
const INTERNAL_NOTIFICATIONS_PATH = path.join(process.cwd(), 'data', 'internal-notifications.json')

export type ContractHistoryEvent = {
  id: string
  contractId: string
  type: 'created' | 'updated' | 'renewed' | 'terminated'
  title: string
  description: string
  actorLabel: string
  createdAt: string
  comparisons?: Array<{
    label: string
    before: string
    after: string
  }>
}

export type InternalNotificationItem = {
  id: string
  contractId: string
  type: 'contract-renewed' | 'contract-terminated'
  severity: 'info' | 'warning' | 'high'
  title: string
  message: string
  createdAt: string
  readAt: string | null
}

type ContractSeedRecord = {
  id: string
  tenantName: string
  propertyTitle: string
  startDate: Date
  endDate: Date
  rentAmount: number
}

type LifecycleNotificationInput = {
  agencyId: string
  contractId: string
  tenantName: string
  tenantEmail: string | null
  propertyTitle: string
  unitNumber: string
  newEndDate: Date
  previousEndDate: Date
  rentAmount: number
  type: 'renewed' | 'terminated'
}

const DEMO_INTERNAL_NOTIFICATIONS: InternalNotificationItem[] = [
  {
    id: 'demo-notification-01',
    contractId: 'contract-rima',
    type: 'contract-renewed',
    severity: 'info',
    title: 'تم تجديد عقد ريما خليل',
    message: 'جرى تمديد عقد ريما خليل في شقة عائلية في المزة الغربية حتى 30 نيسان 2026 بعد مراجعة الدفعة الأخيرة.',
    createdAt: '2026-03-28T09:30:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-02',
    contractId: 'contract-samer',
    type: 'contract-terminated',
    severity: 'high',
    title: 'اعتماد إنهاء عقد سامر حلاق',
    message: 'تم تثبيت إنهاء العقد بطلب من المستأجر مع إغلاق الوحدة Sea-5 وتحويلها للعرض من جديد.',
    createdAt: '2026-03-28T08:45:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-03',
    contractId: 'contract-lina',
    type: 'contract-renewed',
    severity: 'warning',
    title: 'تجديد مشروط لعقد لينا يونس',
    message: 'تم التجديد لمدة 6 أشهر مع ملاحظة متابعة دفعة التأمين خلال 72 ساعة.',
    createdAt: '2026-03-27T16:15:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-04',
    contractId: 'contract-rima',
    type: 'contract-terminated',
    severity: 'high',
    title: 'طلب إنهاء مبكر لعقد ريما خليل',
    message: 'تم فتح إشعار داخلي لمراجعة الإنهاء المبكر واسترداد جزء من التأمين بعد المعاينة.',
    createdAt: '2026-03-27T11:20:00.000Z',
    readAt: '2026-03-27T13:10:00.000Z',
  },
  {
    id: 'demo-notification-05',
    contractId: 'contract-samer',
    type: 'contract-renewed',
    severity: 'info',
    title: 'تمديد قصير لعقد سامر حلاق',
    message: 'جرى تمديد العقد شهراً إضافياً بانتظار توقيع النسخة السنوية الجديدة.',
    createdAt: '2026-03-26T14:00:00.000Z',
    readAt: '2026-03-26T15:30:00.000Z',
  },
  {
    id: 'demo-notification-06',
    contractId: 'contract-lina',
    type: 'contract-terminated',
    severity: 'high',
    title: 'إنهاء عقد لينا يونس بسبب الانتقال',
    message: 'المكتب اعتمد الإنهاء بتاريخ 26 آذار مع إبقاء ملاحظة على فحص الوحدة قبل إعادة النشر.',
    createdAt: '2026-03-26T09:25:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-07',
    contractId: 'contract-rima',
    type: 'contract-renewed',
    severity: 'info',
    title: 'إشعار موافقة مالك على تجديد عقد ريما',
    message: 'المالك وافق على التجديد السنوي بالقيمة الحالية بعد إرسال الملحق التعاقدي.',
    createdAt: '2026-03-25T18:40:00.000Z',
    readAt: '2026-03-25T19:05:00.000Z',
  },
  {
    id: 'demo-notification-08',
    contractId: 'contract-samer',
    type: 'contract-terminated',
    severity: 'warning',
    title: 'إنذار قبل إنهاء عقد سامر',
    message: 'تم فتح إنذار داخلي قبل الإنهاء النهائي لمراجعة المتأخرات المرافقة للعقد.',
    createdAt: '2026-03-25T13:12:00.000Z',
    readAt: '2026-03-25T14:20:00.000Z',
  },
  {
    id: 'demo-notification-09',
    contractId: 'contract-lina',
    type: 'contract-renewed',
    severity: 'info',
    title: 'جدولة تجديد عقد لينا يونس',
    message: 'الموظف حدد موعد توقيع الملحق الجديد صباح السبت وتم إرسال تذكير داخلي للفريق.',
    createdAt: '2026-03-24T10:05:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-10',
    contractId: 'contract-rima',
    type: 'contract-renewed',
    severity: 'warning',
    title: 'تجديد يحتاج مراجعة التأمين',
    message: 'التجديد جاهز لكن توجد ملاحظة على بند التأمين ويجب تثبيته قبل الطباعة النهائية.',
    createdAt: '2026-03-24T08:00:00.000Z',
    readAt: null,
  },
  {
    id: 'demo-notification-11',
    contractId: 'contract-samer',
    type: 'contract-renewed',
    severity: 'info',
    title: 'تأكيد استلام ملحق تجديد سامر',
    message: 'الفريق استلم نسخة موقعة وأصبح الملف جاهزاً للأرشفة الرقمية.',
    createdAt: '2026-03-23T17:30:00.000Z',
    readAt: '2026-03-23T18:00:00.000Z',
  },
  {
    id: 'demo-notification-12',
    contractId: 'contract-lina',
    type: 'contract-terminated',
    severity: 'high',
    title: 'تأكيد إخلاء الوحدة A-3',
    message: 'تم تأكيد إخلاء الوحدة وربط الإشعار بجدولة تنظيف وصيانة خفيفة قبل إعادة العرض.',
    createdAt: '2026-03-22T12:40:00.000Z',
    readAt: '2026-03-22T13:00:00.000Z',
  },
  {
    id: 'demo-notification-13',
    contractId: 'contract-rima',
    type: 'contract-terminated',
    severity: 'warning',
    title: 'مراجعة مستندات الإنهاء لريما',
    message: 'المطلوب التأكد من توقيع الاستلام النهائي وصور العدادات قبل إغلاق الإشعار.',
    createdAt: '2026-03-21T09:10:00.000Z',
    readAt: '2026-03-21T11:45:00.000Z',
  },
  {
    id: 'demo-notification-14',
    contractId: 'contract-samer',
    type: 'contract-renewed',
    severity: 'info',
    title: 'إشعار متابعة بعد تجديد سامر',
    message: 'أضيفت متابعة بعد 30 يوماً للتأكد من انتظام السداد بعد التجديد الأخير.',
    createdAt: '2026-03-20T07:55:00.000Z',
    readAt: '2026-03-20T08:20:00.000Z',
  },
]

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function ensureDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function readArrayFile<T>(filePath: string): Promise<T[]> {
  try {
    const file = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(file) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeArrayFile<T>(filePath: string, items: T[]) {
  await ensureDirectory(filePath)
  await writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8')
}

async function seedInternalNotificationsIfEmpty() {
  const items = await readArrayFile<InternalNotificationItem>(INTERNAL_NOTIFICATIONS_PATH)

  if (items.length > 0) {
    return items.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  }

  const seededItems = [...DEMO_INTERNAL_NOTIFICATIONS].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  await writeArrayFile(INTERNAL_NOTIFICATIONS_PATH, seededItems)
  return seededItems
}

export async function resetDemoInternalNotifications() {
  const seededItems = [...DEMO_INTERNAL_NOTIFICATIONS].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  await writeArrayFile(INTERNAL_NOTIFICATIONS_PATH, seededItems)
  return seededItems
}

export async function clearInternalNotifications() {
  await writeArrayFile<InternalNotificationItem>(INTERNAL_NOTIFICATIONS_PATH, [])
  return [] as InternalNotificationItem[]
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value)
}

export async function seedContractHistory(contracts: ContractSeedRecord[]) {
  const current = await readArrayFile<ContractHistoryEvent>(CONTRACT_HISTORY_PATH)
  let changed = false

  for (const contract of contracts) {
    const hasExisting = current.some((item) => item.contractId === contract.id)
    if (hasExisting) {
      continue
    }

    current.push({
      id: buildId('history'),
      contractId: contract.id,
      type: 'created',
      title: 'بداية العقد',
      description: `بدأ العقد للمستأجر ${contract.tenantName} في ${contract.propertyTitle} من ${formatDate(contract.startDate)} حتى ${formatDate(contract.endDate)} بقيمة ${contract.rentAmount} دولار.`,
      actorLabel: 'تهيئة النظام',
      createdAt: contract.startDate.toISOString(),
    })
    changed = true
  }

  if (changed) {
    current.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    await writeArrayFile(CONTRACT_HISTORY_PATH, current)
  }

  return current
}

export async function getContractHistoryMap(contracts: ContractSeedRecord[]) {
  const history = await seedContractHistory(contracts)
  const map: Record<string, ContractHistoryEvent[]> = {}

  for (const item of history) {
    if (!map[item.contractId]) {
      map[item.contractId] = []
    }

    map[item.contractId].push(item)
  }

  for (const contract of contracts) {
    if (!map[contract.id]) {
      map[contract.id] = []
    }
  }

  return map
}

export async function listAllContractHistory() {
  const history = await readArrayFile<ContractHistoryEvent>(CONTRACT_HISTORY_PATH)
  return history.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

export async function listFilteredContractHistory(filters?: {
  contractIds?: string[]
  from?: string | null
  to?: string | null
}) {
  const history = await listAllContractHistory()
  const from = filters?.from ? new Date(filters.from) : null
  const to = filters?.to ? new Date(filters.to) : null
  const contractIds = filters?.contractIds && filters.contractIds.length > 0 ? new Set(filters.contractIds) : null

  return history.filter((item) => {
    const createdAt = new Date(item.createdAt)

    if (contractIds && !contractIds.has(item.contractId)) {
      return false
    }

    if (from && createdAt.getTime() < from.getTime()) {
      return false
    }

    if (to) {
      const toEnd = new Date(to)
      toEnd.setHours(23, 59, 59, 999)
      if (createdAt.getTime() > toEnd.getTime()) {
        return false
      }
    }

    return true
  })
}

export async function recordContractHistoryEvent(input: Omit<ContractHistoryEvent, 'id' | 'createdAt'> & { createdAt?: string }) {
  const history = await readArrayFile<ContractHistoryEvent>(CONTRACT_HISTORY_PATH)
  history.unshift({
    id: buildId('history'),
    createdAt: input.createdAt || new Date().toISOString(),
    ...input,
  })
  await writeArrayFile(CONTRACT_HISTORY_PATH, history)
}

export async function listInternalNotifications(limit = 8) {
  const items = await seedInternalNotificationsIfEmpty()
  return items
    .slice(0, limit)
}

export async function listAllInternalNotifications() {
  return seedInternalNotificationsIfEmpty()
}

export async function getUnreadInternalNotificationsCount() {
  const items = await listAllInternalNotifications()
  return items.filter((item) => !item.readAt).length
}

export async function recordInternalNotification(input: Omit<InternalNotificationItem, 'id' | 'createdAt'> & { createdAt?: string }) {
  const items = await readArrayFile<InternalNotificationItem>(INTERNAL_NOTIFICATIONS_PATH)
  items.unshift({
    id: buildId('internal-notification'),
    createdAt: input.createdAt || new Date().toISOString(),
    ...input,
    readAt: input.readAt ?? null,
  })
  await writeArrayFile(INTERNAL_NOTIFICATIONS_PATH, items)
}

export async function markInternalNotificationAsRead(notificationId: string) {
  const items = await readArrayFile<InternalNotificationItem>(INTERNAL_NOTIFICATIONS_PATH)
  let changed = false

  const nextItems = items.map((item) => {
    if (item.id !== notificationId || item.readAt) {
      return item
    }

    changed = true
    return {
      ...item,
      readAt: new Date().toISOString(),
    }
  })

  if (changed) {
    await writeArrayFile(INTERNAL_NOTIFICATIONS_PATH, nextItems)
  }
}

export async function markAllInternalNotificationsAsRead() {
  const items = await readArrayFile<InternalNotificationItem>(INTERNAL_NOTIFICATIONS_PATH)
  const now = new Date().toISOString()
  let changed = false

  const nextItems = items.map((item) => {
    if (item.readAt) {
      return item
    }

    changed = true
    return {
      ...item,
      readAt: now,
    }
  })

  if (changed) {
    await writeArrayFile(INTERNAL_NOTIFICATIONS_PATH, nextItems)
  }
}

export async function notifyContractLifecycleChange(input: LifecycleNotificationInput) {
  const office = await getOfficeSettings()
  const formattedNewEndDate = formatDate(input.newEndDate)
  const formattedPreviousEndDate = formatDate(input.previousEndDate)
  const isRenewal = input.type === 'renewed'
  const title = isRenewal ? 'تم تجديد عقد إيجار' : 'تم إنهاء عقد إيجار'
  const message = isRenewal
    ? `تم تجديد عقد ${input.tenantName} في ${input.propertyTitle} حتى ${formattedNewEndDate}.`
    : `تم اعتماد إنهاء عقد ${input.tenantName} في ${input.propertyTitle} بتاريخ ${formattedNewEndDate}.`

  await recordInternalNotification({
    contractId: input.contractId,
    type: isRenewal ? 'contract-renewed' : 'contract-terminated',
    severity: isRenewal ? 'info' : 'high',
    title,
    message,
    readAt: null,
  })

  const recipients = Array.from(new Set([input.tenantEmail, office.email].filter((item): item is string => Boolean(item))))

  await Promise.all(
    recipients.map((recipient) =>
      sendEmailNotification({
        agencyId: input.agencyId,
        contractId: input.contractId,
        recipient,
        subject: title,
        text: isRenewal
          ? `مرحباً، تم تجديد عقد ${input.tenantName} للعقار ${input.propertyTitle} - الوحدة ${input.unitNumber}. كانت نهاية العقد السابقة ${formattedPreviousEndDate} وأصبحت الآن ${formattedNewEndDate}. القيمة الإيجارية الحالية ${input.rentAmount} دولار.`
          : `مرحباً، تم إنهاء عقد ${input.tenantName} للعقار ${input.propertyTitle} - الوحدة ${input.unitNumber}. تاريخ النهاية السابقة كان ${formattedPreviousEndDate} وتم اعتماد الإنهاء بتاريخ ${formattedNewEndDate}.`
        ,
        html: isRenewal
          ? `<p>مرحباً،</p><p>تم تجديد عقد <strong>${input.tenantName}</strong> للعقار <strong>${input.propertyTitle}</strong> - الوحدة <strong>${input.unitNumber}</strong>.</p><p>نهاية العقد السابقة: <strong>${formattedPreviousEndDate}</strong><br />نهاية العقد الجديدة: <strong>${formattedNewEndDate}</strong><br />القيمة الإيجارية الحالية: <strong>${input.rentAmount} دولار</strong></p>`
          : `<p>مرحباً،</p><p>تم اعتماد إنهاء عقد <strong>${input.tenantName}</strong> للعقار <strong>${input.propertyTitle}</strong> - الوحدة <strong>${input.unitNumber}</strong>.</p><p>نهاية العقد السابقة: <strong>${formattedPreviousEndDate}</strong><br />تاريخ الإنهاء المعتمد: <strong>${formattedNewEndDate}</strong></p>`
        ,
        template: isRenewal ? 'contract-renewed-notification' : 'contract-terminated-notification',
      })
    )
  )
}