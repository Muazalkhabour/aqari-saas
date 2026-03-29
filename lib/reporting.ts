import { prisma } from '@/prisma'
import { getFallbackManagedContractById, listFallbackManagedContracts } from '@/lib/contract-management'
import { ensureRentalSeedData, getTenantByPortalEmail, getTenantPortalData } from '@/lib/rental-db'
import { getOfficeSettings } from '@/lib/office-settings'

const arabicMonth = new Intl.DateTimeFormat('ar-SY', { month: 'short' })

const demoTenantDirectory = {
  'rima@tenant.aqari.sy': {
    tenantId: 'tenant-rima-khalil',
    fullName: 'ريما خليل',
    phone: '+963 944 221 110',
    nationalId: 'SY-1001',
    unitNumber: 'B-12',
  },
  'samer@tenant.aqari.sy': {
    tenantId: 'tenant-samer-hallaq',
    fullName: 'سامر حلاق',
    phone: '+963 933 200 515',
    nationalId: 'SY-1002',
    unitNumber: 'Sea-5',
  },
  'lina@tenant.aqari.sy': {
    tenantId: 'tenant-lina-younes',
    fullName: 'لينا يونس',
    phone: '+963 955 415 320',
    nationalId: 'SY-1003',
    unitNumber: 'A-3',
  },
} as const

type DemoTenantEmail = keyof typeof demoTenantDirectory

type RevenuePoint = {
  monthKey: string
  monthLabel: string
  expected: number
  collected: number
  outstanding: number
}

type ContractSummary = {
  id: string
  tenantName: string
  tenantEmail: string | null
  tenantPhone: string | null
  propertyTitle: string
  propertyAddress: string | null
  unitNumber: string
  rentAmount: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

type PaymentSummary = {
  id: string
  amount: number
  dueDate: Date
  paidDate: Date | null
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'
  notes: string | null
  tenantName: string
  propertyTitle: string
}

export type ReportingDashboardData = {
  agency: {
    id: string
    name: string
    email: string | null
    phone: string | null
    whatsappNumber: string | null
    address: string | null
    logoUrl: string | null
    managerName: string | null
    signatureName: string | null
    sealLabel: string | null
  }
  monthlyRevenue: RevenuePoint[]
  collectionSummary: {
    collected: number
    pending: number
    overdue: number
  }
  contracts: ContractSummary[]
  payments: PaymentSummary[]
  dataSource: 'database' | 'fallback'
}

export type ContractPrintData = {
  agency: ReportingDashboardData['agency']
  contract: ContractSummary
  tenant: {
    fullName: string
    portalEmail: string | null
    phone: string | null
    nationalId: string | null
  }
  payments: PaymentSummary[]
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999)
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(value: Date) {
  return `${arabicMonth.format(value)} ${value.getFullYear()}`
}

function buildLastMonths(count: number) {
  const months: Array<{ monthStart: Date; monthEnd: Date; monthKey: string; monthLabel: string }> = []
  const now = new Date()

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    months.push({
      monthStart: startOfMonth(date),
      monthEnd: endOfMonth(date),
      monthKey: monthKey(date),
      monthLabel: monthLabel(date),
    })
  }

  return months
}

function buildRevenueSeries(contracts: ContractSummary[], payments: PaymentSummary[]) {
  const months = buildLastMonths(6)

  return months.map((month) => {
    const expected = contracts.reduce((total, contract) => {
      const overlaps = contract.startDate <= month.monthEnd && contract.endDate >= month.monthStart
      return overlaps ? total + contract.rentAmount : total
    }, 0)

    const collected = payments.reduce((total, payment) => {
      if (payment.status !== 'PAID') {
        return total
      }

      const paidAt = payment.paidDate ?? payment.dueDate
      return monthKey(paidAt) === month.monthKey ? total + payment.amount : total
    }, 0)

    const outstanding = payments.reduce((total, payment) => {
      if (payment.status === 'PAID' || payment.status === 'CANCELLED') {
        return total
      }

      return monthKey(payment.dueDate) === month.monthKey ? total + payment.amount : total
    }, 0)

    return {
      monthKey: month.monthKey,
      monthLabel: month.monthLabel,
      expected,
      collected,
      outstanding,
    }
  })
}

