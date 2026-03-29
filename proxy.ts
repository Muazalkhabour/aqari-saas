import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseCredentials, hasSupabaseCredentials, isDevelopmentDemoModeEnabled } from '@/lib/env'
import { isProtectedPathname } from '@/lib/protected-routes'

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const isProtectedPath = isProtectedPathname(request.nextUrl.pathname)
  const canUseDevelopmentDemo = isDevelopmentDemoModeEnabled() && request.nextUrl.searchParams.get('mode') === 'demo'

  if (!isDevelopmentDemoModeEnabled() && request.nextUrl.searchParams.get('mode') === 'demo') {
    const sanitizedUrl = request.nextUrl.clone()
    sanitizedUrl.searchParams.delete('mode')
    return NextResponse.redirect(sanitizedUrl)
  }

  if (!hasSupabaseCredentials()) {
    if (isProtectedPath) {
      if (canUseDevelopmentDemo) {
        return response
      }

      return NextResponse.redirect(new URL('/login?error=auth-unavailable', request.url))
    }

    return response
  }

  const credentials = getSupabaseCredentials()

  const supabase = createServerClient(
    credentials.url,
    credentials.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach((cookie) => request.cookies.set(cookie.name, cookie.value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, cookie.options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedPath) {
    if (canUseDevelopmentDemo) {
      return response
    }

    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}