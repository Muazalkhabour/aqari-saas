import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/prisma'
import { createSessionToken, hashToken } from '@/lib/tenant-auth'
import { getTenantSessionSigningSecret, isDevelopmentDemoModeEnabled } from '@/lib/env'
import { createHmac, timingSafeEqual } from 'node:crypto'

const TENANT_SESSION_COOKIE = 'aqari_tenant_session'
const DEMO_SESSION_PREFIX = 'demo:'
const SESSION_DURATION_DAYS = 14

export type TenantSessionRecord = Prisma.TenantSessionGetPayload<{
  include: {
    tenant: true
  }
}>

function buildExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
}

function signDemoSessionValue(payload: string) {
  return createHmac('sha256', getTenantSessionSigningSecret()).update(payload).digest('hex')
}

function buildDemoSessionToken(tenantId: string, expiresAt: Date) {
  const payload = `${tenantId}:${expiresAt.toISOString()}`
  const signature = signDemoSessionValue(payload)
  return `${DEMO_SESSION_PREFIX}${payload}:${signature}`
}

function parseDemoSessionToken(token: string) {
  if (!token.startsWith(DEMO_SESSION_PREFIX)) {
    return null
  }

  const rawValue = token.slice(DEMO_SESSION_PREFIX.length)
  const lastSeparatorIndex = rawValue.lastIndexOf(':')
  if (lastSeparatorIndex <= 0) {
    return null
  }

  const payload = rawValue.slice(0, lastSeparatorIndex)
  const signature = rawValue.slice(lastSeparatorIndex + 1)
  const payloadSegments = payload.split(':')
  if (payloadSegments.length < 2) {
    return null
  }

  const tenantId = payloadSegments[0]
  const expiresAtValue = payloadSegments.slice(1).join(':')
  const expectedSignature = signDemoSessionValue(payload)
  const signatureBuffer = Buffer.from(signature, 'hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')

  if (
    !tenantId ||
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  const expiresAt = new Date(expiresAtValue)
  if (Number.isNaN(expiresAt.getTime())) {
    return null
  }

  return { tenantId, expiresAt }
}

function isExpired(value: Date) {
  return value.getTime() <= Date.now()
}

async function clearPersistedSession(token: string) {
  if (token.startsWith(DEMO_SESSION_PREFIX)) {
    return
  }

  try {
    await prisma.tenantSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    })
  } catch {
    // نحاول تنظيف الكوكيز حتى لو تعذر حذف السجل من قاعدة البيانات.
  }
}

function getDemoTenantName(tenantId: string) {
  switch (tenantId) {
    case 'tenant-rima-khalil':
      return 'ريما خليل'
    case 'tenant-samer-hallaq':
      return 'سامر حلاق'
    case 'tenant-lina-younes':
      return 'لينا يونس'
    default:
      return 'مستأجر تجريبي'
  }
}

export async function createTenantSession(tenantId: string) {
  const cookieStore = await cookies()
  const token = createSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = buildExpiryDate()

  try {
    await prisma.tenantSession.create({
      data: {
        tenantId,
        tokenHash,
        expiresAt,
      },
    })

    cookieStore.set(TENANT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })
    return
  } catch {
    if (!isDevelopmentDemoModeEnabled()) {
      throw new Error('Tenant session storage is unavailable.')
    }

    cookieStore.set(TENANT_SESSION_COOKIE, buildDemoSessionToken(tenantId, expiresAt), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })
  }
}

export async function getTenantSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TENANT_SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  if (token.startsWith(DEMO_SESSION_PREFIX)) {
    if (!isDevelopmentDemoModeEnabled()) {
      return null
    }

    const parsedToken = parseDemoSessionToken(token)

    if (!parsedToken || isExpired(parsedToken.expiresAt)) {
      return null
    }

    return {
      id: `demo-session-${parsedToken.tenantId}`,
      tokenHash: hashToken(token),
      expiresAt: parsedToken.expiresAt,
      createdAt: new Date(),
      lastSeenAt: new Date(),
      tenantId: parsedToken.tenantId,
      tenant: {
        id: parsedToken.tenantId,
        fullName: getDemoTenantName(parsedToken.tenantId),
      },
    }
  }

  try {
    const session = await prisma.tenantSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        tenant: true,
      },
    })

    if (!session) {
      return null
    }

    if (isExpired(session.expiresAt)) {
      await clearPersistedSession(token)
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function requireTenantSession() {
  const session = await getTenantSession()

  if (!session?.tenant?.id) {
    redirect('/auth?mode=signin&role=tenant')
  }

  return session
}

export async function destroyTenantSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TENANT_SESSION_COOKIE)?.value

  if (token) {
    await clearPersistedSession(token)
  }

  cookieStore.delete(TENANT_SESSION_COOKIE)
}