import { NextResponse } from 'next/server'
import { getAuthenticatedSupabaseUser } from '@/lib/supabase-server'
import { hasSupabaseCredentials } from '@/lib/env'

export type ProtectedApiGuardResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedSupabaseUser>>> }
  | { ok: false; response: NextResponse }

export async function requireProtectedApiUser(): Promise<ProtectedApiGuardResult> {
  if (!hasSupabaseCredentials()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Office authentication is not configured.' },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      ),
    }
  }

  const user = await getAuthenticatedSupabaseUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      ),
    }
  }

  return { ok: true, user }
}