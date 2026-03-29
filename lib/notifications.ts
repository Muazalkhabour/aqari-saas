import nodemailer from 'nodemailer'
import { prisma } from '@/prisma'
import { getEmailNotificationCredentials, hasEmailNotificationCredentials } from '@/lib/env'

type NotificationInput = {
  agencyId: string
  recipient: string
  subject: string
  html: string
  text: string
  template: string
  tenantId?: string
  contractId?: string
  paymentId?: string
  maintenanceRequestId?: string
}

function previewText(text: string) {
  return text.slice(0, 180)
}

async function createNotificationLog(input: NotificationInput & {
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'
  errorMessage?: string
}) {
  return prisma.notificationLog.create({
    data: {
      agencyId: input.agencyId,
      tenantId: input.tenantId || null,
      contractId: input.contractId || null,
      paymentId: input.paymentId || null,
      maintenanceRequestId: input.maintenanceRequestId || null,
      channel: 'EMAIL',
      status: input.status,
      template: input.template,
      recipient: input.recipient,
      subject: input.subject,
      bodyPreview: previewText(input.text),
      errorMessage: input.errorMessage || null,
      sentAt: input.status === 'SENT' ? new Date() : null,
    },
  })
}

export async function sendEmailNotification(input: NotificationInput) {
  if (!hasEmailNotificationCredentials()) {
    await createNotificationLog({
      ...input,
      status: 'SKIPPED',
      errorMessage: 'smtp-not-configured',
    })

    return { delivered: false, reason: 'smtp-not-configured' }
  }

  const credentials = getEmailNotificationCredentials()

  const transporter = nodemailer.createTransport({
    host: credentials.host,
    port: credentials.port,
    secure: credentials.port === 465,
    auth: {
      user: credentials.user,
      pass: credentials.pass,
    },
  })

  try {
    await transporter.sendMail({
      from: `"${credentials.fromName}" <${credentials.fromEmail}>`,
      to: input.recipient,
      subject: input.subject,
      text: input.text,
      html: input.html,
    })

    await createNotificationLog({
      ...input,
      status: 'SENT',
    })

    return { delivered: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'mail-send-failed'

    await createNotificationLog({
      ...input,
      status: 'FAILED',
      errorMessage,
    })

    return { delivered: false, reason: errorMessage }
  }
}