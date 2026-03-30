'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { MaintenanceStatus } from '@prisma/client'
import { prisma } from '@/prisma'
import { saveLastBulkRenewSummary } from '@/lib/bulk-renew-summary'
import { getContractManagementData, renewContract, terminateContract, updateContractDetails } from '@/lib/contract-management'
import { markAllInternalNotificationsAsRead, markInternalNotificationAsRead } from '@/lib/contract-activity'
import { destroyTenantSession, requireTenantSession } from '@/lib/tenant-session'
import { dispatchOperationalReminderEmails, ensureRentalSeedData } from '@/lib/rental-db'
import { sendEmailNotification } from '@/lib/notifications'

const maintenanceStatuses: MaintenanceStatus[] = ['NEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

export async function createMaintenanceRequestAction(formData: FormData) {
  const session = await requireTenantSession()
  await ensureRentalSeedData()

  const title = readText(formData, 'title')
  const description = readText(formData, 'description')
  const priority = readText(formData, 'priority') === 'URGENT' ? 'URGENT' : 'NORMAL'
  const contractId = readText(formData, 'contractId')
  const propertyId = readText(formData, 'propertyId') || null

  if (!title || !description || !contractId) {
    redirect('/tenant-portal?error=missing-maintenance-fields')
  }

  const contract = await prisma.contract.findFirst({
    where: {
      id: contractId,
      tenantId: session.tenant.id,
    },
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
      agency: true,
    },
  })

  if (!contract) {
    redirect('/tenant-portal?error=contract-not-found')
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      title,
      description,
      priority,
      status: 'NEW',
      tenantId: session.tenant.id,
      contractId: contract.id,
      agencyId: contract.agencyId,
      propertyId: propertyId || contract.unit.propertyId || null,
    },
  })

  if (contract.agency?.email) {
    await sendEmailNotification({
      agencyId: contract.agencyId,
      tenantId: session.tenant.id,
      contractId: contract.id,
      maintenanceRequestId: request.id,
      recipient: contract.agency.email,
      subject: 'طلب صيانة جديد من بوابة المستأجر',
      text: `ورد طلب صيانة جديد من ${contract.tenant.fullName} بعنوان: ${title}.`,
      html: `<p>ورد طلب صيانة جديد من <strong>${contract.tenant.fullName}</strong>.</p><p><strong>${title}</strong></p><p>${description}</p>`,
      template: 'maintenance-request-created',
    })
  }

  revalidatePath('/tenant-portal')
  revalidatePath('/maintenance')
  revalidatePath('/dashboard')
  redirect('/tenant-portal?success=maintenance-created')
}

export async function updateMaintenanceRequestStatusAction(formData: FormData) {
  await ensureRentalSeedData()

  const requestId = readText(formData, 'requestId')
  const statusValue = readText(formData, 'status')
  const scheduledFor = readText(formData, 'scheduledFor')
  const status = maintenanceStatuses.find((candidate) => candidate === statusValue)

  if (!requestId || !status) {
    redirect('/maintenance?error=invalid-maintenance-update')
  }

  await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
  })

  revalidatePath('/maintenance')
  revalidatePath('/dashboard')
  redirect('/maintenance?success=maintenance-updated')
}

export async function markPaymentAsPaidAction(formData: FormData) {
  await ensureRentalSeedData()

  const paymentId = readText(formData, 'paymentId')

  if (!paymentId) {
    redirect('/maintenance?error=invalid-payment')
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
    },
  })

  revalidatePath('/maintenance')
  revalidatePath('/dashboard')
  revalidatePath('/tenant-portal')
  redirect('/maintenance?success=payment-confirmed')
}

export async function dispatchOperationalNotificationsAction() {
  return dispatchOperationalNotificationsActionWithFormData(new FormData())
}

export async function dispatchOperationalNotificationsActionWithFormData(formData: FormData) {
  await ensureRentalSeedData()
  await dispatchOperationalReminderEmails()
  revalidatePath('/dashboard')
  revalidatePath('/maintenance')
  const redirectTo = readText(formData, 'redirectTo')
  redirect(redirectTo || '/dashboard')
}

export async function updateContractDetailsAction(formData: FormData) {
  const contractId = readText(formData, 'contractId')
  const startDate = readText(formData, 'startDate')
  const endDate = readText(formData, 'endDate')
  const rentAmount = Number(readText(formData, 'rentAmount'))

  if (!contractId || !startDate || !endDate || !Number.isFinite(rentAmount)) {
    redirect('/contracts?error=invalid-contract')
  }

  try {
    await updateContractDetails({
      contractId,
      startDate,
      endDate,
      rentAmount,
    })
  } catch {
    redirect('/contracts?error=invalid-contract-update')
  }

  revalidatePath('/contracts')
  revalidatePath('/dashboard')
  revalidatePath('/tenant-portal')
  revalidatePath(`/contracts/${contractId}/print`)
  redirect('/contracts?success=contract-updated')
}

