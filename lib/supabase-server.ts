import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseCredentials, hasSupabaseCredentials } from '@/lib/env'

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials()) {
    return null
  }

  const cookieStore = await cookies()
  const credentials = getSupabaseCredentials()

  return createServerClient(credentials.url, credentials.anonKey, {
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
  })
}

export async function getAuthenticatedSupabaseUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
}