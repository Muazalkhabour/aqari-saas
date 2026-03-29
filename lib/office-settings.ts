import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '@/prisma'
import { ensureRentalSeedData } from '@/lib/rental-db'

const OFFICE_SETTINGS_PATH = path.join(process.cwd(), 'data', 'office-settings.json')
const AGENCY_ID = 'agency-demo-main'

export type OfficeSettings = {
  id: string
  name: string
  email: string | null
  phone: string | null
  whatsappNumber: string | null
  address: string | null
  logoUrl: string | null
  managerName: string | null
  signatureName: string | null
  sealLabel: string | null
  dataSource: 'database' | 'fallback'
}

type OfficeSettingsInput = Omit<OfficeSettings, 'id' | 'dataSource'>

const defaultOfficeSettings: OfficeSettingsInput = {
  name: 'مكتب عقاري تجريبي',
  email: 'office@aqari-demo.sy',
  phone: '+963 944 555 200',
  whatsappNumber: '+963 944 555 200',
  address: 'دمشق - المزة',
  logoUrl: null,
  managerName: 'معاذ الشمطي',
  signatureName: 'معاذ الشمطي',
  sealLabel: 'ختم المكتب العقاري',
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized ? normalized : null
}

function sanitizeSettings(input: Partial<OfficeSettingsInput>): OfficeSettingsInput {
  return {
    name: normalizeString(input.name) || defaultOfficeSettings.name,
    email: normalizeString(input.email) || null,
    phone: normalizeString(input.phone) || null,
    whatsappNumber: normalizeString(input.whatsappNumber) || null,
    address: normalizeString(input.address) || null,
    logoUrl: normalizeString(input.logoUrl) || null,
    managerName: normalizeString(input.managerName) || null,
    signatureName: normalizeString(input.signatureName) || null,
    sealLabel: normalizeString(input.sealLabel) || null,
  }
}

async function ensureFallbackDirectory() {
  await mkdir(path.dirname(OFFICE_SETTINGS_PATH), { recursive: true })
}

async function readFallbackSettings(): Promise<OfficeSettings> {
  try {
    const file = await readFile(OFFICE_SETTINGS_PATH, 'utf8')
    const parsed = JSON.parse(file) as Partial<OfficeSettingsInput>
    return {
      id: AGENCY_ID,
      ...sanitizeSettings(parsed),
      dataSource: 'fallback',
    }
  } catch {
    return {
      id: AGENCY_ID,
      ...defaultOfficeSettings,
      dataSource: 'fallback',
    }
  }
}

async function writeFallbackSettings(input: OfficeSettingsInput) {
  await ensureFallbackDirectory()
  await writeFile(OFFICE_SETTINGS_PATH, `${JSON.stringify(sanitizeSettings(input), null, 2)}\n`, 'utf8')
}

export async function getOfficeSettings(): Promise<OfficeSettings> {
  try {
    await ensureRentalSeedData()

    const agency = await prisma.agency.findUnique({
      where: { id: AGENCY_ID },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
      },
    })

    if (!agency) {
      return readFallbackSettings()
    }

    const fallback = await readFallbackSettings()

    return {
      id: agency.id,
      name: agency.name,
      email: agency.email,
      phone: agency.phone,
      address: agency.address,
      logoUrl: agency.logoUrl,
      whatsappNumber: fallback.whatsappNumber,
      managerName: fallback.managerName,
      signatureName: fallback.signatureName,
      sealLabel: fallback.sealLabel,
      dataSource: 'database',
    }
  } catch {
    return readFallbackSettings()
  }
}

export async function saveOfficeSettings(input: Partial<OfficeSettingsInput>) {
  const settings = sanitizeSettings(input)

  try {
    await ensureRentalSeedData()

    await prisma.agency.upsert({
      where: { id: AGENCY_ID },
      update: {
        name: settings.name,
        email: settings.email || 'office@aqari-demo.sy',
        phone: settings.phone,
        address: settings.address,
        logoUrl: settings.logoUrl,
      },
      create: {
        id: AGENCY_ID,
        name: settings.name,
        email: settings.email || 'office@aqari-demo.sy',
        phone: settings.phone,
        address: settings.address,
        logoUrl: settings.logoUrl,
      },
    })
  } catch {
    // استمرار الحفظ محلياً عند تعطل قاعدة البيانات.
  }

  await writeFallbackSettings(settings)

  return {
    id: AGENCY_ID,
    ...settings,
    dataSource: 'fallback' as const,
  }
}