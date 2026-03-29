export type TenantProfile = {
  id: string
  fullName: string
  propertyId: string
  propertyTitle: string
  unitLabel: string
  governorate: string
  phone: string
  email?: string
}

export type RentalContract = {
  id: string
  tenantId: string
  propertyId: string
  propertyTitle: string
  unitLabel: string
  startDate: string
  endDate: string
  rentAmount: number
  paymentPeriod: 'شهري' | 'سنوي'
  status: 'active' | 'ending-soon'
}

export type TenantInvoice = {
  id: string
  tenantId: string
  contractId: string
  label: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  paidDate?: string
}

export type MaintenanceRequest = {
  id: string
  tenantId: string
  contractId: string
  title: string
  description: string
  priority: 'عادي' | 'عاجل'
  status: 'new' | 'scheduled' | 'completed'
  createdAt: string
}

export type OperationalNotification = {
  id: string
  type: 'contract-expiry' | 'payment-due' | 'payment-overdue' | 'maintenance'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  dueDate?: string
  actionHref: string
  actionLabel: string
}

export type LocalRentalSnapshot = {
  tenants: TenantProfile[]
  contracts: RentalContract[]
  invoices: TenantInvoice[]
  maintenanceRequests: MaintenanceRequest[]
}

const TENANTS_KEY = 'aqari-local-tenants'
const CONTRACTS_KEY = 'aqari-local-contracts'
const INVOICES_KEY = 'aqari-local-invoices'
const MAINTENANCE_KEY = 'aqari-local-maintenance-requests'

