import { redirect } from 'next/navigation'

type LoginPageProps = {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params || {})) {
    appendParam(nextParams, key, value)
  }

  if (!nextParams.has('mode')) {
    nextParams.set('mode', 'signin')
  }

  if (!nextParams.has('role')) {
    nextParams.set('role', 'manager')
  }

  redirect(`/auth?${nextParams.toString()}`)
}
