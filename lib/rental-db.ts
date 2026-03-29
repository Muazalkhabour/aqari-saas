import { prisma } from '@/prisma'
import { isDevelopmentDemoModeEnabled } from '@/lib/env'
import { hashSecret } from '@/lib/tenant-auth'
import { sendEmailNotification } from '@/lib/notifications'

let demoPasswordHashPromise: Promise<string> | null = null

const DEMO_IDS = {
  agency: 'agency-demo-main',
  propertyDamascus: 'property-damascus-mezzeh',
  propertyLatakia: 'property-latakia-ziraa',
  propertyAleppo: 'property-aleppo-hamdaniyeh',
  unitDamascus: 'unit-damascus-b12',
  unitLatakia: 'unit-latakia-sea5',
  unitAleppo: 'unit-aleppo-a3',
  tenantRima: 'tenant-rima-khalil',
  tenantSamer: 'tenant-samer-hallaq',
  tenantLina: 'tenant-lina-younes',
  contractRima: 'contract-rima',
  contractSamer: 'contract-samer',
  contractLina: 'contract-lina',
  paymentRimaOverdue: 'payment-rima-overdue',
  paymentRimaDue: 'payment-rima-due',
  paymentSamerDue: 'payment-samer-due',
  paymentSamerPaid: 'payment-samer-paid',
  paymentLinaDue: 'payment-lina-due',
  maintenanceRima: 'maintenance-rima',
  maintenanceSamer: 'maintenance-samer',
} as const

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function asNumber(value: unknown) {
  return Number(value)
}

function getDemoCredentials() {
  return [
    { tenantId: DEMO_IDS.tenantRima, fullName: 'ريما خليل', email: 'rima@tenant.aqari.sy', password: 'Tenant@12345' },
    { tenantId: DEMO_IDS.tenantSamer, fullName: 'سامر حلاق', email: 'samer@tenant.aqari.sy', password: 'Tenant@12345' },
    { tenantId: DEMO_IDS.tenantLina, fullName: 'لينا يونس', email: 'lina@tenant.aqari.sy', password: 'Tenant@12345' },
  ]
}

async function getDemoPasswordHash() {
  if (!demoPasswordHashPromise) {
    demoPasswordHashPromise = hashSecret('Tenant@12345')
  }

  return demoPasswordHashPromise
}

function buildDemoProperty(propertyId: string) {
  switch (propertyId) {
    case DEMO_IDS.propertyDamascus:
      return { id: DEMO_IDS.propertyDamascus, title: 'شقة عائلية في المزة الغربية' }
    case DEMO_IDS.propertyLatakia:
      return { id: DEMO_IDS.propertyLatakia, title: 'شقة مفروشة في مشروع الزراعة' }
    default:
      return { id: DEMO_IDS.propertyAleppo, title: 'شقة للإيجار في الحمدانية' }
  }
}

function buildDemoTenantPortalData(tenantId: string) {
  const tenants = {
    [DEMO_IDS.tenantRima]: {
      id: DEMO_IDS.tenantRima,
      fullName: 'ريما خليل',
      portalEmail: 'rima@tenant.aqari.sy',
      contracts: [
        {
          id: DEMO_IDS.contractRima,
          startDate: daysFromNow(-290),
          endDate: daysFromNow(9),
          rentAmount: 420,
          isActive: true,
          unit: {
            propertyId: DEMO_IDS.propertyDamascus,
            property: buildDemoProperty(DEMO_IDS.propertyDamascus),
          },
        },
      ],
      payments: [
        {
          id: DEMO_IDS.paymentRimaOverdue,
          amount: 420,
          dueDate: daysFromNow(-4),
          status: 'OVERDUE',
          notes: 'بدل إيجار مارس 2026',
          property: buildDemoProperty(DEMO_IDS.propertyDamascus),
        },
        {
          id: DEMO_IDS.paymentRimaDue,
          amount: 420,
          dueDate: daysFromNow(2),
          status: 'PENDING',
          notes: 'بدل إيجار أبريل 2026',
          property: buildDemoProperty(DEMO_IDS.propertyDamascus),
        },
      ],
      maintenanceRequests: [
        {
          id: DEMO_IDS.maintenanceRima,
          title: 'تسرب خفيف في المطبخ',
          description: 'يوجد تسرب بسيط تحت المغسلة ويحتاج زيارة فني هذا الأسبوع.',
          status: 'NEW',
          createdAt: daysFromNow(-1),
        },
      ],
    },
    [DEMO_IDS.tenantSamer]: {
      id: DEMO_IDS.tenantSamer,
      fullName: 'سامر حلاق',
      portalEmail: 'samer@tenant.aqari.sy',
      contracts: [
        {
          id: DEMO_IDS.contractSamer,
          startDate: daysFromNow(-120),
          endDate: daysFromNow(44),
          rentAmount: 320,
          isActive: true,
          unit: {
            propertyId: DEMO_IDS.propertyLatakia,
            property: buildDemoProperty(DEMO_IDS.propertyLatakia),
          },
        },
      ],
      payments: [
        {
          id: DEMO_IDS.paymentSamerPaid,
          amount: 320,
          dueDate: daysFromNow(-24),
          status: 'PAID',
          notes: 'بدل إيجار مارس 2026',
          property: buildDemoProperty(DEMO_IDS.propertyLatakia),
        },
        {
          id: DEMO_IDS.paymentSamerDue,
          amount: 320,
          dueDate: daysFromNow(5),
          status: 'PENDING',
          notes: 'بدل إيجار أبريل 2026',
          property: buildDemoProperty(DEMO_IDS.propertyLatakia),
        },
      ],
      maintenanceRequests: [
        {
          id: DEMO_IDS.maintenanceSamer,
          title: 'فحص المكيف',
          description: 'المكيف يعمل لكن التبريد أضعف من المعتاد في الصالون.',
          status: 'SCHEDULED',
          createdAt: daysFromNow(-3),
        },
      ],
    },
    [DEMO_IDS.tenantLina]: {
      id: DEMO_IDS.tenantLina,
      fullName: 'لينا يونس',
      portalEmail: 'lina@tenant.aqari.sy',
      contracts: [
        {
          id: DEMO_IDS.contractLina,
          startDate: daysFromNow(-70),
          endDate: daysFromNow(112),
          rentAmount: 185,
          isActive: true,
          unit: {
            propertyId: DEMO_IDS.propertyAleppo,
            property: buildDemoProperty(DEMO_IDS.propertyAleppo),
          },
        },
      ],
      payments: [
        {
          id: DEMO_IDS.paymentLinaDue,
          amount: 185,
          dueDate: daysFromNow(1),
          status: 'PENDING',
          notes: 'بدل إيجار أبريل 2026',
          property: buildDemoProperty(DEMO_IDS.propertyAleppo),
        },
      ],
      maintenanceRequests: [],
    },
  } as const

  return tenants[tenantId as keyof typeof tenants] ?? null
}

