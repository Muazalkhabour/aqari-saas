export const protectedPrefixes = [
  '/dashboard',
  '/maintenance',
  '/office',
  '/contracts',
  '/notifications',
]

export function isProtectedPathname(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
}