import { NextResponse } from 'next/server'
import { getAuthenticatedSupabaseUser } from '@/lib/supabase-server'
import { hasSupabaseCredentials, isDevelopmentDemoModeEnabled } from '@/lib/env'
import { getTenantSession } from '@/lib/tenant-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [officeUser, tenantSession] = await Promise.all([
    getAuthenticatedSupabaseUser(),
    getTenantSession(),
  ])

  return NextResponse.json({
    officeAuthenticated: Boolean(officeUser?.id),
    officeEmail: officeUser?.email || null,
    tenantAuthenticated: Boolean(tenantSession?.tenant?.id),
    tenantName: tenantSession?.tenant?.fullName || null,
    tenantId: tenantSession?.tenant?.id || null,
    demoAvailable: isDevelopmentDemoModeEnabled(),
    hasOfficeAuthProvider: hasSupabaseCredentials(),
  })
}