function buildFallbackOperationsDashboardData() {
  const contracts = [
    {
      id: DEMO_IDS.contractRima,
      tenantId: DEMO_IDS.tenantRima,
      endDate: daysFromNow(9),
      tenant: { fullName: 'ريما خليل', portalEmail: 'rima@tenant.aqari.sy' },
      unit: { unitNumber: 'B-12', property: buildDemoProperty(DEMO_IDS.propertyDamascus) },
    },
  ]

  const payments = [
    {
      id: DEMO_IDS.paymentRimaOverdue,
      tenantId: DEMO_IDS.tenantRima,
      contractId: DEMO_IDS.contractRima,
      dueDate: daysFromNow(-4),
      amount: 420,
      status: 'OVERDUE',
      notes: 'بدل إيجار مارس 2026',
      tenant: { fullName: 'ريما خليل', portalEmail: 'rima@tenant.aqari.sy' },
      property: buildDemoProperty(DEMO_IDS.propertyDamascus),
    },
    {
      id: DEMO_IDS.paymentLinaDue,
      tenantId: DEMO_IDS.tenantLina,
      contractId: DEMO_IDS.contractLina,
      dueDate: daysFromNow(1),
      amount: 185,
      status: 'PENDING',
      notes: 'بدل إيجار أبريل 2026',
      tenant: { fullName: 'لينا يونس', portalEmail: 'lina@tenant.aqari.sy' },
      property: buildDemoProperty(DEMO_IDS.propertyAleppo),
    },
  ]

  const maintenanceRequests = [
    {
      id: DEMO_IDS.maintenanceRima,
      status: 'NEW',
      priority: 'URGENT',
      createdAt: daysFromNow(-1),
      title: 'تسرب خفيف في المطبخ',
      tenant: { fullName: 'ريما خليل' },
      property: buildDemoProperty(DEMO_IDS.propertyDamascus),
    },
  ]

  const notifications = [
    {
      id: `contract-${DEMO_IDS.contractRima}`,
      type: 'contract-expiry',
      severity: 'medium',
      title: 'العقد يقترب من النهاية: ريما خليل',
      description: 'شقة عائلية في المزة الغربية - الوحدة B-12',
      dueDate: daysFromNow(9),
      tenantName: 'ريما خليل',
      contractId: DEMO_IDS.contractRima,
      paymentId: null,
      maintenanceRequestId: null,
    },
    {
      id: `payment-${DEMO_IDS.paymentRimaOverdue}`,
      type: 'payment-overdue',
      severity: 'high',
      title: 'دفعة متأخرة: ريما خليل',
      description: 'بدل إيجار مارس 2026 - 420 دولار',
      dueDate: daysFromNow(-4),
      tenantName: 'ريما خليل',
      contractId: DEMO_IDS.contractRima,
      paymentId: DEMO_IDS.paymentRimaOverdue,
      maintenanceRequestId: null,
    },
  ]

  return {
    agencyId: DEMO_IDS.agency,
    contracts,
    payments,
    maintenanceRequests,
    notificationLogs: [
      {
        id: 'notification-log-contract-rima',
        channel: 'EMAIL',
        status: 'SKIPPED',
        template: 'contract-expiry-reminder',
        recipient: 'rima@tenant.aqari.sy',
        subject: 'تذكير بقرب انتهاء عقد الإيجار',
        bodyPreview: 'تم تجهيز تذكير لعقد ريما خليل مع إمكانية فتح العقد بفلتر جاهز.',
        errorMessage: 'تم تجاوز الإرسال لأن SMTP غير مفعل حالياً.',
        sentAt: null,
        createdAt: daysFromNow(-1),
        agencyId: DEMO_IDS.agency,
        tenantId: DEMO_IDS.tenantRima,
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        contractId: DEMO_IDS.contractRima,
        paymentId: null,
        maintenanceRequestId: null,
      },
      {
        id: 'notification-log-payment-rima',
        channel: 'EMAIL',
        status: 'FAILED',
        template: 'payment-overdue-reminder',
        recipient: 'rima@tenant.aqari.sy',
        subject: 'تنبيه دفعة متأخرة',
        bodyPreview: 'تم تجهيز تنبيه للدفعة المتأخرة مع إمكانية فتح المتأخرات الخاصة بريما مباشرة.',
        errorMessage: 'فشل الإرسال بسبب عدم توفر خدمة البريد الحالية.',
        sentAt: null,
        createdAt: daysFromNow(-2),
        agencyId: DEMO_IDS.agency,
        tenantId: DEMO_IDS.tenantRima,
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        contractId: DEMO_IDS.contractRima,
        paymentId: DEMO_IDS.paymentRimaOverdue,
        maintenanceRequestId: null,
      },
    ],
    notifications,
    demoCredentials: getDemoCredentials().map(({ fullName, email, password }) => ({ fullName, email, password })),
    dataSource: 'fallback' as const,
  }
}

