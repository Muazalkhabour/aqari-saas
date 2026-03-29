import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib'
import { requireProtectedApiUser } from '@/lib/api-guard'
import { readLastBulkRenewSummary } from '@/lib/bulk-renew-summary'
import { getContractManagementData } from '@/lib/contract-management'
import { getAllowedExternalLogoHosts } from '@/lib/env'
import { getOfficeSettings } from '@/lib/office-settings'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function readIdList(value: string | null) {
  if (!value) {
    return [] as string[]
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function formatCurrency(value: number) {
  return `${value.toFixed(0)} USD`
}

async function loadSystemFont() {
  const candidateFonts = [
    'C:\\Windows\\Fonts\\majalla.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\ARIALUNI.TTF',
    'C:\\Windows\\Fonts\\DUBAI-REGULAR.TTF',
    'C:\\Windows\\Fonts\\trado.ttf',
  ]

  for (const fontPath of candidateFonts) {
    try {
      await access(fontPath)
      return await readFile(fontPath)
    } catch {
      continue
    }
  }

  return null
}

async function loadLogoAsset(logoUrl: string | null, requestUrl: string) {
  if (!logoUrl) {
    return null
  }

  const requestOrigin = new URL(requestUrl).origin

  if (logoUrl.startsWith('data:image/')) {
    const [meta, base64Payload] = logoUrl.split(',', 2)
    if (!meta || !base64Payload) {
      return null
    }

    const isPng = meta.includes('image/png')
    const isJpeg = meta.includes('image/jpeg') || meta.includes('image/jpg')

    if (!isPng && !isJpeg) {
      return null
    }

    return {
      bytes: Buffer.from(base64Payload, 'base64'),
      type: isPng ? 'png' as const : 'jpg' as const,
    }
  }

  if (logoUrl.startsWith('/')) {
    try {
      const sanitizedPath = logoUrl.split('?')[0].split('#')[0]
      const localPath = path.join(/* turbopackIgnore: true */ process.cwd(), 'public', sanitizedPath.replace(/^\/+/, '').replace(/\//g, path.sep))
      const bytes = await readFile(localPath)
      const lowerPath = sanitizedPath.toLowerCase()
      if (!lowerPath.endsWith('.png') && !lowerPath.endsWith('.jpg') && !lowerPath.endsWith('.jpeg')) {
        return null
      }

      return {
        bytes,
        type: lowerPath.endsWith('.png') ? 'png' as const : 'jpg' as const,
      }
    } catch {
      try {
        const origin = new URL(requestUrl).origin
        const response = await fetch(`${origin}${logoUrl}`, { cache: 'no-store' })
        if (!response.ok) {
          return null
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('image/png') && !contentType.includes('image/jpeg') && !contentType.includes('image/jpg')) {
          return null
        }

        return {
          bytes: Buffer.from(await response.arrayBuffer()),
          type: contentType.includes('png') ? 'png' as const : 'jpg' as const,
        }
      } catch {
        return null
      }
    }
  }

  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    try {
      const parsedUrl = new URL(logoUrl)
      const isSameOrigin = parsedUrl.origin === requestOrigin
      const allowedHosts = getAllowedExternalLogoHosts()

      if (!isSameOrigin && !allowedHosts.has(parsedUrl.hostname.toLowerCase())) {
        return null
      }

      const response = await fetch(logoUrl, { cache: 'no-store' })
      if (!response.ok) {
        return null
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('image/png') && !contentType.includes('image/jpeg') && !contentType.includes('image/jpg')) {
        return null
      }

      return {
        bytes: Buffer.from(await response.arrayBuffer()),
        type: contentType.includes('png') ? 'png' as const : 'jpg' as const,
      }
    } catch {
      return null
    }
  }

  return null
}

export async function GET(request: Request) {
  const guard = await requireProtectedApiUser()
  if (!guard.ok) {
    return guard.response
  }

  const { searchParams } = new URL(request.url)
  const persistedSummary = await readLastBulkRenewSummary()
  const renewedIds = readIdList(searchParams.get('renewed'))
  const failedIds = readIdList(searchParams.get('failedIds'))
  const effectiveRenewedIds = renewedIds.length > 0 ? renewedIds : (persistedSummary?.renewedIds || [])
  const effectiveFailedIds = failedIds.length > 0 ? failedIds : (persistedSummary?.failedIds || [])

  const data = await getContractManagementData()
  const office = await getOfficeSettings()
  const renewedContracts = data.contracts.filter((contract) => effectiveRenewedIds.includes(contract.id))
  const failedContracts = data.contracts.filter((contract) => effectiveFailedIds.includes(contract.id))

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)

  const fontBytes = await loadSystemFont()
  const logoAsset = await loadLogoAsset(office.logoUrl, request.url)
  const font = fontBytes ? await pdf.embedFont(fontBytes) : await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = fontBytes ? font : await pdf.embedFont(StandardFonts.HelveticaBold)
  const embeddedLogo = logoAsset
    ? logoAsset.type === 'png'
      ? await pdf.embedPng(logoAsset.bytes)
      : await pdf.embedJpg(logoAsset.bytes)
    : null

  let page = pdf.addPage([595.28, 841.89])
  let cursorY = 790
  const marginX = 40
  const lineHeight = 18

  const ensureSpace = (requiredHeight = lineHeight) => {
    if (cursorY - requiredHeight > 40) {
      return
    }

    page = pdf.addPage([595.28, 841.89])
    cursorY = 790
  }

  const drawLine = (text: string, options?: { size?: number; color?: ReturnType<typeof rgb>; fontOverride?: PDFFont; gapAfter?: number }) => {
    ensureSpace(options?.gapAfter ?? lineHeight)
    page.drawText(text, {
      x: marginX,
      y: cursorY,
      size: options?.size ?? 12,
      font: options?.fontOverride ?? font,
      color: options?.color ?? rgb(0.1, 0.16, 0.24),
      maxWidth: 510,
      lineHeight,
    })
    cursorY -= options?.gapAfter ?? lineHeight
  }

  const drawBox = (height: number, fillColor: ReturnType<typeof rgb>, borderColor: ReturnType<typeof rgb>) => {
    ensureSpace(height + 10)
    page.drawRectangle({
      x: marginX,
      y: cursorY - height + 6,
      width: 515,
      height,
      color: fillColor,
      borderColor,
      borderWidth: 1,
    })
  }

  const drawMetricBox = (label: string, value: string, tone: { fill: ReturnType<typeof rgb>; border: ReturnType<typeof rgb>; text: ReturnType<typeof rgb> }) => {
    drawBox(58, tone.fill, tone.border)
    drawLine(label, { size: 10, color: tone.text, fontOverride: boldFont, gapAfter: 16 })
    drawLine(value, { size: 16, color: rgb(0.1, 0.16, 0.24), fontOverride: boldFont, gapAfter: 28 })
  }

  const drawSection = (title: string, contracts: typeof renewedContracts, tone: ReturnType<typeof rgb>) => {
    drawLine(title, { size: 15, color: tone, fontOverride: boldFont, gapAfter: 24 })

    if (contracts.length === 0) {
      drawLine('No contracts in this section.', { gapAfter: 22 })
      return
    }

    contracts.forEach((contract, index) => {
      drawLine(`${index + 1}. ${contract.id} | ${contract.tenantName}`, { gapAfter: 18 })
      drawLine(`   ${contract.propertyTitle} / Unit ${contract.unitNumber} / End ${formatDate(contract.endDate)}`, { size: 11, gapAfter: 16 })
      drawLine(`   Rent ${formatCurrency(contract.rentAmount)} / Outstanding ${formatCurrency(contract.totalOutstanding)}`, { size: 11, color: rgb(0.3, 0.35, 0.42), gapAfter: 22 })
    })
  }

  if (embeddedLogo) {
    const logoDimensions = embeddedLogo.scaleToFit(64, 64)
    page.drawRectangle({
      x: marginX,
      y: cursorY - 10,
      width: 78,
      height: 78,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.88, 0.91, 0.94),
      borderWidth: 1,
    })
    page.drawImage(embeddedLogo, {
      x: marginX + (78 - logoDimensions.width) / 2,
      y: cursorY - 10 + (78 - logoDimensions.height) / 2,
      width: logoDimensions.width,
      height: logoDimensions.height,
    })
    page.drawText(office.name || 'Aqari Office', {
      x: marginX + 94,
      y: cursorY + 44,
      size: 22,
      font: boldFont,
      color: rgb(0.06, 0.17, 0.29),
      maxWidth: 420,
      lineHeight,
    })
    page.drawText('Bulk Renewal Summary | ملخص آخر تجديد جماعي', {
      x: marginX + 94,
      y: cursorY + 18,
      size: 14,
      font: boldFont,
      color: rgb(0.21, 0.32, 0.43),
      maxWidth: 420,
      lineHeight,
    })
    cursorY -= 62
  } else {
    drawLine(office.name || 'Aqari Office', {
      size: 22,
      fontOverride: boldFont,
      color: rgb(0.06, 0.17, 0.29),
      gapAfter: 20,
    })
    drawLine('Bulk Renewal Summary | ملخص آخر تجديد جماعي', {
      size: 14,
      fontOverride: boldFont,
      color: rgb(0.21, 0.32, 0.43),
      gapAfter: 18,
    })
  }
  drawLine(`Generated at: ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(persistedSummary?.generatedAt || Date.now()))}`, {
    size: 11,
    color: rgb(0.35, 0.4, 0.48),
    gapAfter: 14,
  })
  drawLine(`Office phone: ${office.phone || 'N/A'} | Office email: ${office.email || 'N/A'}`, {
    size: 10,
    color: rgb(0.35, 0.4, 0.48),
    gapAfter: 24,
  })

  drawMetricBox('Renewed Contracts', String(renewedContracts.length), {
    fill: rgb(0.92, 0.98, 0.94),
    border: rgb(0.68, 0.86, 0.75),
    text: rgb(0.08, 0.46, 0.24),
  })
  drawMetricBox('Failed Contracts', String(failedContracts.length), {
    fill: rgb(0.99, 0.96, 0.89),
    border: rgb(0.92, 0.8, 0.49),
    text: rgb(0.72, 0.45, 0.07),
  })
  drawMetricBox('Extension Plan', `${persistedSummary?.extensionMonths || 0} months`, {
    fill: rgb(0.93, 0.96, 0.99),
    border: rgb(0.72, 0.82, 0.94),
    text: rgb(0.11, 0.3, 0.6),
  })
  drawMetricBox('Rent Adjustment', `${formatCurrency(persistedSummary?.rentAdjustment || 0)}`, {
    fill: rgb(0.96, 0.95, 0.99),
    border: rgb(0.83, 0.79, 0.94),
    text: rgb(0.38, 0.24, 0.66),
  })
  cursorY -= 8

  drawSection('Renewed Contracts', renewedContracts, rgb(0.08, 0.46, 0.24))
  cursorY -= 12
  drawSection('Failed Contracts', failedContracts, rgb(0.72, 0.45, 0.07))

  const pdfBytes = await pdf.save()

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="bulk-renew-summary.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}