const rentalListeners = new Set<() => void>()
const emptyTenants: TenantProfile[] = []
const emptyContracts: RentalContract[] = []
const emptyInvoices: TenantInvoice[] = []
const emptyMaintenance: MaintenanceRequest[] = []
let tenantsRawCache: string | null = null
let tenantsValueCache: TenantProfile[] = emptyTenants
let contractsRawCache: string | null = null
let contractsValueCache: RentalContract[] = emptyContracts
let invoicesRawCache: string | null = null
let invoicesValueCache: TenantInvoice[] = emptyInvoices
let maintenanceRawCache: string | null = null
let maintenanceValueCache: MaintenanceRequest[] = emptyMaintenance
let snapshotCache: LocalRentalSnapshot = {
  tenants: emptyTenants,
  contracts: emptyContracts,
  invoices: emptyInvoices,
  maintenanceRequests: emptyMaintenance,
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function notifyRentalListeners() {
  rentalListeners.forEach((listener) => listener())
}

function writeArray<T>(key: string, items: T[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(items))
}

function readCachedArray<T>(
  key: string,
  currentRaw: string | null,
  currentValue: T[],
): { raw: string | null; value: T[] } {
  if (!isBrowser()) {
    return { raw: currentRaw, value: currentValue }
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return { raw: null, value: [] as T[] }
    }

    if (raw === currentRaw) {
      return { raw: currentRaw, value: currentValue }
    }

    const parsed = JSON.parse(raw) as T[]
    return {
      raw,
      value: Array.isArray(parsed) ? parsed : [] as T[],
    }
  } catch {
    return { raw: null, value: [] as T[] }
  }
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function buildSeedSnapshot(): LocalRentalSnapshot {
  const tenants: TenantProfile[] = [
    {
      id: 'tenant-rima',
      fullName: 'ريما خليل',
      propertyId: 'damascus-mezzeh-rent',
      propertyTitle: 'شقة عائلية في المزة الغربية',
      unitLabel: 'B-12',
      governorate: 'دمشق',
      phone: '+963 944 221 110',
      email: 'rima@example.com',
    },
    {
      id: 'tenant-samer',
      fullName: 'سامر حلاق',
      propertyId: 'latakia-ziraa-rent',
      propertyTitle: 'شقة مفروشة في مشروع الزراعة',
      unitLabel: 'Sea-5',
      governorate: 'اللاذقية',
      phone: '+963 933 200 515',
      email: 'samer@example.com',
    },
    {
      id: 'tenant-lina',
      fullName: 'لينا يونس',
      propertyId: 'aleppo-hamdaniyeh-rent',
      propertyTitle: 'شقة للإيجار في الحمدانية',
      unitLabel: 'A-3',
      governorate: 'حلب',
      phone: '+963 955 415 320',
      email: 'lina@example.com',
    },
  ]

  const contracts: RentalContract[] = [
    {
      id: 'contract-rima',
      tenantId: 'tenant-rima',
      propertyId: 'damascus-mezzeh-rent',
      propertyTitle: 'شقة عائلية في المزة الغربية',
      unitLabel: 'B-12',
      startDate: daysFromNow(-290),
      endDate: daysFromNow(9),
      rentAmount: 420,
      paymentPeriod: 'شهري',
      status: 'ending-soon',
    },
    {
      id: 'contract-samer',
      tenantId: 'tenant-samer',
      propertyId: 'latakia-ziraa-rent',
      propertyTitle: 'شقة مفروشة في مشروع الزراعة',
      unitLabel: 'Sea-5',
      startDate: daysFromNow(-120),
      endDate: daysFromNow(44),
      rentAmount: 320,
      paymentPeriod: 'شهري',
      status: 'active',
    },
    {
      id: 'contract-lina',
      tenantId: 'tenant-lina',
      propertyId: 'aleppo-hamdaniyeh-rent',
      propertyTitle: 'شقة للإيجار في الحمدانية',
      unitLabel: 'A-3',
      startDate: daysFromNow(-70),
      endDate: daysFromNow(112),
      rentAmount: 185,
      paymentPeriod: 'شهري',
      status: 'active',
    },
  ]

  const invoices: TenantInvoice[] = [
    {
      id: 'invoice-rima-overdue',
      tenantId: 'tenant-rima',
      contractId: 'contract-rima',
      label: 'بدل إيجار مارس 2026',
      dueDate: daysFromNow(-4),
      amount: 420,
      status: 'overdue',
    },
    {
      id: 'invoice-rima-next',
      tenantId: 'tenant-rima',
      contractId: 'contract-rima',
      label: 'بدل إيجار أبريل 2026',
      dueDate: daysFromNow(2),
      amount: 420,
      status: 'pending',
    },
    {
      id: 'invoice-samer-next',
      tenantId: 'tenant-samer',
      contractId: 'contract-samer',
      label: 'بدل إيجار أبريل 2026',
      dueDate: daysFromNow(5),
      amount: 320,
      status: 'pending',
    },
    {
      id: 'invoice-samer-paid',
      tenantId: 'tenant-samer',
      contractId: 'contract-samer',
      label: 'بدل إيجار مارس 2026',
      dueDate: daysFromNow(-24),
      amount: 320,
      status: 'paid',
      paidDate: daysFromNow(-23),
    },
    {
      id: 'invoice-lina-next',
      tenantId: 'tenant-lina',
      contractId: 'contract-lina',
      label: 'بدل إيجار أبريل 2026',
      dueDate: daysFromNow(1),
      amount: 185,
      status: 'pending',
    },
  ]

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'maintenance-rima-1',
      tenantId: 'tenant-rima',
      contractId: 'contract-rima',
      title: 'تسرب خفيف في المطبخ',
      description: 'يوجد تسرب بسيط تحت المغسلة ويحتاج زيارة فني هذا الأسبوع.',
      priority: 'عاجل',
      status: 'new',
      createdAt: daysFromNow(-1),
    },
    {
      id: 'maintenance-samer-1',
      tenantId: 'tenant-samer',
      contractId: 'contract-samer',
      title: 'فحص المكيف',
      description: 'المكيف يعمل لكن التبريد أضعف من المعتاد في الصالون.',
      priority: 'عادي',
      status: 'scheduled',
      createdAt: daysFromNow(-3),
    },
  ]

  return { tenants, contracts, invoices, maintenanceRequests }
}

function ensureSeededState() {
  if (!isBrowser()) {
    return
  }

  const seed = buildSeedSnapshot()

  if (!window.localStorage.getItem(TENANTS_KEY)) {
    writeArray(TENANTS_KEY, seed.tenants)
  }

  if (!window.localStorage.getItem(CONTRACTS_KEY)) {
    writeArray(CONTRACTS_KEY, seed.contracts)
  }

  if (!window.localStorage.getItem(INVOICES_KEY)) {
    writeArray(INVOICES_KEY, seed.invoices)
  }

  if (!window.localStorage.getItem(MAINTENANCE_KEY)) {
    writeArray(MAINTENANCE_KEY, seed.maintenanceRequests)
  }
}

