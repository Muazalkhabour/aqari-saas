import { redirect } from 'next/navigation'
import { getTenantSession } from '@/lib/tenant-session'

export const dynamic = 'force-dynamic'

type TenantLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function appendParam(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (typeof value === 'undefined') {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => params.append(key, item))
    return
  }

  params.set(key, value)
}

export default async function TenantLoginPage({ searchParams }: TenantLoginPageProps) {
  const session = await getTenantSession()

  if (session?.tenant?.id) {
    redirect('/tenant-portal')
  }

  const params = searchParams ? await searchParams : undefined
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params || {})) {
    appendParam(nextParams, key, value)
  }

  if (!nextParams.has('mode')) {
    nextParams.set('mode', 'signin')
  }

  if (!nextParams.has('role')) {
    nextParams.set('role', 'tenant')
  }

  redirect(`/auth?${nextParams.toString()}`)
}