function summarizeCollections(payments: PaymentSummary[]) {
  return payments.reduce(
    (summary, payment) => {
      if (payment.status === 'PAID') {
        summary.collected += payment.amount
      } else if (payment.status === 'OVERDUE') {
        summary.overdue += payment.amount
      } else if (payment.status === 'PENDING') {
        summary.pending += payment.amount
      }

      return summary
    },
    { collected: 0, pending: 0, overdue: 0 }
  )
}

async function loadFallbackTenantBundles() {
  const tenants = await Promise.all(
    (Object.keys(demoTenantDirectory) as DemoTenantEmail[]).map(async (email) => {
      const tenant = await getTenantByPortalEmail(email)

      if (!tenant?.id) {
        return null
      }

      const portal = await getTenantPortalData(tenant.id)
      return portal
    })
  )

  return tenants.filter((tenant) => tenant !== null)
}

async function buildFallbackReportingDashboardData(): Promise<ReportingDashboardData> {
  const tenantBundles = await loadFallbackTenantBundles()
  const agency = await getOfficeSettings()
  const fallbackContracts = await listFallbackManagedContracts()
  const contracts: ContractSummary[] = fallbackContracts.map((contract) => ({
    id: contract.id,
    tenantName: contract.tenantName,
    tenantEmail: contract.tenantEmail,
    tenantPhone: contract.tenantPhone,
    propertyTitle: contract.propertyTitle,
    propertyAddress: contract.propertyAddress,
    unitNumber: contract.unitNumber,
    rentAmount: contract.rentAmount,
    startDate: contract.startDate,
    endDate: contract.endDate,
    isActive: contract.isActive,
  }))
  const payments: PaymentSummary[] = []

  for (const tenant of tenantBundles) {
    const activeContract = contracts.find((contract) => contract.tenantEmail === tenant.portalEmail) ?? contracts.find((contract) => contract.tenantName === tenant.fullName)

    payments.push(
      ...tenant.payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        dueDate: new Date(payment.dueDate),
        paidDate: payment.status === 'PAID' ? new Date(payment.dueDate) : null,
        status: payment.status,
        notes: payment.notes ?? null,
        tenantName: tenant.fullName,
        propertyTitle: payment.property?.title ?? activeContract?.propertyTitle ?? 'بدون عقار',
      }))
    )
  }

  return {
    agency,
    monthlyRevenue: buildRevenueSeries(contracts, payments),
    collectionSummary: summarizeCollections(payments),
    contracts,
    payments,
    dataSource: 'fallback',
  }
}