function buildFallbackMaintenanceDashboardData() {
  return {
    agency: {
      id: DEMO_IDS.agency,
      name: 'مكتب عقاري تجريبي',
      email: 'office@aqari-demo.sy',
      phone: '+963 944 555 200',
      address: 'دمشق - المزة',
    },
    maintenanceRequests: [
      {
        id: DEMO_IDS.maintenanceRima,
        title: 'تسرب خفيف في المطبخ',
        description: 'يوجد تسرب بسيط تحت المغسلة ويحتاج زيارة فني هذا الأسبوع.',
        priority: 'URGENT',
        status: 'NEW',
        createdAt: daysFromNow(-1),
        scheduledFor: null,
        contract: { id: DEMO_IDS.contractRima },
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        property: buildDemoProperty(DEMO_IDS.propertyDamascus),
      },
      {
        id: DEMO_IDS.maintenanceSamer,
        title: 'فحص المكيف',
        description: 'المكيف يعمل لكن التبريد أضعف من المعتاد في الصالون.',
        priority: 'NORMAL',
        status: 'SCHEDULED',
        createdAt: daysFromNow(-3),
        scheduledFor: daysFromNow(1),
        contract: { id: DEMO_IDS.contractSamer },
        tenant: { id: DEMO_IDS.tenantSamer, fullName: 'سامر حلاق' },
        property: buildDemoProperty(DEMO_IDS.propertyLatakia),
      },
    ],
    recentPayments: [
      {
        id: DEMO_IDS.paymentRimaOverdue,
        amount: 420,
        dueDate: daysFromNow(-4),
        status: 'OVERDUE',
        notes: 'بدل إيجار مارس 2026',
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        property: buildDemoProperty(DEMO_IDS.propertyDamascus),
      },
      {
        id: DEMO_IDS.paymentLinaDue,
        amount: 185,
        dueDate: daysFromNow(1),
        status: 'PENDING',
        notes: 'بدل إيجار أبريل 2026',
        tenant: { id: DEMO_IDS.tenantLina, fullName: 'لينا يونس' },
        property: buildDemoProperty(DEMO_IDS.propertyAleppo),
      },
      {
        id: DEMO_IDS.paymentSamerPaid,
        amount: 320,
        dueDate: daysFromNow(-24),
        status: 'PAID',
        notes: 'بدل إيجار مارس 2026',
        tenant: { id: DEMO_IDS.tenantSamer, fullName: 'سامر حلاق' },
        property: buildDemoProperty(DEMO_IDS.propertyLatakia),
      },
    ],
    notificationLogs: [
      {
        id: 'notification-log-contract-rima',
        channel: 'EMAIL',
        status: 'SKIPPED',
        template: 'contract-expiry-reminder',
        recipient: 'rima@tenant.aqari.sy',
        subject: 'تذكير بقرب انتهاء عقد الإيجار',
        bodyPreview: 'تم تجهيز تذكير لعقد ريما خليل مع رابط مباشر إلى العقد المرتبط.',
        errorMessage: 'تم تجاوز الإرسال لأن SMTP غير مفعل حالياً.',
        sentAt: null,
        createdAt: daysFromNow(-1),
        agencyId: DEMO_IDS.agency,
        tenantId: DEMO_IDS.tenantRima,
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        contractId: DEMO_IDS.contractRima,
        paymentId: null,
        maintenanceRequestId: null,
      },
      {
        id: 'notification-log-payment-rima',
        channel: 'EMAIL',
        status: 'FAILED',
        template: 'payment-overdue-reminder',
        recipient: 'rima@tenant.aqari.sy',
        subject: 'تنبيه دفعة متأخرة',
        bodyPreview: 'تم تجهيز تنبيه للدفعة المتأخرة الخاصة بريما خليل مع رابط مباشر إلى بطاقة الدفعة.',
        errorMessage: 'فشل الإرسال بسبب عدم توفر خدمة البريد الحالية.',
        sentAt: null,
        createdAt: daysFromNow(-2),
        agencyId: DEMO_IDS.agency,
        tenantId: DEMO_IDS.tenantRima,
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        contractId: DEMO_IDS.contractRima,
        paymentId: DEMO_IDS.paymentRimaOverdue,
        maintenanceRequestId: null,
      },
      {
        id: 'notification-log-maintenance-rima',
        channel: 'EMAIL',
        status: 'PENDING',
        template: 'maintenance-request-created',
        recipient: 'office@aqari-demo.sy',
        subject: 'طلب صيانة جديد من بوابة المستأجر',
        bodyPreview: 'هناك طلب صيانة جديد مرتبط بعقد ريما خليل ويمكن فتحه مباشرة من السجل.',
        errorMessage: null,
        sentAt: null,
        createdAt: daysFromNow(0),
        agencyId: DEMO_IDS.agency,
        tenantId: DEMO_IDS.tenantRima,
        tenant: { id: DEMO_IDS.tenantRima, fullName: 'ريما خليل' },
        contractId: DEMO_IDS.contractRima,
        paymentId: null,
        maintenanceRequestId: DEMO_IDS.maintenanceRima,
      },
    ],
    dataSource: 'fallback' as const,
  }
}

