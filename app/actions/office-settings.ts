'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { saveOfficeSettings } from '@/lib/office-settings'

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

export async function saveOfficeSettingsAction(formData: FormData) {
  await saveOfficeSettings({
    name: readText(formData, 'name'),
    email: readText(formData, 'email') || null,
    phone: readText(formData, 'phone') || null,
    whatsappNumber: readText(formData, 'whatsappNumber') || null,
    address: readText(formData, 'address') || null,
    logoUrl: readText(formData, 'logoUrl') || null,
    managerName: readText(formData, 'managerName') || null,
    signatureName: readText(formData, 'signatureName') || null,
    sealLabel: readText(formData, 'sealLabel') || null,
  })

  revalidatePath('/office')
  revalidatePath('/dashboard')
  revalidatePath('/contracts')
  revalidatePath('/contracts/contract-rima/print')
  redirect('/office?success=saved')
}