export async function getReportingDashboardData(): Promise<ReportingDashboardData> {
  try {
    await ensureRentalSeedData()

    const agency = await prisma.agency.findUnique({
      where: { id: 'agency-demo-main' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
      },
    })

    const officeSettings = await getOfficeSettings()

    const contracts = await prisma.contract.findMany({
      where: {
        agencyId: 'agency-demo-main',
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            fullName: true,
            portalEmail: true,
            phone: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                title: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    })

    const payments = await prisma.payment.findMany({
      where: {
        agencyId: 'agency-demo-main',
      },
      include: {
        tenant: {
          select: {
            fullName: true,
          },
        },
        property: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }],
    })

    const mappedContracts: ContractSummary[] = contracts.map((contract) => ({
      id: contract.id,
      tenantName: contract.tenant.fullName,
      tenantEmail: contract.tenant.portalEmail ?? null,
      tenantPhone: contract.tenant.phone ?? null,
      propertyTitle: contract.unit.property.title,
      propertyAddress: contract.unit.property.address,
      unitNumber: contract.unit.unitNumber,
      rentAmount: Number(contract.rentAmount),
      startDate: new Date(contract.startDate),
      endDate: new Date(contract.endDate),
      isActive: contract.isActive,
    }))

    const mappedPayments: PaymentSummary[] = payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      dueDate: new Date(payment.dueDate),
      paidDate: payment.paidDate ? new Date(payment.paidDate) : null,
      status: payment.status,
      notes: payment.notes ?? null,
      tenantName: payment.tenant.fullName,
      propertyTitle: payment.property?.title ?? 'بدون عقار',
    }))

    return {
      agency: {
        id: agency?.id ?? officeSettings.id,
        name: agency?.name ?? officeSettings.name,
        email: agency?.email ?? officeSettings.email,
        phone: agency?.phone ?? officeSettings.phone,
        whatsappNumber: officeSettings.whatsappNumber,
        address: agency?.address ?? officeSettings.address,
        logoUrl: agency?.logoUrl ?? officeSettings.logoUrl,
        managerName: officeSettings.managerName,
        signatureName: officeSettings.signatureName,
        sealLabel: officeSettings.sealLabel,
      },
      monthlyRevenue: buildRevenueSeries(mappedContracts, mappedPayments),
      collectionSummary: summarizeCollections(mappedPayments),
      contracts: mappedContracts,
      payments: mappedPayments,
      dataSource: 'database',
    }
  } catch {
    return buildFallbackReportingDashboardData()
  }
}

export async function getContractPrintData(contractId: string): Promise<ContractPrintData | null> {
  try {
    await ensureRentalSeedData()
    const officeSettings = await getOfficeSettings()

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            logoUrl: true,
          },
        },
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
                title: true,
                address: true,
              },
            },
          },
        },
        payments: {
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!contract) {
      return null
    }

    return {
      agency: {
        id: contract.agency.id,
        name: contract.agency.name,
        email: contract.agency.email,
        phone: contract.agency.phone,
        whatsappNumber: officeSettings.whatsappNumber,
        address: contract.agency.address,
        logoUrl: contract.agency.logoUrl ?? officeSettings.logoUrl,
        managerName: officeSettings.managerName,
        signatureName: officeSettings.signatureName,
        sealLabel: officeSettings.sealLabel,
      },
      contract: {
        id: contract.id,
        tenantName: contract.tenant.fullName,
        tenantEmail: contract.tenant.portalEmail ?? null,
        tenantPhone: contract.tenant.phone ?? null,
        propertyTitle: contract.unit.property.title,
        propertyAddress: contract.unit.property.address,
        unitNumber: contract.unit.unitNumber,
        rentAmount: Number(contract.rentAmount),
        startDate: new Date(contract.startDate),
        endDate: new Date(contract.endDate),
        isActive: contract.isActive,
      },
      tenant: {
        fullName: contract.tenant.fullName,
        portalEmail: contract.tenant.portalEmail ?? null,
        phone: contract.tenant.phone ?? null,
        nationalId: contract.tenant.nationalId ?? null,
      },
      payments: contract.payments.map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        dueDate: new Date(payment.dueDate),
        paidDate: payment.paidDate ? new Date(payment.paidDate) : null,
        status: payment.status,
        notes: payment.notes ?? null,
        tenantName: contract.tenant.fullName,
        propertyTitle: contract.unit.property.title,
      })),
    }
  } catch {
    const reporting = await buildFallbackReportingDashboardData()
    const contract = reporting.contracts.find((item) => item.id === contractId)
    const fallbackContract = await getFallbackManagedContractById(contractId)

    if (!contract) {
      return null
    }

    const tenantDirectory = Object.entries(demoTenantDirectory).find(([, item]) => item.tenantId === fallbackContract?.tenantId)

    return {
      agency: reporting.agency,
      contract,
      tenant: {
        fullName: contract.tenantName,
        portalEmail: contract.tenantEmail,
        phone: fallbackContract?.tenantPhone ?? contract.tenantPhone,
        nationalId: fallbackContract?.tenantNationalId ?? tenantDirectory?.[1].nationalId ?? null,
      },
      payments: reporting.payments.filter((payment) => payment.tenantName === contract.tenantName),
    }
  }
}