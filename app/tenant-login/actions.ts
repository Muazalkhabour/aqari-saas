'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { recordAuthAuditEvent } from '@/lib/auth-audit'
import { clearRateLimit, getClientIpFromHeaders, getRateLimitStatus, recordRateLimitFailure, type RateLimitPolicy } from '@/lib/rate-limit'
import { prisma } from '@/prisma'
import { getTenantByPortalEmail } from '@/lib/rental-db'
import { createTenantSession } from '@/lib/tenant-session'
import { verifySecret } from '@/lib/tenant-auth'

const tenantLoginRateLimitPolicy: RateLimitPolicy = {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
}

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

function buildTenantLoginRedirect(error: string, portalEmail?: string, retryAfterSeconds?: number) {
  const params = new URLSearchParams({ error })

  if (portalEmail) {
    params.set('portalEmail', portalEmail)
  }

  if (retryAfterSeconds && retryAfterSeconds > 0) {
    params.set('retryAfter', String(retryAfterSeconds))
  }

  return `/tenant-login?${params.toString()}`
}

export async function tenantSignInAction(formData: FormData) {
  const portalEmail = getFormValue(formData, 'portalEmail').toLowerCase()
  const password = getFormValue(formData, 'password')
  const requestHeaders = await headers()
  const clientIp = getClientIpFromHeaders(requestHeaders)

  if (!portalEmail || !password) {
    redirect(buildTenantLoginRedirect('missing-fields', portalEmail))
  }

  const rateLimitTarget = {
    scope: 'tenant-login',
    identifier: portalEmail,
    clientIp,
  }
  const rateLimitStatus = await getRateLimitStatus(rateLimitTarget, tenantLoginRateLimitPolicy)

  if (rateLimitStatus.limited) {
    await recordAuthAuditEvent({
      scope: 'tenant-login',
      outcome: 'BLOCKED',
      identifier: portalEmail,
      clientIp,
      reason: 'Rate limit active before tenant login attempt',
      retryAfterSeconds: rateLimitStatus.retryAfterSeconds,
    })
    redirect(buildTenantLoginRedirect('too-many-attempts', portalEmail, rateLimitStatus.retryAfterSeconds))
  }

  const tenant = await getTenantByPortalEmail(portalEmail)

  if (!tenant?.passwordHash) {
    const failureStatus = await recordRateLimitFailure(rateLimitTarget, tenantLoginRateLimitPolicy)
    await recordAuthAuditEvent({
      scope: 'tenant-login',
      outcome: failureStatus.limited ? 'BLOCKED' : 'FAILURE',
      identifier: portalEmail,
      clientIp,
      reason: failureStatus.limited
        ? 'Tenant login blocked after invalid account lookup attempts'
        : 'Tenant portal account not found or disabled',
      retryAfterSeconds: failureStatus.retryAfterSeconds,
    })
    redirect(buildTenantLoginRedirect(
      failureStatus.limited ? 'too-many-attempts' : 'invalid-credentials',
      portalEmail,
      failureStatus.retryAfterSeconds
    ))
  }

  const isValid = await verifySecret(password, tenant.passwordHash)

  if (!isValid) {
    const failureStatus = await recordRateLimitFailure(rateLimitTarget, tenantLoginRateLimitPolicy)
    await recordAuthAuditEvent({
      scope: 'tenant-login',
      outcome: failureStatus.limited ? 'BLOCKED' : 'FAILURE',
      identifier: portalEmail,
      clientIp,
      reason: failureStatus.limited
        ? 'Tenant login blocked after repeated invalid passwords'
        : 'Invalid tenant portal password',
      retryAfterSeconds: failureStatus.retryAfterSeconds,
    })
    redirect(buildTenantLoginRedirect(
      failureStatus.limited ? 'too-many-attempts' : 'invalid-credentials',
      portalEmail,
      failureStatus.retryAfterSeconds
    ))
  }

  await clearRateLimit(rateLimitTarget, tenantLoginRateLimitPolicy)

  try {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { lastLoginAt: new Date() },
    })
  } catch {
    // نكمل بتسجيل الدخول التجريبي إذا كانت قاعدة البيانات غير متاحة.
  }

  try {
    await createTenantSession(tenant.id)
  } catch {
    await recordAuthAuditEvent({
      scope: 'tenant-login',
      outcome: 'FAILURE',
      identifier: portalEmail,
      clientIp,
      reason: 'Tenant session creation failed after valid credentials',
    })
    redirect(buildTenantLoginRedirect('session-unavailable', portalEmail))
  }

  await recordAuthAuditEvent({
    scope: 'tenant-login',
    outcome: 'SUCCESS',
    identifier: portalEmail,
    clientIp,
    reason: 'Tenant login succeeded',
  })
  redirect('/tenant-portal')
}