export async function ensureRentalSeedData() {
  const existingAgency = await prisma.agency.findUnique({
    where: { id: DEMO_IDS.agency },
  })

  const passwordHash = existingAgency ? null : await hashSecret('Tenant@12345')

  await prisma.agency.upsert({
    where: { id: DEMO_IDS.agency },
    update: {
      name: 'مكتب عقاري تجريبي',
      email: 'office@aqari-demo.sy',
      phone: '+963 944 555 200',
      address: 'دمشق - المزة',
    },
    create: {
      id: DEMO_IDS.agency,
      name: 'مكتب عقاري تجريبي',
      email: 'office@aqari-demo.sy',
      phone: '+963 944 555 200',
      address: 'دمشق - المزة',
    },
  })

  await prisma.property.upsert({
    where: { id: DEMO_IDS.propertyDamascus },
    update: {
      title: 'شقة عائلية في المزة الغربية',
      address: 'دمشق - المزة الغربية',
      type: 'سكني',
      description: 'وحدة مؤجرة ضمن نموذج تشغيل عقاري فعلي.',
      images: ['/listings/interior-luxury-1.svg'],
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.propertyDamascus,
      title: 'شقة عائلية في المزة الغربية',
      address: 'دمشق - المزة الغربية',
      type: 'سكني',
      description: 'وحدة مؤجرة ضمن نموذج تشغيل عقاري فعلي.',
      images: ['/listings/interior-luxury-1.svg'],
      agencyId: DEMO_IDS.agency,
    },
  })

  await prisma.property.upsert({
    where: { id: DEMO_IDS.propertyLatakia },
    update: {
      title: 'شقة مفروشة في مشروع الزراعة',
      address: 'اللاذقية - مشروع الزراعة',
      type: 'سكني',
      description: 'وحدة إيجارية للمغتربين والعقود السنوية.',
      images: ['/listings/interior-luxury-3.svg'],
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.propertyLatakia,
      title: 'شقة مفروشة في مشروع الزراعة',
      address: 'اللاذقية - مشروع الزراعة',
      type: 'سكني',
      description: 'وحدة إيجارية للمغتربين والعقود السنوية.',
      images: ['/listings/interior-luxury-3.svg'],
      agencyId: DEMO_IDS.agency,
    },
  })

  await prisma.property.upsert({
    where: { id: DEMO_IDS.propertyAleppo },
    update: {
      title: 'شقة للإيجار في الحمدانية',
      address: 'حلب - الحمدانية السادسة',
      type: 'سكني',
      description: 'وحدة مؤجرة لعائلة ضمن متابعة شهرية.',
      images: ['/listings/interior-luxury-6.svg'],
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.propertyAleppo,
      title: 'شقة للإيجار في الحمدانية',
      address: 'حلب - الحمدانية السادسة',
      type: 'سكني',
      description: 'وحدة مؤجرة لعائلة ضمن متابعة شهرية.',
      images: ['/listings/interior-luxury-6.svg'],
      agencyId: DEMO_IDS.agency,
    },
  })

  await prisma.unit.upsert({
    where: { id: DEMO_IDS.unitDamascus },
    update: {
      unitNumber: 'B-12',
      floor: 4,
      rooms: 3,
      areaSqM: 135,
      basePrice: 420,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyDamascus,
    },
    create: {
      id: DEMO_IDS.unitDamascus,
      unitNumber: 'B-12',
      floor: 4,
      rooms: 3,
      areaSqM: 135,
      basePrice: 420,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyDamascus,
    },
  })

  await prisma.unit.upsert({
    where: { id: DEMO_IDS.unitLatakia },
    update: {
      unitNumber: 'Sea-5',
      floor: 6,
      rooms: 2,
      areaSqM: 110,
      basePrice: 320,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyLatakia,
    },
    create: {
      id: DEMO_IDS.unitLatakia,
      unitNumber: 'Sea-5',
      floor: 6,
      rooms: 2,
      areaSqM: 110,
      basePrice: 320,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyLatakia,
    },
  })

  await prisma.unit.upsert({
    where: { id: DEMO_IDS.unitAleppo },
    update: {
      unitNumber: 'A-3',
      floor: 1,
      rooms: 3,
      areaSqM: 120,
      basePrice: 185,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyAleppo,
    },
    create: {
      id: DEMO_IDS.unitAleppo,
      unitNumber: 'A-3',
      floor: 1,
      rooms: 3,
      areaSqM: 120,
      basePrice: 185,
      status: 'RENTED',
      propertyId: DEMO_IDS.propertyAleppo,
    },
  })

  await prisma.tenant.upsert({
    where: { id: DEMO_IDS.tenantRima },
    update: {
      fullName: 'ريما خليل',
      nationalId: 'SY-1001',
      email: 'rima@example.com',
      phone: '+963944221110',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'rima@tenant.aqari.sy',
      portalEnabled: true,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      id: DEMO_IDS.tenantRima,
      fullName: 'ريما خليل',
      nationalId: 'SY-1001',
      email: 'rima@example.com',
      phone: '+963944221110',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'rima@tenant.aqari.sy',
      portalEnabled: true,
      passwordHash,
    },
  })

  await prisma.tenant.upsert({
    where: { id: DEMO_IDS.tenantSamer },
    update: {
      fullName: 'سامر حلاق',
      nationalId: 'SY-1002',
      email: 'samer@example.com',
      phone: '+963933200515',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'samer@tenant.aqari.sy',
      portalEnabled: true,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      id: DEMO_IDS.tenantSamer,
      fullName: 'سامر حلاق',
      nationalId: 'SY-1002',
      email: 'samer@example.com',
      phone: '+963933200515',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'samer@tenant.aqari.sy',
      portalEnabled: true,
      passwordHash,
    },
  })

  await prisma.tenant.upsert({
    where: { id: DEMO_IDS.tenantLina },
    update: {
      fullName: 'لينا يونس',
      nationalId: 'SY-1003',
      email: 'lina@example.com',
      phone: '+963955415320',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'lina@tenant.aqari.sy',
      portalEnabled: true,
      ...(passwordHash ? { passwordHash } : {}),
    },
    create: {
      id: DEMO_IDS.tenantLina,
      fullName: 'لينا يونس',
      nationalId: 'SY-1003',
      email: 'lina@example.com',
      phone: '+963955415320',
      agencyId: DEMO_IDS.agency,
      portalEmail: 'lina@tenant.aqari.sy',
      portalEnabled: true,
      passwordHash,
    },
  })

  await prisma.contract.upsert({
    where: { id: DEMO_IDS.contractRima },
    update: {
      startDate: daysFromNow(-290),
      endDate: daysFromNow(9),
      rentAmount: 420,
      isActive: true,
      unitId: DEMO_IDS.unitDamascus,
      tenantId: DEMO_IDS.tenantRima,
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.contractRima,
      startDate: daysFromNow(-290),
      endDate: daysFromNow(9),
      rentAmount: 420,
      isActive: true,
      unitId: DEMO_IDS.unitDamascus,
      tenantId: DEMO_IDS.tenantRima,
      agencyId: DEMO_IDS.agency,
    },
  })

  await prisma.contract.upsert({
    where: { id: DEMO_IDS.contractSamer },
    update: {
      startDate: daysFromNow(-120),
      endDate: daysFromNow(44),
      rentAmount: 320,
      isActive: true,
      unitId: DEMO_IDS.unitLatakia,
      tenantId: DEMO_IDS.tenantSamer,
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.contractSamer,
      startDate: daysFromNow(-120),
      endDate: daysFromNow(44),
      rentAmount: 320,
      isActive: true,
      unitId: DEMO_IDS.unitLatakia,
      tenantId: DEMO_IDS.tenantSamer,
      agencyId: DEMO_IDS.agency,
    },
  })

  await prisma.contract.upsert({
    where: { id: DEMO_IDS.contractLina },
    update: {
      startDate: daysFromNow(-70),
      endDate: daysFromNow(112),
      rentAmount: 185,
      isActive: true,
      unitId: DEMO_IDS.unitAleppo,
      tenantId: DEMO_IDS.tenantLina,
      agencyId: DEMO_IDS.agency,
    },
    create: {
      id: DEMO_IDS.contractLina,
      startDate: daysFromNow(-70),
      endDate: daysFromNow(112),
      rentAmount: 185,
      isActive: true,
      unitId: DEMO_IDS.unitAleppo,
      tenantId: DEMO_IDS.tenantLina,
      agencyId: DEMO_IDS.agency,
    },
  })

  const payments: Array<{
    id: string
    amount: number
    dueDate: Date
    paidDate?: Date
    status: 'OVERDUE' | 'PENDING' | 'PAID'
    contractId: string
    propertyId: string
    tenantId: string
    agencyId: string
    notes: string
  }> = [
    {
      id: DEMO_IDS.paymentRimaOverdue,
      amount: 420,
      dueDate: daysFromNow(-4),
      status: 'OVERDUE',
      contractId: DEMO_IDS.contractRima,
      propertyId: DEMO_IDS.propertyDamascus,
      tenantId: DEMO_IDS.tenantRima,
      agencyId: DEMO_IDS.agency,
      notes: 'بدل إيجار مارس 2026',
    },
    {
      id: DEMO_IDS.paymentRimaDue,
      amount: 420,
      dueDate: daysFromNow(2),
      status: 'PENDING',
      contractId: DEMO_IDS.contractRima,
      propertyId: DEMO_IDS.propertyDamascus,
      tenantId: DEMO_IDS.tenantRima,
      agencyId: DEMO_IDS.agency,
      notes: 'بدل إيجار أبريل 2026',
    },
    {
      id: DEMO_IDS.paymentSamerDue,
      amount: 320,
      dueDate: daysFromNow(5),
      status: 'PENDING',
      contractId: DEMO_IDS.contractSamer,
      propertyId: DEMO_IDS.propertyLatakia,
      tenantId: DEMO_IDS.tenantSamer,
      agencyId: DEMO_IDS.agency,
      notes: 'بدل إيجار أبريل 2026',
    },
    {
      id: DEMO_IDS.paymentSamerPaid,
      amount: 320,
      dueDate: daysFromNow(-24),
      paidDate: daysFromNow(-23),
      status: 'PAID',
      contractId: DEMO_IDS.contractSamer,
      propertyId: DEMO_IDS.propertyLatakia,
      tenantId: DEMO_IDS.tenantSamer,
      agencyId: DEMO_IDS.agency,
      notes: 'بدل إيجار مارس 2026',
    },
    {
      id: DEMO_IDS.paymentLinaDue,
      amount: 185,
      dueDate: daysFromNow(1),
      status: 'PENDING',
      contractId: DEMO_IDS.contractLina,
      propertyId: DEMO_IDS.propertyAleppo,
      tenantId: DEMO_IDS.tenantLina,
      agencyId: DEMO_IDS.agency,
      notes: 'بدل إيجار أبريل 2026',
    },
  ]

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: payment,
      create: payment,
    })
  }

  await prisma.maintenanceRequest.upsert({
    where: { id: DEMO_IDS.maintenanceRima },
    update: {
      title: 'تسرب خفيف في المطبخ',
      description: 'يوجد تسرب بسيط تحت المغسلة ويحتاج زيارة فني هذا الأسبوع.',
      priority: 'URGENT',
      status: 'NEW',
      tenantId: DEMO_IDS.tenantRima,
      contractId: DEMO_IDS.contractRima,
      agencyId: DEMO_IDS.agency,
      propertyId: DEMO_IDS.propertyDamascus,
    },
    create: {
      id: DEMO_IDS.maintenanceRima,
      title: 'تسرب خفيف في المطبخ',
      description: 'يوجد تسرب بسيط تحت المغسلة ويحتاج زيارة فني هذا الأسبوع.',
      priority: 'URGENT',
      status: 'NEW',
      tenantId: DEMO_IDS.tenantRima,
      contractId: DEMO_IDS.contractRima,
      agencyId: DEMO_IDS.agency,
      propertyId: DEMO_IDS.propertyDamascus,
    },
  })

  await prisma.maintenanceRequest.upsert({
    where: { id: DEMO_IDS.maintenanceSamer },
    update: {
      title: 'فحص المكيف',
      description: 'المكيف يعمل لكن التبريد أضعف من المعتاد في الصالون.',
      priority: 'NORMAL',
      status: 'SCHEDULED',
      scheduledFor: daysFromNow(1),
      tenantId: DEMO_IDS.tenantSamer,
      contractId: DEMO_IDS.contractSamer,
      agencyId: DEMO_IDS.agency,
      propertyId: DEMO_IDS.propertyLatakia,
    },
    create: {
      id: DEMO_IDS.maintenanceSamer,
      title: 'فحص المكيف',
      description: 'المكيف يعمل لكن التبريد أضعف من المعتاد في الصالون.',
      priority: 'NORMAL',
      status: 'SCHEDULED',
      scheduledFor: daysFromNow(1),
      tenantId: DEMO_IDS.tenantSamer,
      contractId: DEMO_IDS.contractSamer,
      agencyId: DEMO_IDS.agency,
      propertyId: DEMO_IDS.propertyLatakia,
    },
  })

  return DEMO_IDS.agency
}

