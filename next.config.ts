import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url))

const baseSecurityHeaders: Array<{ key: string; value: string }> = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-site',
  },
  {
    key: 'Origin-Agent-Cluster',
    value: '?1',
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: workspaceRoot,
  },
  async headers() {
    const headers = [...baseSecurityHeaders]

    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      })
    }

    return [
      {
        source: '/:path*',
        headers,
      },
    ]
  },
}

export default nextConfig
