'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { recordAuthAuditEvent } from '@/lib/auth-audit'
import { getSupabaseCredentials, hasSupabaseCredentials, isDevelopmentDemoModeEnabled } from '@/lib/env'
import { clearRateLimit, getClientIpFromHeaders, getRateLimitStatus, recordRateLimitFailure, type RateLimitPolicy } from '@/lib/rate-limit'
import { prisma } from '@/prisma'

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

type RedirectOptions = {
  email?: string
  retryAfterSeconds?: number
}

const ownerLoginRateLimitPolicy: RateLimitPolicy = {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
}

function appendRedirectParams(basePath: string, error: string, options: RedirectOptions = {}) {
  const [pathname, queryString] = basePath.split('?', 2)
  const params = new URLSearchParams(queryString || '')
  params.set('error', error)

  if (options.email) {
    params.set('email', options.email)
  }

  if (options.retryAfterSeconds && options.retryAfterSeconds > 0) {
    params.set('retryAfter', String(options.retryAfterSeconds))
  }

  return `${pathname}?${params.toString()}`
}

function buildLoginRedirect(error: string, email?: string, retryAfterSeconds?: number, returnPath?: string) {
  return appendRedirectParams(returnPath || '/auth?mode=signin&role=manager', error, {
    email,
    retryAfterSeconds,
  })
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email')).trim()
  const password = String(formData.get('password'))
  const returnPath = String(formData.get('returnPath') || '').trim() || undefined
  const successPath = String(formData.get('successPath') || '').trim() || '/dashboard'
  const normalizedEmail = email.toLowerCase()
  const requestHeaders = await headers()
  const clientIp = getClientIpFromHeaders(requestHeaders)

  if (!hasSupabaseCredentials()) {
    await recordAuthAuditEvent({
      scope: 'owner-login',
      outcome: 'FAILURE',
      identifier: normalizedEmail,
      clientIp,
      reason: 'Office auth provider is unavailable',
    })
    redirect(isDevelopmentDemoModeEnabled() ? '/dashboard?mode=demo' : buildLoginRedirect('auth-unavailable', email, undefined, returnPath))
  }

  if (!email || !password) {
    redirect(buildLoginRedirect('missing-fields', email, undefined, returnPath))
  }

  const rateLimitTarget = {
    scope: 'owner-login',
    identifier: normalizedEmail,
    clientIp,
  }
  const rateLimitStatus = await getRateLimitStatus(rateLimitTarget, ownerLoginRateLimitPolicy)

  if (rateLimitStatus.limited) {
    await recordAuthAuditEvent({
      scope: 'owner-login',
      outcome: 'BLOCKED',
      identifier: normalizedEmail,
      clientIp,
      reason: 'Rate limit active before owner login attempt',
      retryAfterSeconds: rateLimitStatus.retryAfterSeconds,
    })
    redirect(buildLoginRedirect('too-many-attempts', email, rateLimitStatus.retryAfterSeconds, returnPath))
  }

  const credentials = getSupabaseCredentials()
  
  const cookieStore = await cookies()

  const supabase = createServerClient(
    credentials.url,
    credentials.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            })
          } catch {
            // يتم تجاهل الخطأ إذا تعذر تعديل الكوكيز أثناء الرندر.
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const failureStatus = await recordRateLimitFailure(rateLimitTarget, ownerLoginRateLimitPolicy)
    await recordAuthAuditEvent({
      scope: 'owner-login',
      outcome: failureStatus.limited ? 'BLOCKED' : 'FAILURE',
      identifier: normalizedEmail,
      clientIp,
      reason: failureStatus.limited
        ? 'Owner login blocked after repeated invalid credentials'
        : 'Invalid owner credentials',
      retryAfterSeconds: failureStatus.retryAfterSeconds,
    })
    console.error(error)
    redirect(buildLoginRedirect(
      failureStatus.limited ? 'too-many-attempts' : 'invalid-credentials',
      email,
      failureStatus.retryAfterSeconds,
      returnPath
    ))
  }

  await clearRateLimit(rateLimitTarget, ownerLoginRateLimitPolicy)
  await recordAuthAuditEvent({
    scope: 'owner-login',
    outcome: 'SUCCESS',
    identifier: normalizedEmail,
    clientIp,
    reason: 'Owner login succeeded',
  })

  if (data.user?.email) {
    const metadata = data.user.user_metadata as Record<string, unknown> | undefined
    const fullName = typeof metadata?.full_name === 'string'
      ? metadata.full_name
      : typeof metadata?.name === 'string'
        ? metadata.name
        : data.user.email.split('@')[0]

    try {
      await prisma.ownerAccount.upsert({
        where: { authId: data.user.id },
        update: {
          email: data.user.email,
          fullName,
          phone: typeof metadata?.phone === 'string' ? metadata.phone : null,
          city: typeof metadata?.city === 'string' ? metadata.city : null,
        },
        create: {
          authId: data.user.id,
          email: data.user.email,
          fullName,
          phone: typeof metadata?.phone === 'string' ? metadata.phone : null,
          city: typeof metadata?.city === 'string' ? metadata.city : null,
        },
      })
    } catch (error) {
      console.error('Failed to sync owner account after successful Supabase login.', error)
    }
  }

  redirect(successPath)
}