import { redirect } from 'next/navigation'
import type { OwnerAccount } from '@prisma/client'
import { prisma } from '@/prisma'
import { getAuthenticatedSupabaseUser } from '@/lib/supabase-server'

function fallbackNameFromEmail(email: string) {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ') || 'مالك العقار'
}

export async function ensureOwnerAccount() {
  const user = await getAuthenticatedSupabaseUser()
  if (!user?.email) {
    return null
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const fullName = typeof metadata?.full_name === 'string'
    ? metadata.full_name
    : typeof metadata?.name === 'string'
      ? metadata.name
      : fallbackNameFromEmail(user.email)

  const phone = typeof metadata?.phone === 'string' ? metadata.phone : null
  const city = typeof metadata?.city === 'string' ? metadata.city : null

  return prisma.ownerAccount.upsert({
    where: { authId: user.id },
    update: {
      email: user.email,
      fullName,
      phone,
      city,
    },
    create: {
      authId: user.id,
      email: user.email,
      fullName,
      phone,
      city,
    },
  })
}

export async function requireOwnerAccount(): Promise<OwnerAccount> {
  const owner = await ensureOwnerAccount()
  if (!owner) {
    redirect('/login?error=auth-required')
  }

  return owner
}