export async function getOperationsDashboardData() {
  try {
    await ensureRentalSeedData()

    const contracts = await prisma.contract.findMany({
      where: {
        agencyId: DEMO_IDS.agency,
        isActive: true,
        endDate: {
          lte: daysFromNow(30),
        },
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    })

    const payments = await prisma.payment.findMany({
      where: {
        agencyId: DEMO_IDS.agency,
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'PENDING',
            dueDate: {
              lte: daysFromNow(3),
            },
          },
        ],
      },
      include: {
        tenant: true,
        contract: true,
        property: true,
      },
      orderBy: { dueDate: 'asc' },
    })

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        agencyId: DEMO_IDS.agency,
        status: {
          in: ['NEW', 'SCHEDULED', 'IN_PROGRESS'],
        },
      },
      include: {
        tenant: true,
        property: true,
        contract: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const notificationLogs = await prisma.notificationLog.findMany({
      where: { agencyId: DEMO_IDS.agency },
      include: {
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })

    const notifications = [
      ...contracts.map((contract) => ({
        id: `contract-${contract.id}`,
        type: 'contract-expiry',
        severity: Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)) <= 7 ? 'high' : 'medium',
        title: `العقد يقترب من النهاية: ${contract.tenant.fullName}`,
        description: `${contract.unit.property.title} - الوحدة ${contract.unit.unitNumber}`,
        dueDate: contract.endDate,
        tenantName: contract.tenant.fullName,
        contractId: contract.id,
        paymentId: null,
        maintenanceRequestId: null,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: payment.status === 'OVERDUE' ? 'payment-overdue' : 'payment-due',
        severity: payment.status === 'OVERDUE' ? 'high' : 'medium',
        title: payment.status === 'OVERDUE' ? `دفعة متأخرة: ${payment.tenant.fullName}` : `دفعة مستحقة قريبًا: ${payment.tenant.fullName}`,
        description: `${payment.notes || 'دفعة إيجار'} - ${asNumber(payment.amount)} دولار`,
        dueDate: payment.dueDate,
        tenantName: payment.tenant.fullName,
        contractId: payment.contractId,
        paymentId: payment.id,
        maintenanceRequestId: null,
      })),
      ...maintenanceRequests.map((request) => ({
        id: `maintenance-${request.id}`,
        type: 'maintenance',
        severity: request.priority === 'URGENT' ? 'high' : 'low',
        title: request.priority === 'URGENT' ? `طلب صيانة عاجل: ${request.tenant.fullName}` : `طلب صيانة جديد: ${request.tenant.fullName}`,
        description: request.title,
        dueDate: request.createdAt,
        tenantName: request.tenant.fullName,
        contractId: request.contractId,
        paymentId: null,
        maintenanceRequestId: request.id,
      })),
    ].sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())

    return {
      agencyId: DEMO_IDS.agency,
      contracts,
      payments,
      maintenanceRequests,
      notificationLogs,
      notifications,
      demoCredentials: getDemoCredentials().map(({ fullName, email, password }) => ({ fullName, email, password })),
      dataSource: 'database' as const,
    }
  } catch {
    return buildFallbackOperationsDashboardData()
  }
}

