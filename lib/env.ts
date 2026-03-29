const placeholderFragments = [
  'your-project',
  'your-project-id',
  'your-anon-key',
  'password@',
  'xxxx',
]

function isConfiguredValue(value: string | undefined) {
  return Boolean(
    value && placeholderFragments.every((fragment) => !value.includes(fragment))
  )
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === 'development'
}

export function isDevelopmentDemoModeEnabled() {
  return isDevelopmentEnvironment()
}

export function hasSupabaseCredentials() {
  return (
    isConfiguredValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    isConfiguredValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isConfiguredValue(url) || !isConfiguredValue(anonKey)) {
    throw new Error('Supabase environment variables are missing or still using placeholder values.')
  }

  return { url: url as string, anonKey: anonKey as string }
}

export function hasEmailNotificationCredentials() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM_EMAIL
  )
}

export function getEmailNotificationCredentials() {
  if (!hasEmailNotificationCredentials()) {
    throw new Error('SMTP environment variables are missing.')
  }

  return {
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    fromEmail: process.env.SMTP_FROM_EMAIL as string,
    fromName: process.env.SMTP_FROM_NAME || 'Aqari SaaS',
  }
}

export function getTenantSessionSigningSecret() {
  const configuredSecret = process.env.TENANT_SESSION_SECRET

  if (configuredSecret && configuredSecret.trim().length >= 32) {
    return configuredSecret
  }

  if (isDevelopmentEnvironment()) {
    return 'aqari-dev-tenant-session-secret-unsafe-outside-development'
  }

  throw new Error('TENANT_SESSION_SECRET must be configured in non-development environments.')
}

export function getAllowedExternalLogoHosts() {
  return new Set(
    String(process.env.ALLOWED_EXTERNAL_LOGO_HOSTS || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function hasRedisRateLimitConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )
}

export function getRedisRateLimitConfig() {
  if (!hasRedisRateLimitConfig()) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required when RATE_LIMIT_STORAGE_DRIVER=redis.')
  }

  return {
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    key: process.env.AUTH_RATE_LIMIT_REDIS_KEY || 'aqari:auth-rate-limits',
  }
}

export function getRateLimitStorageDriver() {
  return String(process.env.RATE_LIMIT_STORAGE_DRIVER || 'file').trim().toLowerCase() === 'redis'
    ? 'redis'
    : 'file'
}