function normalizeInvoice(invoice: TenantInvoice): TenantInvoice {
  if (invoice.status === 'paid') {
    return invoice
  }

  const today = Date.now()
  const due = new Date(invoice.dueDate).getTime()

  if (due < today) {
    return { ...invoice, status: 'overdue' }
  }

  return { ...invoice, status: 'pending' }
}

export function subscribeLocalRentalOps(listener: () => void) {
  rentalListeners.add(listener)
  return () => rentalListeners.delete(listener)
}

export function loadTenantProfiles() {
  ensureSeededState()
  const next = readCachedArray<TenantProfile>(TENANTS_KEY, tenantsRawCache, tenantsValueCache)
  tenantsRawCache = next.raw
  tenantsValueCache = next.value.length > 0 ? next.value : emptyTenants
  return tenantsValueCache
}

export function loadRentalContracts() {
  ensureSeededState()
  const next = readCachedArray<RentalContract>(CONTRACTS_KEY, contractsRawCache, contractsValueCache)
  contractsRawCache = next.raw
  contractsValueCache = next.value.length > 0 ? next.value : emptyContracts
  return contractsValueCache
}

export function loadTenantInvoices() {
  ensureSeededState()
  const next = readCachedArray<TenantInvoice>(INVOICES_KEY, invoicesRawCache, invoicesValueCache)
  invoicesRawCache = next.raw
  const normalizedInvoices = (next.value.length > 0 ? next.value : emptyInvoices).map(normalizeInvoice)

  if (JSON.stringify(normalizedInvoices) === JSON.stringify(invoicesValueCache)) {
    return invoicesValueCache
  }

  invoicesValueCache = normalizedInvoices
  invoicesRawCache = JSON.stringify(next.value.length > 0 ? next.value : emptyInvoices)
  return invoicesValueCache
}

export function loadMaintenanceRequests() {
  ensureSeededState()
  const next = readCachedArray<MaintenanceRequest>(MAINTENANCE_KEY, maintenanceRawCache, maintenanceValueCache)
  maintenanceRawCache = next.raw
  maintenanceValueCache = next.value.length > 0 ? next.value : emptyMaintenance
  return maintenanceValueCache
}

export function loadLocalRentalSnapshot(): LocalRentalSnapshot {
  const tenants = loadTenantProfiles()
  const contracts = loadRentalContracts()
  const invoices = loadTenantInvoices()
  const maintenanceRequests = loadMaintenanceRequests()

  if (
    snapshotCache.tenants === tenants &&
    snapshotCache.contracts === contracts &&
    snapshotCache.invoices === invoices &&
    snapshotCache.maintenanceRequests === maintenanceRequests
  ) {
    return snapshotCache
  }

  snapshotCache = {
    tenants,
    contracts,
    invoices,
    maintenanceRequests,
  }

  return snapshotCache
}

export function saveTenantInvoices(items: TenantInvoice[]) {
  invoicesValueCache = items
  invoicesRawCache = JSON.stringify(items)
  writeArray(INVOICES_KEY, items)
  notifyRentalListeners()
}

export function saveMaintenanceRequests(items: MaintenanceRequest[]) {
  maintenanceValueCache = items
  maintenanceRawCache = JSON.stringify(items)
  writeArray(MAINTENANCE_KEY, items)
  notifyRentalListeners()
}

export function updateInvoiceStatus(invoiceId: string, status: TenantInvoice['status']) {
  const next = loadTenantInvoices().map((invoice) => {
    if (invoice.id !== invoiceId) {
      return invoice
    }

    return {
      ...invoice,
      status,
      paidDate: status === 'paid' ? new Date().toISOString() : undefined,
    }
  })

  saveTenantInvoices(next)
}