export async function getTenantByPortalEmail(portalEmail: string) {
  try {
    await ensureRentalSeedData()

    return await prisma.tenant.findFirst({
      where: {
        portalEmail: portalEmail.toLowerCase(),
        portalEnabled: true,
      },
    })
  } catch {
    if (!isDevelopmentDemoModeEnabled()) {
      return null
    }

    const credential = getDemoCredentials().find((item) => item.email === portalEmail.toLowerCase())

    if (!credential) {
      return null
    }

    return {
      id: credential.tenantId,
      fullName: credential.fullName,
      portalEmail: credential.email,
      portalEnabled: true,
      passwordHash: await getDemoPasswordHash(),
    }
  }
}

export async function getTenantPortalData(tenantId: string) {
  try {
    await ensureRentalSeedData()

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        agency: true,
        contracts: {
          orderBy: { endDate: 'asc' },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        payments: {
          orderBy: { dueDate: 'asc' },
          include: {
            property: true,
          },
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            property: true,
          },
        },
      },
    })

    return tenant
  } catch {
    const tenant = buildDemoTenantPortalData(tenantId)

    if (!tenant) {
      return null
    }

    return {
      ...tenant,
      agency: {
        id: DEMO_IDS.agency,
        name: 'مكتب عقاري تجريبي',
        email: 'office@aqari-demo.sy',
      },
    }
  }
}

