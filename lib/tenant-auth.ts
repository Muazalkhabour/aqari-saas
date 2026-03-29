import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)

export async function hashSecret(secret: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scrypt(secret, salt, 64) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifySecret(secret: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')
  if (!salt || !hash) {
    return false
  }

  const derivedKey = await scrypt(secret, salt, 64) as Buffer
  const storedBuffer = Buffer.from(hash, 'hex')

  if (storedBuffer.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(storedBuffer, derivedKey)
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}