export function createMaintenanceRequest(input: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>) {
  const request: MaintenanceRequest = {
    ...input,
    id: `maintenance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  }

  saveMaintenanceRequests([request, ...loadMaintenanceRequests()])
  return request
}

function daysUntil(dateValue: string) {
  const ms = new Date(dateValue).getTime() - Date.now()
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

function severityWeight(severity: OperationalNotification['severity']) {
  switch (severity) {
    case 'high':
      return 0
    case 'medium':
      return 1
    case 'low':
    default:
      return 2
  }
}

export function deriveOperationalNotifications(snapshot: LocalRentalSnapshot) {
  const tenantById = new Map(snapshot.tenants.map((tenant) => [tenant.id, tenant]))
  const notifications: OperationalNotification[] = []

  snapshot.contracts.forEach((contract) => {
    const remainingDays = daysUntil(contract.endDate)
    if (remainingDays > 30) {
      return
    }

    const tenant = tenantById.get(contract.tenantId)
    notifications.push({
      id: `contract-${contract.id}`,
      type: 'contract-expiry',
      severity: remainingDays <= 7 ? 'high' : 'medium',
      title: `العقد يقترب من النهاية خلال ${remainingDays} أيام`,
      description: `${tenant?.fullName ?? 'المستأجر'} في ${contract.propertyTitle} - الوحدة ${contract.unitLabel}.`,
      dueDate: contract.endDate,
      actionHref: '/tenant-portal',
      actionLabel: 'راجع العقود',
    })
  })

  snapshot.invoices.forEach((invoice) => {
    const remainingDays = daysUntil(invoice.dueDate)
    const tenant = tenantById.get(invoice.tenantId)

    if (invoice.status === 'overdue') {
      notifications.push({
        id: `invoice-overdue-${invoice.id}`,
        type: 'payment-overdue',
        severity: 'high',
        title: 'دفعة متأخرة تحتاج متابعة فورية',
        description: `${invoice.label} للمستأجر ${tenant?.fullName ?? 'غير معروف'} بقيمة ${invoice.amount} دولار.`,
        dueDate: invoice.dueDate,
        actionHref: '/tenant-portal',
        actionLabel: 'راجع الفواتير',
      })
      return
    }

    if (invoice.status === 'pending' && remainingDays <= 3) {
      notifications.push({
        id: `invoice-due-${invoice.id}`,
        type: 'payment-due',
        severity: remainingDays <= 1 ? 'high' : 'medium',
        title: `دفعة مستحقة خلال ${Math.max(remainingDays, 0)} يوم`,
        description: `${invoice.label} للمستأجر ${tenant?.fullName ?? 'غير معروف'} بقيمة ${invoice.amount} دولار.`,
        dueDate: invoice.dueDate,
        actionHref: '/tenant-portal',
        actionLabel: 'راجع الفواتير',
      })
    }
  })

  snapshot.maintenanceRequests
    .filter((request) => request.status === 'new')
    .forEach((request) => {
      const tenant = tenantById.get(request.tenantId)
      notifications.push({
        id: `maintenance-${request.id}`,
        type: 'maintenance',
        severity: request.priority === 'عاجل' ? 'high' : 'low',
        title: request.priority === 'عاجل' ? 'طلب صيانة عاجل جديد' : 'طلب صيانة جديد',
        description: `${request.title} من ${tenant?.fullName ?? 'مستأجر'} يحتاج جدولة متابعة.`,
        dueDate: request.createdAt,
        actionHref: '/tenant-portal',
        actionLabel: 'راجع الصيانة',
      })
    })

  return notifications.sort((left, right) => {
    const severityDelta = severityWeight(left.severity) - severityWeight(right.severity)
    if (severityDelta !== 0) {
      return severityDelta
    }

    return new Date(left.dueDate ?? 0).getTime() - new Date(right.dueDate ?? 0).getTime()
  })
}

export function countContractsEndingSoon(contracts: RentalContract[]) {
  return contracts.filter((contract) => daysUntil(contract.endDate) <= 30).length
}

export function countPaymentsDueSoon(invoices: TenantInvoice[]) {
  return invoices.filter((invoice) => {
    const remainingDays = daysUntil(invoice.dueDate)
    return invoice.status === 'pending' && remainingDays <= 3
  }).length
}

export function countOverduePayments(invoices: TenantInvoice[]) {
  return invoices.filter((invoice) => invoice.status === 'overdue').length
}

export function countNewMaintenanceRequests(requests: MaintenanceRequest[]) {
  return requests.filter((request) => request.status === 'new').length
}