export async function getMaintenanceDashboardData() {
  try {
    await ensureRentalSeedData()

    const agency = await prisma.agency.findUnique({ where: { id: DEMO_IDS.agency } })
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { agencyId: DEMO_IDS.agency },
      include: {
        tenant: true,
        contract: true,
        property: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })

    const recentPayments = await prisma.payment.findMany({
      where: { agencyId: DEMO_IDS.agency },
      include: { tenant: true, property: true },
      orderBy: [{ dueDate: 'asc' }],
      take: 8,
    })

    const notificationLogs = await prisma.notificationLog.findMany({
      where: { agencyId: DEMO_IDS.agency },
      include: {
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    })

    return {
      agency,
      maintenanceRequests,
      recentPayments,
      notificationLogs,
      dataSource: 'database' as const,
    }
  } catch {
    return buildFallbackMaintenanceDashboardData()
  }
}

export async function dispatchOperationalReminderEmails() {
  const data = await getOperationsDashboardData()
  const agency = await prisma.agency.findUnique({ where: { id: data.agencyId } })

  let sent = 0
  let skipped = 0

  for (const contract of data.contracts) {
    if (!contract.tenant.portalEmail) {
      skipped += 1
      continue
    }

    const response = await sendEmailNotification({
      agencyId: data.agencyId,
      tenantId: contract.tenantId,
      contractId: contract.id,
      recipient: contract.tenant.portalEmail,
      subject: 'تذكير بقرب انتهاء عقد الإيجار',
      text: `مرحباً ${contract.tenant.fullName}، عقدك في ${contract.unit.property.title} ينتهي بتاريخ ${new Intl.DateTimeFormat('ar-SY').format(new Date(contract.endDate))}.`,
      html: `<p>مرحباً ${contract.tenant.fullName}</p><p>عقدك في <strong>${contract.unit.property.title}</strong> ينتهي بتاريخ ${new Intl.DateTimeFormat('ar-SY').format(new Date(contract.endDate))}.</p>`,
      template: 'contract-expiry-reminder',
    })

    if (response.delivered) {
      sent += 1
    } else {
      skipped += 1
    }
  }

  for (const payment of data.payments) {
    if (!payment.tenant.portalEmail) {
      skipped += 1
      continue
    }

    const isOverdue = payment.status === 'OVERDUE'
    const response = await sendEmailNotification({
      agencyId: data.agencyId,
      tenantId: payment.tenantId,
      contractId: payment.contractId,
      paymentId: payment.id,
      recipient: payment.tenant.portalEmail,
      subject: isOverdue ? 'تنبيه دفعة متأخرة' : 'تذكير بموعد دفعة إيجار',
      text: `مرحباً ${payment.tenant.fullName}، ${payment.notes || 'هناك دفعة'} بقيمة ${asNumber(payment.amount)} دولار ${isOverdue ? 'أصبحت متأخرة' : 'مستحقة قريباً'} بتاريخ ${new Intl.DateTimeFormat('ar-SY').format(new Date(payment.dueDate))}.`,
      html: `<p>مرحباً ${payment.tenant.fullName}</p><p>${payment.notes || 'هناك دفعة'} بقيمة <strong>${asNumber(payment.amount)} دولار</strong> ${isOverdue ? 'أصبحت متأخرة' : 'مستحقة قريباً'} بتاريخ ${new Intl.DateTimeFormat('ar-SY').format(new Date(payment.dueDate))}.</p>`,
      template: isOverdue ? 'payment-overdue-reminder' : 'payment-due-reminder',
    })

    if (response.delivered) {
      sent += 1
    } else {
      skipped += 1
    }
  }

  const newRequests = data.maintenanceRequests.filter((request) => request.status === 'NEW')

  if (agency?.email && newRequests.length > 0) {
    const response = await sendEmailNotification({
      agencyId: data.agencyId,
      recipient: agency.email,
      subject: 'طلبات صيانة جديدة تحتاج متابعة',
      text: `لديك ${newRequests.length} طلب/طلبات صيانة جديدة في لوحة المكتب.`,
      html: `<p>لديك <strong>${newRequests.length}</strong> طلب/طلبات صيانة جديدة في لوحة المكتب.</p>`,
      template: 'maintenance-owner-digest',
    })

    if (response.delivered) {
      sent += 1
    } else {
      skipped += 1
    }
  }

  return { sent, skipped }
}

export type OperationsDashboardData = Awaited<ReturnType<typeof getOperationsDashboardData>>
export type TenantPortalData = NonNullable<Awaited<ReturnType<typeof getTenantPortalData>>>
export type MaintenanceDashboardData = Awaited<ReturnType<typeof getMaintenanceDashboardData>>