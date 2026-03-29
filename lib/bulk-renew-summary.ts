import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BULK_RENEW_SUMMARY_PATH = path.join(process.cwd(), 'data', 'bulk-renew-last-result.json')

export type BulkRenewStoredSummary = {
  id: string
  generatedAt: string
  successCount: number
  failedCount: number
  renewedIds: string[]
  failedIds: string[]
  extensionMonths: number
  rentAdjustment: number
}

type BulkRenewStoredSummaryInput = Omit<BulkRenewStoredSummary, 'id' | 'generatedAt'> & {
  id?: string
  generatedAt?: string
}

type BulkRenewSummaryFile = {
  latestResult: BulkRenewStoredSummary | null
  history: BulkRenewStoredSummary[]
}

function buildSummaryId() {
  return `bulk-renew-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeIds(value: string[]) {
  return Array.from(new Set(value.map((item) => item.trim()).filter(Boolean)))
}

function sanitizeSummary(input: BulkRenewStoredSummaryInput): BulkRenewStoredSummary {
  return {
    id: input.id || buildSummaryId(),
    generatedAt: input.generatedAt || new Date().toISOString(),
    successCount: Math.max(0, Number(input.successCount) || 0),
    failedCount: Math.max(0, Number(input.failedCount) || 0),
    renewedIds: normalizeIds(input.renewedIds),
    failedIds: normalizeIds(input.failedIds),
    extensionMonths: Math.max(1, Number(input.extensionMonths) || 12),
    rentAdjustment: Math.max(0, Number(input.rentAdjustment) || 0),
  }
}

async function ensureSummaryDirectory() {
  await mkdir(path.dirname(BULK_RENEW_SUMMARY_PATH), { recursive: true })
}

function isLegacySummaryShape(value: unknown): value is BulkRenewStoredSummaryInput {
  return Boolean(value && typeof value === 'object' && 'renewedIds' in value && 'failedIds' in value)
}

function sanitizeSummaryFile(value: unknown): BulkRenewSummaryFile {
  if (!value || typeof value !== 'object') {
    return { latestResult: null, history: [] }
  }

  if (isLegacySummaryShape(value)) {
    const legacy = sanitizeSummary(value)
    return {
      latestResult: legacy,
      history: [legacy],
    }
  }

  const record = value as { latestResult?: unknown; history?: unknown }
  const history = Array.isArray(record.history)
    ? record.history.filter((item) => isLegacySummaryShape(item)).map((item) => sanitizeSummary(item))
    : []
  const latestResult = record.latestResult && isLegacySummaryShape(record.latestResult)
    ? sanitizeSummary(record.latestResult)
    : (history[0] || null)

  return {
    latestResult,
    history,
  }
}

export async function readLastBulkRenewSummary() {
  try {
    const file = await readFile(BULK_RENEW_SUMMARY_PATH, 'utf8')
    return sanitizeSummaryFile(JSON.parse(file)).latestResult
  } catch {
    return null
  }
}

export async function readBulkRenewSummaryHistory() {
  try {
    const file = await readFile(BULK_RENEW_SUMMARY_PATH, 'utf8')
    return sanitizeSummaryFile(JSON.parse(file)).history
  } catch {
    return [] as BulkRenewStoredSummary[]
  }
}

export async function saveLastBulkRenewSummary(input: BulkRenewStoredSummaryInput) {
  const summary = sanitizeSummary(input)
  const currentHistory = await readBulkRenewSummaryHistory()
  const nextFile: BulkRenewSummaryFile = {
    latestResult: summary,
    history: [summary, ...currentHistory].slice(0, 50),
  }
  await ensureSummaryDirectory()
  await writeFile(BULK_RENEW_SUMMARY_PATH, `${JSON.stringify(nextFile, null, 2)}\n`, 'utf8')
  return summary
}