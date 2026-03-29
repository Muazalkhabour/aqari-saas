import { createHash } from 'node:crypto'
import { getRateLimitStore, type RateLimitEntry } from '@/lib/rate-limit-store'

export type RateLimitPolicy = {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

type RateLimitTarget = {
  scope: string
  identifier: string
  clientIp: string
}

export type RateLimitStatus = {
  limited: boolean
  retryAfterSeconds: number
}

function getStoreAdapter() {
  return getRateLimitStore()
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase() || 'anonymous'
}

function buildRateLimitKey(target: RateLimitTarget) {
  return createHash('sha256')
    .update(`${target.scope}:${normalizeIdentifier(target.identifier)}:${target.clientIp.trim() || 'unknown-ip'}`)
    .digest('hex')
}

function sanitizeEntry(entry: RateLimitEntry | undefined, policy: RateLimitPolicy, now: number): RateLimitEntry {
  const attempts = Array.isArray(entry?.attempts)
    ? entry.attempts.filter((timestamp) => Number.isFinite(timestamp) && timestamp > now - policy.windowMs)
    : []

  const blockedUntil = typeof entry?.blockedUntil === 'number' && entry.blockedUntil > now
    ? entry.blockedUntil
    : null

  return { attempts, blockedUntil }
}

function toStatus(entry: RateLimitEntry, now: number): RateLimitStatus {
  if (!entry.blockedUntil || entry.blockedUntil <= now) {
    return { limited: false, retryAfterSeconds: 0 }
  }

  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)),
  }
}

async function updateRateLimitEntry(
  target: RateLimitTarget,
  policy: RateLimitPolicy,
  updater: (entry: RateLimitEntry, now: number) => RateLimitEntry
) {
  const now = Date.now()
  const storeAdapter = getStoreAdapter()
  const store = await storeAdapter.read()
  const key = buildRateLimitKey(target)
  const current = sanitizeEntry(store[key], policy, now)
  const next = updater(current, now)

  if (next.attempts.length === 0 && !next.blockedUntil) {
    delete store[key]
  } else {
    store[key] = next
  }

  await storeAdapter.write(store)
  return toStatus(next, now)
}

export function getClientIpFromHeaders(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get('x-forwarded-for')
  if (forwardedFor) {
    const firstForwarded = forwardedFor.split(',')[0]?.trim()
    if (firstForwarded) {
      return firstForwarded
    }
  }

  const realIp = requestHeaders.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  return 'unknown-ip'
}

export async function getRateLimitStatus(target: RateLimitTarget, policy: RateLimitPolicy) {
  const now = Date.now()
  const storeAdapter = getStoreAdapter()
  const store = await storeAdapter.read()
  const key = buildRateLimitKey(target)
  const entry = sanitizeEntry(store[key], policy, now)

  if (
    (!store[key] && entry.attempts.length === 0 && !entry.blockedUntil) ||
    (store[key]?.blockedUntil === entry.blockedUntil && JSON.stringify(store[key]?.attempts || []) === JSON.stringify(entry.attempts))
  ) {
    return toStatus(entry, now)
  }

  if (entry.attempts.length === 0 && !entry.blockedUntil) {
    delete store[key]
  } else {
    store[key] = entry
  }

  await storeAdapter.write(store)
  return toStatus(entry, now)
}

export async function recordRateLimitFailure(target: RateLimitTarget, policy: RateLimitPolicy) {
  return updateRateLimitEntry(target, policy, (entry, now) => {
    const attempts = [...entry.attempts, now]
    const blockedUntil = attempts.length >= policy.maxAttempts
      ? now + policy.blockDurationMs
      : entry.blockedUntil

    return {
      attempts,
      blockedUntil,
    }
  })
}

export async function clearRateLimit(target: RateLimitTarget, policy: RateLimitPolicy) {
  return updateRateLimitEntry(target, policy, () => ({
    attempts: [],
    blockedUntil: null,
  }))
}