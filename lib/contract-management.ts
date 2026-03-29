import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Prisma } from '@prisma/client'
import {
  getContractHistoryMap,
  listInternalNotifications,
  notifyContractLifecycleChange,
  recordContractHistoryEvent,
  type ContractHistoryEvent,
  type InternalNotificationItem,
} from '@/lib/contract-activity'
import { prisma } from '@/prisma'
import { ensureRentalSeedData } from '@/lib/rental-db'

const CONTRACTS_FALLBACK_PATH = path.join(process.cwd(), 'data', 'contracts-fallback.json')
const DEMO_AGENCY_ID = 'agency-demo-main'

export type FallbackContractRecord = {
  id: string
  tenantId: string
  tenantName: string
  tenantEmail: string | null
  tenantPhone: string | null
  tenantNationalId: string | null
  propertyId: string
  propertyTitle: string
  propertyAddress: string | null
  unitId: string
  unitNumber: string
  startDate: string
  endDate: string
  rentAmount: number
  isActive: boolean
}

export type ManagedContractRecord = Omit<FallbackContractRecord, 'startDate' | 'endDate'> & {
  startDate: Date
  endDate: Date
  nextPaymentDue: Date | null
  overduePayments: number
  pendingPayments: number
  totalOutstanding: number
  daysRemaining: number
  lifecycle: 'active' | 'ending-soon' | 'ended'
  history: ContractHistoryEvent[]
}

export type ContractManagementData = {
  contracts: ManagedContractRecord[]
  internalNotifications: InternalNotificationItem[]
  propertyOptions: Array<{
    id: string
    title: string
  }>
  metrics: {
    total: number
    active: number
    endingSoon: number
    ended: number
    outstandingAmount: number
  }
  dataSource: 'database' | 'fallback'
}

type ContractUpdateInput = {
  contractId: string
  startDate: string
  endDate: string
  rentAmount: number
}

type ContractRenewalInput = {
  contractId: string
  newEndDate: string
  newRentAmount?: number | null
}

type ContractTerminationInput = {
  contractId: string
  terminationDate: string
}

type ContractWithRelations = Prisma.ContractGetPayload<{
  include: {
    tenant: {
      select: {
        fullName: true
        portalEmail: true
        phone: true
        nationalId: true
      }
    }
    unit: {
      include: {
        property: {
          select: {
            id: true
            title: true
            address: true
          }
        }
      }
    }
    payments: {
      select: {
        amount: true
        dueDate: true
        status: true
      }
    }
  }
}>

function normalizeDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('invalid-date')
  }

  return parsed
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function daysRemaining(endDate: Date) {
  return Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

function contractLifecycle(isActive: boolean, endDate: Date) {
  if (!isActive || endDate.getTime() < Date.now()) {
    return 'ended' as const
  }

  if (daysRemaining(endDate) <= 30) {
    return 'ending-soon' as const
  }

  return 'active' as const
}

function summarizeMetrics(contracts: ManagedContractRecord[]) {
  return {
    total: contracts.length,
    active: contracts.filter((contract) => contract.lifecycle === 'active').length,
    endingSoon: contracts.filter((contract) => contract.lifecycle === 'ending-soon').length,
    ended: contracts.filter((contract) => contract.lifecycle === 'ended').length,
    outstandingAmount: contracts.reduce((sum, contract) => sum + contract.totalOutstanding, 0),
  }
}

function mapFallbackContract(record: FallbackContractRecord): ManagedContractRecord {
  const startDate = normalizeDate(record.startDate)
  const endDate = normalizeDate(record.endDate)

  return {
    ...record,
    startDate,
    endDate,
    nextPaymentDue: null,
    overduePayments: 0,
    pendingPayments: 0,
    totalOutstanding: 0,
    daysRemaining: daysRemaining(endDate),
    lifecycle: contractLifecycle(record.isActive, endDate),
    history: [],
  }
}

async function ensureFallbackDirectory() {
  await mkdir(path.dirname(CONTRACTS_FALLBACK_PATH), { recursive: true })
}

async function readFallbackContracts(): Promise<FallbackContractRecord[]> {
  try {
    const file = await readFile(CONTRACTS_FALLBACK_PATH, 'utf8')
    const parsed = JSON.parse(file) as FallbackContractRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeFallbackContracts(records: FallbackContractRecord[]) {
  await ensureFallbackDirectory()
  await writeFile(CONTRACTS_FALLBACK_PATH, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
}

function mapPrismaContract(contract: ContractWithRelations) {
  const pendingPayments = contract.payments.filter((payment) => payment.status === 'PENDING')
  const overduePayments = contract.payments.filter((payment) => payment.status === 'OVERDUE')
  const nextPaymentDue = [...overduePayments, ...pendingPayments]
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())[0]?.dueDate ?? null
  const endDate = new Date(contract.endDate)

  return {
    id: contract.id,
    tenantId: contract.tenantId,
    tenantName: contract.tenant.fullName,
    tenantEmail: contract.tenant.portalEmail ?? null,
    tenantPhone: contract.tenant.phone ?? null,
    tenantNationalId: contract.tenant.nationalId ?? null,
    propertyId: contract.unit.propertyId,
    propertyTitle: contract.unit.property.title,
    propertyAddress: contract.unit.property.address ?? null,
    unitId: contract.unitId,
    unitNumber: contract.unit.unitNumber,
    startDate: new Date(contract.startDate),
    endDate,
    rentAmount: Number(contract.rentAmount),
    isActive: contract.isActive,
    nextPaymentDue: nextPaymentDue ? new Date(nextPaymentDue) : null,
    overduePayments: overduePayments.length,
    pendingPayments: pendingPayments.length,
    totalOutstanding: [...pendingPayments, ...overduePayments].reduce((sum, payment) => sum + Number(payment.amount), 0),
    daysRemaining: daysRemaining(endDate),
    lifecycle: contractLifecycle(contract.isActive, endDate),
    history: [],
  } satisfies ManagedContractRecord
}

export async function listFallbackManagedContracts() {
  const contracts = await readFallbackContracts()
  return contracts.map(mapFallbackContract).sort((left, right) => left.endDate.getTime() - right.endDate.getTime())
}

export async function getFallbackManagedContractById(contractId: string) {
  const contracts = await listFallbackManagedContracts()
  return contracts.find((contract) => contract.id === contractId) ?? null
}

export async function getContractManagementData(): Promise<ContractManagementData> {
  try {
    await ensureRentalSeedData()

    const contracts = await prisma.contract.findMany({
      where: { agencyId: DEMO_AGENCY_ID },
      include: {
        tenant: {
          select: {
            fullName: true,
            portalEmail: true,
            phone: true,
            nationalId: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                address: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            dueDate: true,
            status: true,
          },
        },
      },
      orderBy: [{ endDate: 'asc' }],
    })

    const mappedContracts = contracts.map((contract) => mapPrismaContract(contract))
    const historyMap = await getContractHistoryMap(mappedContracts)
    const enrichedContracts = mappedContracts.map((contract) => ({
      ...contract,
      history: historyMap[contract.id] || [],
    }))
    const internalNotifications = await listInternalNotifications()
    const propertyOptions = Array.from(
      new Map(enrichedContracts.map((contract) => [contract.propertyId, { id: contract.propertyId, title: contract.propertyTitle }])).values()
    )

    return {
      contracts: enrichedContracts,
      internalNotifications,
      propertyOptions,
      metrics: summarizeMetrics(enrichedContracts),
      dataSource: 'database',
    }
  } catch {
    const contracts = await listFallbackManagedContracts()
    const historyMap = await getContractHistoryMap(contracts)
    const enrichedContracts = contracts.map((contract) => ({
      ...contract,
      history: historyMap[contract.id] || [],
    }))
    const internalNotifications = await listInternalNotifications()
    const propertyOptions = Array.from(
      new Map(enrichedContracts.map((contract) => [contract.propertyId, { id: contract.propertyId, title: contract.propertyTitle }])).values()
    )

    return {
      contracts: enrichedContracts,
      internalNotifications,
      propertyOptions,
      metrics: summarizeMetrics(enrichedContracts),
      dataSource: 'fallback',
    }
  }
}

export async function getManagedContractById(contractId: string) {
  try {
    await ensureRentalSeedData()

    const contract = await prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
      include: {
        tenant: {
          select: {
            fullName: true,
            portalEmail: true,
            phone: true,
            nationalId: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                address: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            dueDate: true,
            status: true,
          },
        },
      },
    })

    return mapPrismaContract(contract)
  } catch {
    return getFallbackManagedContractById(contractId)
  }
}

async function updateFallbackContract(contractId: string, updater: (record: FallbackContractRecord) => FallbackContractRecord) {
  const records = await readFallbackContracts()
  const index = records.findIndex((record) => record.id === contractId)

  if (index === -1) {
    throw new Error('contract-not-found')
  }

  records[index] = updater(records[index])
  await writeFallbackContracts(records)
}

export async function updateContractDetails(input: ContractUpdateInput) {
  const current = await getManagedContractById(input.contractId)
  if (!current) {
    throw new Error('contract-not-found')
  }

  const startDate = normalizeDate(input.startDate)
  const endDate = normalizeDate(input.endDate)

  if (endDate.getTime() <= startDate.getTime() || input.rentAmount <= 0) {
    throw new Error('invalid-contract-update')
  }

  try {
    await ensureRentalSeedData()
    await prisma.contract.update({
      where: { id: input.contractId },
      data: {
        startDate,
        endDate,
        rentAmount: input.rentAmount,
        isActive: endDate.getTime() >= Date.now(),
      },
    })
  } catch {
    // نتابع عبر التخزين الاحتياطي إذا لم تتوفر قاعدة البيانات.
  }

  await updateFallbackContract(input.contractId, (record) => ({
    ...record,
    startDate: toDateOnly(startDate),
    endDate: toDateOnly(endDate),
    rentAmount: input.rentAmount,
    isActive: endDate.getTime() >= Date.now(),
  }))

  const changes: string[] = []
  if (toDateOnly(current.startDate) !== toDateOnly(startDate)) {
    changes.push(`تاريخ البداية من ${toDateOnly(current.startDate)} إلى ${toDateOnly(startDate)}`)
  }
  if (toDateOnly(current.endDate) !== toDateOnly(endDate)) {
    changes.push(`تاريخ النهاية من ${toDateOnly(current.endDate)} إلى ${toDateOnly(endDate)}`)
  }
  if (current.rentAmount !== input.rentAmount) {
    changes.push(`القيمة الإيجارية من ${current.rentAmount} إلى ${input.rentAmount} دولار`)
  }

  await recordContractHistoryEvent({
    contractId: input.contractId,
    type: 'updated',
    title: 'تعديل بيانات العقد',
    description: changes.length > 0 ? `تم تعديل ${changes.join('، ')}.` : 'تم حفظ بيانات العقد من جديد دون تغييرات جوهرية إضافية.',
    actorLabel: 'إدارة المكتب',
    comparisons: [
      {
        label: 'تاريخ البداية',
        before: toDateOnly(current.startDate),
        after: toDateOnly(startDate),
      },
      {
        label: 'تاريخ النهاية',
        before: toDateOnly(current.endDate),
        after: toDateOnly(endDate),
      },
      {
        label: 'القيمة الإيجارية',
        before: `${current.rentAmount} دولار`,
        after: `${input.rentAmount} دولار`,
      },
    ].filter((item) => item.before !== item.after),
  })
}

export async function renewContract(input: ContractRenewalInput) {
  const current = await getManagedContractById(input.contractId)
  if (!current) {
    throw new Error('contract-not-found')
  }

  const newEndDate = normalizeDate(input.newEndDate)
  const nextRentAmount = input.newRentAmount && input.newRentAmount > 0 ? input.newRentAmount : current.rentAmount

  if (newEndDate.getTime() <= current.endDate.getTime()) {
    throw new Error('invalid-contract-renewal')
  }

  try {
    await ensureRentalSeedData()
    await prisma.contract.update({
      where: { id: input.contractId },
      data: {
        endDate: newEndDate,
        rentAmount: nextRentAmount,
        isActive: true,
      },
    })
  } catch {
    // fallback continues below
  }

  await updateFallbackContract(input.contractId, (record) => ({
    ...record,
    endDate: toDateOnly(newEndDate),
    rentAmount: nextRentAmount,
    isActive: true,
  }))

  await recordContractHistoryEvent({
    contractId: input.contractId,
    type: 'renewed',
    title: 'تجديد العقد',
    description: `تم تجديد العقد من نهاية سابقة ${toDateOnly(current.endDate)} إلى نهاية جديدة ${toDateOnly(newEndDate)} بقيمة إيجارية ${nextRentAmount} دولار.`,
    actorLabel: 'إدارة المكتب',
    comparisons: [
      {
        label: 'نهاية العقد',
        before: toDateOnly(current.endDate),
        after: toDateOnly(newEndDate),
      },
      {
        label: 'القيمة الإيجارية',
        before: `${current.rentAmount} دولار`,
        after: `${nextRentAmount} دولار`,
      },
    ].filter((item) => item.before !== item.after),
  })

  await notifyContractLifecycleChange({
    agencyId: DEMO_AGENCY_ID,
    contractId: input.contractId,
    tenantName: current.tenantName,
    tenantEmail: current.tenantEmail,
    propertyTitle: current.propertyTitle,
    unitNumber: current.unitNumber,
    previousEndDate: current.endDate,
    newEndDate,
    rentAmount: nextRentAmount,
    type: 'renewed',
  })
}

export async function terminateContract(input: ContractTerminationInput) {
  const current = await getManagedContractById(input.contractId)
  if (!current) {
    throw new Error('contract-not-found')
  }

  const terminationDate = normalizeDate(input.terminationDate)
  if (terminationDate.getTime() < current.startDate.getTime()) {
    throw new Error('invalid-contract-termination')
  }

  const shouldRemainActive = terminationDate.getTime() > Date.now()

  try {
    await ensureRentalSeedData()
    await prisma.contract.update({
      where: { id: input.contractId },
      data: {
        endDate: terminationDate,
        isActive: shouldRemainActive,
      },
    })
  } catch {
    // fallback continues below
  }

  await updateFallbackContract(input.contractId, (record) => ({
    ...record,
    endDate: toDateOnly(terminationDate),
    isActive: shouldRemainActive,
  }))

  await recordContractHistoryEvent({
    contractId: input.contractId,
    type: 'terminated',
    title: 'إنهاء العقد',
    description: `تم اعتماد إنهاء العقد بتاريخ ${toDateOnly(terminationDate)} بعد أن كانت نهايته السابقة ${toDateOnly(current.endDate)}.`,
    actorLabel: 'إدارة المكتب',
    comparisons: [
      {
        label: 'نهاية العقد',
        before: toDateOnly(current.endDate),
        after: toDateOnly(terminationDate),
      },
      {
        label: 'الحالة',
        before: current.isActive ? 'نشط' : 'منتهي',
        after: shouldRemainActive ? 'نشط حتى تاريخ الإنهاء' : 'منتهي',
      },
    ].filter((item) => item.before !== item.after),
  })

  await notifyContractLifecycleChange({
    agencyId: DEMO_AGENCY_ID,
    contractId: input.contractId,
    tenantName: current.tenantName,
    tenantEmail: current.tenantEmail,
    propertyTitle: current.propertyTitle,
    unitNumber: current.unitNumber,
    previousEndDate: current.endDate,
    newEndDate: terminationDate,
    rentAmount: current.rentAmount,
    type: 'terminated',
  })
}