export async function renewContractAction(formData: FormData) {
  const contractId = readText(formData, 'contractId')
  const newEndDate = readText(formData, 'newEndDate')
  const rentValue = readText(formData, 'newRentAmount')

  if (!contractId || !newEndDate) {
    redirect('/contracts?error=invalid-contract')
  }

  try {
    await renewContract({
      contractId,
      newEndDate,
      newRentAmount: rentValue ? Number(rentValue) : null,
    })
  } catch {
    redirect('/contracts?error=invalid-contract-renewal')
  }

  revalidatePath('/contracts')
  revalidatePath('/dashboard')
  revalidatePath('/tenant-portal')
  revalidatePath(`/contracts/${contractId}/print`)
  redirect('/contracts?success=contract-renewed')
}

function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, value.getDate())
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

export async function bulkRenewEndingSoonContractsAction(formData: FormData) {
  const selectedContractIds = formData.getAll('contractIds').map((value) => String(value).trim()).filter(Boolean)
  const extensionMonths = Number(readText(formData, 'extensionMonths') || '12')
  const rentAdjustment = Number(readText(formData, 'rentAdjustment') || '0')

  if (selectedContractIds.length === 0) {
    redirect('/contracts/bulk-renew?error=no-contracts-selected')
  }

  if (!Number.isInteger(extensionMonths) || extensionMonths <= 0 || extensionMonths > 24 || !Number.isFinite(rentAdjustment) || rentAdjustment < 0) {
    redirect('/contracts/bulk-renew?error=invalid-bulk-renewal')
  }

  const data = await getContractManagementData()
  const eligibleContracts = data.contracts.filter((contract) => contract.lifecycle === 'ending-soon' && selectedContractIds.includes(contract.id))

  if (eligibleContracts.length === 0) {
    redirect('/contracts/bulk-renew?error=no-contracts-selected')
  }

  let successCount = 0
  let failedCount = 0
  const succeededIds: string[] = []
  const failedIds: string[] = []

  for (const contract of eligibleContracts) {
    const nextEndDate = addMonths(contract.endDate, extensionMonths)

    try {
      await renewContract({
        contractId: contract.id,
        newEndDate: toDateOnly(nextEndDate),
        newRentAmount: rentAdjustment > 0 ? contract.rentAmount + rentAdjustment : contract.rentAmount,
      })
      successCount += 1
      succeededIds.push(contract.id)
    } catch {
      failedCount += 1
      failedIds.push(contract.id)
    }
  }

  if (successCount === 0) {
    redirect('/contracts/bulk-renew?error=bulk-renew-failed')
  }

  await saveLastBulkRenewSummary({
    successCount,
    failedCount,
    renewedIds: succeededIds,
    failedIds,
    extensionMonths,
    rentAdjustment,
  })

  revalidatePath('/contracts')
  revalidatePath('/dashboard')
  revalidatePath('/tenant-portal')
  const params = new URLSearchParams({
    success: 'bulk-contracts-renewed',
    count: String(successCount),
  })

  if (failedCount > 0) {
    params.set('failed', String(failedCount))
  }

  redirect(`/contracts?${params.toString()}`)
}

export async function terminateContractAction(formData: FormData) {
  const contractId = readText(formData, 'contractId')
  const terminationDate = readText(formData, 'terminationDate')

  if (!contractId || !terminationDate) {
    redirect('/contracts?error=invalid-contract')
  }

  try {
    await terminateContract({
      contractId,
      terminationDate,
    })
  } catch {
    redirect('/contracts?error=invalid-contract-termination')
  }

  revalidatePath('/contracts')
  revalidatePath('/dashboard')
  revalidatePath('/tenant-portal')
  revalidatePath(`/contracts/${contractId}/print`)
  redirect('/contracts?success=contract-ended')
}

export async function markInternalNotificationReadAction(formData: FormData) {
  const notificationId = readText(formData, 'notificationId')

  if (!notificationId) {
    redirect('/notifications')
  }

  await markInternalNotificationAsRead(notificationId)
  revalidatePath('/notifications')
  revalidatePath('/contracts')
  redirect('/notifications')
}

export async function markAllInternalNotificationsReadAction() {
  await markAllInternalNotificationsAsRead()
  revalidatePath('/notifications')
  revalidatePath('/contracts')
  redirect('/notifications')
}

export async function tenantLogoutAction() {
  await destroyTenantSession()
  redirect('/auth?mode=signin&role=tenant')
}