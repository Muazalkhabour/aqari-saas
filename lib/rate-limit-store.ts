import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getRateLimitStorageDriver, getRedisRateLimitConfig } from '@/lib/env'

export type RateLimitEntry = {
  attempts: number[]
  blockedUntil: number | null
}

export type RateLimitStoreAdapter = {
  kind: 'file' | 'redis'
  read(): Promise<Record<string, RateLimitEntry>>
  write(store: Record<string, RateLimitEntry>): Promise<void>
}

const RATE_LIMIT_STORAGE_PATH = path.join(process.cwd(), 'data', 'auth-rate-limits.json')

async function ensureRateLimitDirectory() {
  await mkdir(path.dirname(RATE_LIMIT_STORAGE_PATH), { recursive: true })
}

async function readRateLimitStore() {
  try {
    const file = await readFile(RATE_LIMIT_STORAGE_PATH, 'utf8')
    const parsed = JSON.parse(file) as Record<string, RateLimitEntry>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {} as Record<string, RateLimitEntry>
  }
}

async function writeRateLimitStore(store: Record<string, RateLimitEntry>) {
  await ensureRateLimitDirectory()
  await writeFile(RATE_LIMIT_STORAGE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

type RedisResponse<T> = {
  result?: T
  error?: string
}

async function sendRedisCommand<T>(command: Array<string>) {
  const config = getRedisRateLimitConfig()
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Rate limit Redis request failed with status ${response.status}.`)
  }

  const payload = await response.json() as RedisResponse<T>

  if (payload.error) {
    throw new Error(payload.error)
  }

  return payload.result ?? null
}

async function readRedisRateLimitStore() {
  const config = getRedisRateLimitConfig()
  const value = await sendRedisCommand<string>(['GET', config.key])

  if (!value) {
    return {} as Record<string, RateLimitEntry>
  }

  try {
    const parsed = JSON.parse(value) as Record<string, RateLimitEntry>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {} as Record<string, RateLimitEntry>
  }
}

async function writeRedisRateLimitStore(store: Record<string, RateLimitEntry>) {
  const config = getRedisRateLimitConfig()
  await sendRedisCommand(['SET', config.key, JSON.stringify(store)])
}

export function getRateLimitStore(): RateLimitStoreAdapter {
  if (getRateLimitStorageDriver() === 'redis') {
    return {
      kind: 'redis',
      read: readRedisRateLimitStore,
      write: writeRedisRateLimitStore,
    }
  }

  return {
    kind: 'file',
    read: readRateLimitStore,
    write: writeRateLimitStore,
  }
}