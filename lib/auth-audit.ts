import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const AUTH_AUDIT_LOG_PATH = path.join(process.cwd(), 'data', 'auth-login-audit.json')
const MAX_AUDIT_EVENTS = 500

export type AuthAuditScope = 'owner-login' | 'tenant-login'
export type AuthAuditOutcome = 'SUCCESS' | 'BLOCKED' | 'FAILURE'

export type AuthAuditEvent = {
  id: string
  scope: AuthAuditScope
  outcome: AuthAuditOutcome
  identifierHash: string
  identifierLabel: string
  clientIp: string
  reason: string
  retryAfterSeconds: number | null
  createdAt: string
}

type AuthAuditInput = {
  scope: AuthAuditScope
  outcome: AuthAuditOutcome
  identifier: string
  clientIp: string
  reason: string
  retryAfterSeconds?: number | null
}

function buildAuditId() {
  return `auth-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase() || 'anonymous'
}

function hashIdentifier(value: string) {
  return createHash('sha256').update(normalizeIdentifier(value)).digest('hex')
}

function maskIdentifier(value: string) {
  const normalized = normalizeIdentifier(value)

  if (normalized.includes('@')) {
    const [localPart, domain] = normalized.split('@', 2)
    const maskedLocal = localPart.length <= 2
      ? `${localPart[0] || '*'}*`
      : `${localPart.slice(0, 2)}***`
    return `${maskedLocal}@${domain}`
  }

  if (normalized.length <= 3) {
    return `${normalized[0] || '*'}**`
  }

  return `${normalized.slice(0, 3)}***`
}

async function ensureAuditDirectory() {
  await mkdir(path.dirname(AUTH_AUDIT_LOG_PATH), { recursive: true })
}

async function readAuditLog() {
  try {
    const file = await readFile(AUTH_AUDIT_LOG_PATH, 'utf8')
    const parsed = JSON.parse(file) as AuthAuditEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return [] as AuthAuditEvent[]
  }
}

async function writeAuditLog(events: AuthAuditEvent[]) {
  await ensureAuditDirectory()
  await writeFile(AUTH_AUDIT_LOG_PATH, `${JSON.stringify(events, null, 2)}\n`, 'utf8')
}

export async function recordAuthAuditEvent(input: AuthAuditInput) {
  const events = await readAuditLog()
  const event: AuthAuditEvent = {
    id: buildAuditId(),
    scope: input.scope,
    outcome: input.outcome,
    identifierHash: hashIdentifier(input.identifier),
    identifierLabel: maskIdentifier(input.identifier),
    clientIp: input.clientIp || 'unknown-ip',
    reason: input.reason,
    retryAfterSeconds: input.retryAfterSeconds ?? null,
    createdAt: new Date().toISOString(),
  }

  events.unshift(event)
  await writeAuditLog(events.slice(0, MAX_AUDIT_EVENTS))
  return event
}

export async function listRecentAuthAuditEvents(limit = 50) {
  const events = await readAuditLog()
  return events.slice(0, Math.max(1, limit))
}