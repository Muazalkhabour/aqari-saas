export type ListingType = 'بيع' | 'إيجار'

export type SyrianProperty = {
  id: string
  type: ListingType
  title: string
  governorate: string
  district: string
  neighborhood: string
  latitude?: number
  longitude?: number
  priceLabel: string
  priceValue: number
  currency: 'USD'
  paymentPeriod?: 'شهري' | 'سنوي' | 'مرة واحدة'
  areaSqm: number
  rooms: number
  bathrooms: number
  floor: string
  furnishing: 'مفروش' | 'غير مفروش' | 'نصف مفروش'
  ownership: 'مالك مباشر' | 'مكتب عقاري'
  status: string
  description: string
  highlight: string
  features: string[]
  suitableFor: string[]
  contactName: string
}

export type PropertyGalleryImage = {
  src: string
  label: string
  alt: string
}

export type PropertyCoordinates = {
  latitude: number
  longitude: number
}

export const governorates = [
  'دمشق',
  'ريف دمشق',
  'حلب',
  'حمص',
  'حماة',
  'اللاذقية',
  'طرطوس',
  'درعا',
  'السويداء',
  'إدلب',
  'دير الزور',
  'الرقة',
  'الحسكة',
  'القنيطرة',
]

const governorateCenters: Record<string, PropertyCoordinates> = {
  'دمشق': { latitude: 33.5138, longitude: 36.2765 },
  'ريف دمشق': { latitude: 33.5203, longitude: 36.3562 },
  'حلب': { latitude: 36.2021, longitude: 37.1343 },
  'حمص': { latitude: 34.7308, longitude: 36.7090 },
  'حماة': { latitude: 35.1318, longitude: 36.7578 },
  'اللاذقية': { latitude: 35.5317, longitude: 35.7900 },
  'طرطوس': { latitude: 34.8890, longitude: 35.8866 },
  'درعا': { latitude: 32.6250, longitude: 36.1021 },
  'السويداء': { latitude: 32.7087, longitude: 36.5695 },
  'إدلب': { latitude: 35.9306, longitude: 36.6339 },
  'دير الزور': { latitude: 35.3330, longitude: 40.1500 },
  'الرقة': { latitude: 35.9506, longitude: 39.0095 },
  'الحسكة': { latitude: 36.5024, longitude: 40.7477 },
  'القنيطرة': { latitude: 33.1260, longitude: 35.8246 },
}

export const syrianProperties: SyrianProperty[] = [
  {
    id: 'damascus-mezzeh-rent',
    type: 'إيجار',
    title: 'شقة عائلية في المزة الغربية',
    governorate: 'دمشق',
    district: 'المزة',
    neighborhood: 'المزة الغربية',
    priceLabel: '420 دولار شهرياً',
    priceValue: 420,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 135,
    rooms: 3,
    bathrooms: 2,
    floor: 'الطابق الرابع',
    furnishing: 'غير مفروش',
    ownership: 'مكتب عقاري',
    status: 'جاهزة للسكن',
    description: 'شقة مناسبة للعائلات في منطقة مخدمة وقريبة من المدارس والفرن والخدمات الأساسية مع بناء نظيف ومدخل مرتب.',
    highlight: 'قريبة من المدارس ومواقف السرافيس',
    features: ['كسوة سوبر ديلوكس', 'مياه مستقرة', 'مصعد', 'شرفة واسعة'],
    suitableFor: ['عائلات', 'موظفون'],
    contactName: 'مكتب الشام العقاري',
  },
  {
    id: 'damascus-kafar-souseh-sale',
    type: 'بيع',
    title: 'شقة للبيع في كفرسوسة',
    governorate: 'دمشق',
    district: 'كفرسوسة',
    neighborhood: 'تنظيم كفرسوسة',
    priceLabel: '76,000 دولار',
    priceValue: 76000,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 145,
    rooms: 4,
    bathrooms: 2,
    floor: 'الطابق الثالث',
    furnishing: 'غير مفروش',
    ownership: 'مالك مباشر',
    status: 'سجل جاهز',
    description: 'شقة واسعة في حي مطلوب، مناسبة للسكن العائلي أو للاستثمار طويل الأمد، مع إطلالة جيدة وخدمات قريبة.',
    highlight: 'مناسبة للاستثمار والسكن العائلي',
    features: ['كراج', 'واجهة جنوبية', 'كسوة حديثة', 'منطقة هادئة'],
    suitableFor: ['عائلات', 'استثمار'],
    contactName: 'أبو يزن',
  },
  {
    id: 'rif-dimashq-jaramana-rent',
    type: 'إيجار',
    title: 'شقة شبابية في جرمانا',
    governorate: 'ريف دمشق',
    district: 'جرمانا',
    neighborhood: 'الروضة',
    priceLabel: '220 دولار شهرياً',
    priceValue: 220,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 95,
    rooms: 2,
    bathrooms: 1,
    floor: 'الطابق الثاني',
    furnishing: 'نصف مفروش',
    ownership: 'مكتب عقاري',
    status: 'جاهزة فوراً',
    description: 'شقة مريحة في جرمانا مناسبة للموظفين أو المتزوجين حديثاً، مع وصول سهل إلى دمشق وخدمات قريبة.',
    highlight: 'ميزانية مناسبة مع وصول سريع لدمشق',
    features: ['مطبخ راكب', 'خزان مياه', 'قرب المواصلات', 'تدفئة'],
    suitableFor: ['شباب', 'عائلات صغيرة'],
    contactName: 'مكتب جرمانا الذهبي',
  },
  {
    id: 'aleppo-furqan-sale',
    type: 'بيع',
    title: 'شقة للبيع في الفرقان',
    governorate: 'حلب',
    district: 'الفرقان',
    neighborhood: 'الفرقان الجديدة',
    priceLabel: '58,000 دولار',
    priceValue: 58000,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 160,
    rooms: 4,
    bathrooms: 2,
    floor: 'الطابق الخامس',
    furnishing: 'غير مفروش',
    ownership: 'مالك مباشر',
    status: 'سجل جاهز',
    description: 'شقة منظمة في منطقة الفرقان من أكثر المناطق المطلوبة في حلب، مناسبة للسكن الراقي أو الاستثمار.',
    highlight: 'منطقة مطلوبة وقريبة من الخدمات',
    features: ['واجهة شرقية', 'كراج خاص', 'تشطيب حديث', 'مصعد'],
    suitableFor: ['عائلات', 'استثمار'],
    contactName: 'أبو العز',
  },
  {
    id: 'aleppo-hamdaniyeh-rent',
    type: 'إيجار',
    title: 'شقة للإيجار في الحمدانية',
    governorate: 'حلب',
    district: 'الحمدانية',
    neighborhood: 'الحمدانية السادسة',
    priceLabel: '185 دولار شهرياً',
    priceValue: 185,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 120,
    rooms: 3,
    bathrooms: 2,
    floor: 'الطابق الأول',
    furnishing: 'غير مفروش',
    ownership: 'مكتب عقاري',
    status: 'مناسبة للعائلات',
    description: 'شقة عملية بسعر مناسب في حي مخدم، مناسبة للعائلات التي تبحث عن مساحة جيدة وسعر متوازن.',
    highlight: 'خيار جيد للعائلات ضمن ميزانية متوسطة',
    features: ['قرب المدارس', 'مدخل جيد', 'مياه جيدة', 'شرفة'],
    suitableFor: ['عائلات'],
    contactName: 'مكتب الحمدانية الحديث',
  },
  {
    id: 'latakia-ziraa-rent',
    type: 'إيجار',
    title: 'شقة مفروشة في مشروع الزراعة',
    governorate: 'اللاذقية',
    district: 'الزراعة',
    neighborhood: 'مشروع الزراعة',
    priceLabel: '320 دولار شهرياً',
    priceValue: 320,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 110,
    rooms: 2,
    bathrooms: 1,
    floor: 'الطابق السادس',
    furnishing: 'مفروش',
    ownership: 'مكتب عقاري',
    status: 'مفروشة بالكامل',
    description: 'شقة مفروشة بشكل كامل في موقع مرغوب في اللاذقية، مناسبة للمغتربين أو للعقود السنوية.',
    highlight: 'خيار مناسب للمغتربين والعقود السنوية',
    features: ['طاقة شمسية', 'إطلالة مفتوحة', 'مطبخ مجهز', 'مصعد'],
    suitableFor: ['مغتربون', 'عائلات صغيرة'],
    contactName: 'مكتب الساحل العقاري',
  },
  {
    id: 'latakia-sheikh-daher-sale',
    type: 'بيع',
    title: 'شقة للبيع في الشيخ ضاهر',
    governorate: 'اللاذقية',
    district: 'الشيخ ضاهر',
    neighborhood: 'قرب السوق',
    priceLabel: '44,000 دولار',
    priceValue: 44000,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 118,
    rooms: 3,
    bathrooms: 2,
    floor: 'الطابق الثالث',
    furnishing: 'غير مفروش',
    ownership: 'مالك مباشر',
    status: 'قابلة للتسليم الفوري',
    description: 'شقة مناسبة للشراء ضمن المدينة وقريبة من السوق والخدمات، مع سعر متوازن وموقع مركزي.',
    highlight: 'موقع حيوي في مركز اللاذقية',
    features: ['قرب السوق', 'واجهة جيدة', 'خدمات كاملة', 'صالون واسع'],
    suitableFor: ['عائلات', 'استثمار'],
    contactName: 'أم محمد',
  },
  {
    id: 'homs-ikrimah-sale',
    type: 'بيع',
    title: 'شقة اقتصادية في عكرمة الجديدة',
    governorate: 'حمص',
    district: 'عكرمة',
    neighborhood: 'عكرمة الجديدة',
    priceLabel: '34,500 دولار',
    priceValue: 34500,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 102,
    rooms: 3,
    bathrooms: 1,
    floor: 'الطابق الثاني',
    furnishing: 'غير مفروش',
    ownership: 'مكتب عقاري',
    status: 'مناسبة للسكن الفوري',
    description: 'شقة اقتصادية بسعر مناسب للعائلات الشابة أو لمن يبحث عن عقار أول ضمن مدينة حمص.',
    highlight: 'سعر مناسب للعائلات الشابة',
    features: ['قرب المدارس', 'تشطيب جيد', 'بناء مخدم بالكامل', 'منطقة سكنية'],
    suitableFor: ['عائلات', 'سكن أول'],
    contactName: 'مكتب حمص الأول',
  },
  {
    id: 'hama-mashtal-rent',
    type: 'إيجار',
    title: 'شقة للإيجار قرب المشتل',
    governorate: 'حماة',
    district: 'المشتل',
    neighborhood: 'قرب الكراج',
    priceLabel: '160 دولار شهرياً',
    priceValue: 160,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 100,
    rooms: 3,
    bathrooms: 1,
    floor: 'الطابق الأول',
    furnishing: 'غير مفروش',
    ownership: 'مالك مباشر',
    status: 'متاحة الآن',
    description: 'شقة عملية في حماة مناسبة للعائلة، مع موقع جيد وسعر منخفض نسبياً مقارنة بالمحافظات الكبرى.',
    highlight: 'إيجار متوازن ضمن حي هادئ',
    features: ['قرب المواصلات', 'مياه جيدة', 'إضاءة جيدة', 'مدخل مستقل'],
    suitableFor: ['عائلات'],
    contactName: 'أبو زيد',
  },
  {
    id: 'tartous-project-sale',
    type: 'بيع',
    title: 'شقة بحرية في طرطوس',
    governorate: 'طرطوس',
    district: 'المشروع السادس',
    neighborhood: 'قرب الكورنيش',
    priceLabel: '62,000 دولار',
    priceValue: 62000,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 150,
    rooms: 4,
    bathrooms: 2,
    floor: 'الطابق السابع',
    furnishing: 'نصف مفروش',
    ownership: 'مكتب عقاري',
    status: 'إطلالة مفتوحة',
    description: 'شقة بإطلالة بحرية في طرطوس مناسبة للسكن الدائم أو للاستثمار السياحي ضمن منطقة مطلوبة.',
    highlight: 'إطلالة بحرية وقرب الكورنيش',
    features: ['إطلالة بحرية', 'مصعد', 'بلكون واسع', 'منطقة مطلوبة'],
    suitableFor: ['عائلات', 'استثمار'],
    contactName: 'مكتب البحر الأزرق',
  },
  {
    id: 'daraa-mahata-rent',
    type: 'إيجار',
    title: 'شقة للإيجار في درعا المحطة',
    governorate: 'درعا',
    district: 'درعا المحطة',
    neighborhood: 'قرب السرايا',
    priceLabel: '140 دولار شهرياً',
    priceValue: 140,
    currency: 'USD',
    paymentPeriod: 'شهري',
    areaSqm: 90,
    rooms: 2,
    bathrooms: 1,
    floor: 'الطابق الثاني',
    furnishing: 'غير مفروش',
    ownership: 'مالك مباشر',
    status: 'متوفرة حالياً',
    description: 'شقة مناسبة للموظفين أو العائلات الصغيرة مع وصول جيد إلى الخدمات اليومية.',
    highlight: 'سعر مناسب وموقع عملي',
    features: ['قرب المؤسسات', 'مدخل جيد', 'تهوية ممتازة', 'حي نشط'],
    suitableFor: ['شباب', 'عائلات صغيرة'],
    contactName: 'أبو محمود',
  },
  {
    id: 'sweida-villa-sale',
    type: 'بيع',
    title: 'شقة واسعة في السويداء',
    governorate: 'السويداء',
    district: 'المساكن',
    neighborhood: 'قرب الدوار',
    priceLabel: '39,000 دولار',
    priceValue: 39000,
    currency: 'USD',
    paymentPeriod: 'مرة واحدة',
    areaSqm: 130,
    rooms: 3,
    bathrooms: 2,
    floor: 'الطابق الأرضي المرتفع',
    furnishing: 'غير مفروش',
    ownership: 'مكتب عقاري',
    status: 'جاهزة للتسليم',
    description: 'شقة جيدة المساحة ضمن حي هادئ في السويداء، مناسبة لعائلة تبحث عن هدوء واستقرار.',
    highlight: 'مناسبة لسكن عائلي هادئ',
    features: ['حديقة صغيرة', 'مدخل مستقل', 'قرب السوق', 'تشطيب مرتب'],
    suitableFor: ['عائلات'],
    contactName: 'مكتب الجبل العقاري',
  },
]

export const featuredListings = syrianProperties.slice(0, 6)

export const dashboardMetrics = [
  {
    title: 'عقارات منشورة اليوم',
    value: '186',
    delta: '+24 إعلان جديد منذ الصباح',
  },
  {
    title: 'شقق للإيجار',
    value: String(syrianProperties.filter((property) => property.type === 'إيجار').length),
    delta: 'تركيز أعلى في دمشق واللاذقية',
  },
  {
    title: 'شقق للبيع',
    value: String(syrianProperties.filter((property) => property.type === 'بيع').length),
    delta: 'طلب قوي على المساحات المتوسطة',
  },
  {
    title: 'طلبات معاينة',
    value: '37',
    delta: 'معظمها خلال المساء وعطلة نهاية الأسبوع',
  },
]

export const marketPulse = [
  {
    governorate: 'دمشق',
    demand: 'مرتفع جداً',
    averageRent: '350 - 650 دولار',
    averageSale: '48K - 120K دولار',
  },
  {
    governorate: 'ريف دمشق',
    demand: 'مرتفع',
    averageRent: '180 - 320 دولار',
    averageSale: '28K - 65K دولار',
  },
  {
    governorate: 'حلب',
    demand: 'مستقر مع نمو',
    averageRent: '170 - 300 دولار',
    averageSale: '26K - 70K دولار',
  },
  {
    governorate: 'اللاذقية',
    demand: 'موسمي وقوي',
    averageRent: '220 - 450 دولار',
    averageSale: '35K - 85K دولار',
  },
]

export const audienceNeeds = [
  'فلترة بحسب المحافظة والمنطقة والسعر ونوع العقد',
  'إبراز شقق الإيجار الشهري والسنوي بشكل منفصل',
  'عرض تفاصيل عملية مثل المياه والمصعد والخدمات القريبة',
  'تواصل سريع مع المالك أو المكتب عبر واتساب أو اتصال مباشر',
]

export const productSuggestions = [
  {
    title: 'خريطة سوريا العقارية',
    description: 'عرض العقارات بحسب المحافظة ثم الحي، مع مؤشرات طلب وأسعار تقريبية تسهّل المقارنة.',
  },
  {
    title: 'نموذج إعلان مخصص للسوق المحلي',
    description: 'حقول مخصصة للسوق المحلي مثل نوع الكسوة، والكهرباء، والمياه، والفرش، وطريقة التسعير.',
  },
  {
    title: 'مطابقة ذكية بين الباحث والعقار',
    description: 'اقتراح عقارات مشابهة تلقائياً بحسب المدينة والميزانية وعدد الغرف ونوع السكن.',
  },
]

export const heroStats = [
  { label: 'إعلانات موثقة', value: '120+' },
  { label: 'محافظات مغطاة', value: '14' },
  { label: 'طلبات تواصل أسبوعية', value: '340+' },
]

export const ownerListingChecklist = [
  'اكتب اسم الحي والمنطقة بدقة، لأن معظم الزوار يبدأون البحث محلياً.',
  'اذكر السعر بوضوح، مع توضيح ما إذا كان شهرياً أو نهائياً.',
  'أظهر عناصر الثقة مثل الملكية المباشرة، وجاهزية السجل، والمياه أو المصعد أو الطاقة الشمسية.',
  'اكتب وصفاً عملياً يوضح لمن يناسب العقار: عائلة، موظفون، مغتربون، أو استثمار.',
]

export const ownerPublishingAdvantages = [
  {
    title: 'نموذج قصير لكنه ذكي',
    description: 'يركز على الحقول التي تؤثر فعلاً على قرار الشراء أو الإيجار، بدل النموذج الطويل والمشتت.',
  },
  {
    title: 'معاينة الإعلان قبل النشر',
    description: 'يمكنك رؤية العقار كبطاقة عرض حقيقية قبل اعتماده، ما يساعدك على تحسين العنوان والوصف والسعر.',
  },
  {
    title: 'إرشادات لتحسين الثقة',
    description: 'النظام يذكرك بالعناصر التي ترفع التفاعل، مثل الحي، والفرش، والخدمات، وطبيعة الجهة المعلنة.',
  },
]

export const ownerFeatureSuggestions = [
  'مصعد',
  'كراج',
  'طاقة شمسية',
  'شرفة',
  'مياه مستقرة',
  'قرب المواصلات',
  'قرب المدارس',
  'إطلالة مفتوحة',
]

function buildPropertyImages(
  title: string,
  items: Array<{ src: string; label: string; alt: string }>
): PropertyGalleryImage[] {
  return items.map((item) => ({
    src: item.src,
    label: item.label,
    alt: item.alt || `${item.label} في ${title}`,
  }))
}

const propertyMediaById: Record<string, PropertyGalleryImage[]> = {
  'damascus-mezzeh-rent': buildPropertyImages('شقة عائلية في المزة الغربية', [
    { src: '/listings/interior-luxury-1.svg', label: 'الصالون الرئيسي', alt: 'صالون واسع في شقة المزة الغربية' },
    { src: '/listings/interior-luxury-11.svg', label: 'مجلس الاستقبال', alt: 'مجلس استقبال أنيق في شقة المزة الغربية' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم الرئيسية', alt: 'غرفة نوم رئيسية في شقة المزة الغربية' },
    { src: '/listings/interior-luxury-12.svg', label: 'جلسة عائلية', alt: 'جلسة عائلية يومية في شقة المزة الغربية' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ العملي', alt: 'مطبخ عملي في شقة المزة الغربية' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة والإطلالة', alt: 'شرفة مطلة على المدينة في شقة المزة الغربية' },
  ]),
  'damascus-kafar-souseh-sale': buildPropertyImages('شقة للبيع في كفرسوسة', [
    { src: '/listings/interior-luxury-11.svg', label: 'صالون الاستقبال', alt: 'صالون استقبال فاخر في شقة كفرسوسة' },
    { src: '/listings/interior-luxury-1.svg', label: 'جلسة المعيشة', alt: 'جلسة معيشة واسعة في شقة كفرسوسة' },
    { src: '/listings/interior-luxury-7.svg', label: 'الغرفة الرئيسية', alt: 'غرفة نوم رئيسية في شقة كفرسوسة' },
    { src: '/listings/interior-luxury-13.svg', label: 'زاوية الطعام', alt: 'زاوية طعام مرتبة في شقة كفرسوسة' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ الحديث', alt: 'مطبخ حديث في شقة كفرسوسة' },
    { src: '/listings/interior-luxury-9.svg', label: 'شرفة المدينة', alt: 'شرفة مطلة في شقة كفرسوسة' },
  ]),
  'rif-dimashq-jaramana-rent': buildPropertyImages('شقة شبابية في جرمانا', [
    { src: '/listings/interior-luxury-12.svg', label: 'الجلسة اليومية', alt: 'جلسة يومية في شقة جرمانا' },
    { src: '/listings/interior-luxury-6.svg', label: 'صالون صغير', alt: 'صالون صغير منظم في شقة جرمانا' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم مريحة في شقة جرمانا' },
    { src: '/listings/interior-luxury-14.svg', label: 'زاوية متعددة الاستخدام', alt: 'زاوية متعددة الاستخدام في شقة جرمانا' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ الصغير', alt: 'مطبخ مرتب في شقة جرمانا' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة المفتوحة', alt: 'شرفة مدينة في شقة جرمانا' },
  ]),
  'aleppo-furqan-sale': buildPropertyImages('شقة للبيع في الفرقان', [
    { src: '/listings/interior-luxury-2.svg', label: 'الصالون الأنيق', alt: 'صالون أنيق في شقة الفرقان' },
    { src: '/listings/interior-luxury-11.svg', label: 'مجلس الاستقبال', alt: 'مجلس استقبال في شقة الفرقان' },
    { src: '/listings/interior-luxury-15.svg', label: 'جلسة ثانوية', alt: 'جلسة ثانوية مرتبة في شقة الفرقان' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم رئيسية في شقة الفرقان' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المتكامل', alt: 'مطبخ متكامل في شقة الفرقان' },
    { src: '/listings/interior-luxury-9.svg', label: 'البلكون الأمامي', alt: 'شرفة أمامية في شقة الفرقان' },
  ]),
  'aleppo-hamdaniyeh-rent': buildPropertyImages('شقة للإيجار في الحمدانية', [
    { src: '/listings/interior-luxury-6.svg', label: 'الجلسة اليومية', alt: 'جلسة يومية في شقة الحمدانية' },
    { src: '/listings/interior-luxury-12.svg', label: 'صالون العائلة', alt: 'صالون عائلي في شقة الحمدانية' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم في شقة الحمدانية' },
    { src: '/listings/interior-luxury-13.svg', label: 'زاوية الطعام', alt: 'زاوية طعام في شقة الحمدانية' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المجهز', alt: 'مطبخ مجهز في شقة الحمدانية' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة العملية', alt: 'شرفة عملية في شقة الحمدانية' },
  ]),
  'latakia-ziraa-rent': buildPropertyImages('شقة مفروشة في مشروع الزراعة', [
    { src: '/listings/interior-luxury-3.svg', label: 'الصالون البحري', alt: 'صالون بإضاءة بحرية في شقة مشروع الزراعة' },
    { src: '/listings/interior-luxury-4.svg', label: 'جلسة ساحلية', alt: 'جلسة ساحلية في شقة مشروع الزراعة' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة نوم مطلة', alt: 'غرفة نوم مطلة في شقة مشروع الزراعة' },
    { src: '/listings/interior-luxury-16.svg', label: 'واجهة بانورامية', alt: 'واجهة بانورامية بحرية في شقة مشروع الزراعة' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المجهز', alt: 'مطبخ مجهز في شقة مشروع الزراعة' },
    { src: '/listings/interior-luxury-10.svg', label: 'الإطلالة البحرية', alt: 'شرفة بإطلالة بحرية في شقة مشروع الزراعة' },
  ]),
  'latakia-sheikh-daher-sale': buildPropertyImages('شقة للبيع في الشيخ ضاهر', [
    { src: '/listings/interior-luxury-10.svg', label: 'الإطلالة المفتوحة', alt: 'شرفة مطلة في شقة الشيخ ضاهر' },
    { src: '/listings/interior-luxury-1.svg', label: 'صالون المدينة', alt: 'صالون مرتب في شقة الشيخ ضاهر' },
    { src: '/listings/interior-luxury-3.svg', label: 'جلسة بإضاءة ناعمة', alt: 'جلسة بإضاءة ناعمة في شقة الشيخ ضاهر' },
    { src: '/listings/interior-luxury-7.svg', label: 'الغرفة الهادئة', alt: 'غرفة نوم هادئة في شقة الشيخ ضاهر' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ الداخلي', alt: 'مطبخ داخلي في شقة الشيخ ضاهر' },
    { src: '/listings/interior-luxury-16.svg', label: 'واجهة بحرية قريبة', alt: 'واجهة بإحساس بحري قريب في شقة الشيخ ضاهر' },
  ]),
  'homs-ikrimah-sale': buildPropertyImages('شقة اقتصادية في عكرمة الجديدة', [
    { src: '/listings/interior-luxury-5.svg', label: 'الصالون الاقتصادي', alt: 'صالون اقتصادي مرتب في شقة عكرمة الجديدة' },
    { src: '/listings/interior-luxury-12.svg', label: 'جلسة العائلة', alt: 'جلسة عائلية في شقة عكرمة الجديدة' },
    { src: '/listings/interior-luxury-14.svg', label: 'ركن إضافي', alt: 'ركن إضافي في شقة عكرمة الجديدة' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم في شقة عكرمة الجديدة' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المنزلي', alt: 'مطبخ منزلي في شقة عكرمة الجديدة' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة الداخلية', alt: 'شرفة داخلية في شقة عكرمة الجديدة' },
  ]),
  'hama-mashtal-rent': buildPropertyImages('شقة للإيجار قرب المشتل', [
    { src: '/listings/interior-luxury-6.svg', label: 'صالة الجلوس', alt: 'صالة جلوس في شقة حماة' },
    { src: '/listings/interior-luxury-12.svg', label: 'جلسة عائلية', alt: 'جلسة عائلية في شقة حماة' },
    { src: '/listings/interior-luxury-7.svg', label: 'الغرفة الرئيسية', alt: 'غرفة رئيسية في شقة حماة' },
    { src: '/listings/interior-luxury-13.svg', label: 'زاوية الطعام', alt: 'زاوية طعام في شقة حماة' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المرتب', alt: 'مطبخ مرتب في شقة حماة' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة على الحي', alt: 'شرفة على الحي في شقة حماة' },
  ]),
  'tartous-project-sale': buildPropertyImages('شقة بحرية في طرطوس', [
    { src: '/listings/interior-luxury-4.svg', label: 'الجلسة الساحلية', alt: 'جلسة ساحلية في شقة طرطوس' },
    { src: '/listings/interior-luxury-3.svg', label: 'صالون بإضاءة بحرية', alt: 'صالون بإضاءة بحرية في شقة طرطوس' },
    { src: '/listings/interior-luxury-16.svg', label: 'واجهة بانورامية', alt: 'واجهة بانورامية في شقة طرطوس' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة نوم مريحة', alt: 'غرفة نوم مريحة في شقة طرطوس' },
    { src: '/listings/interior-luxury-8.svg', label: 'مطبخ بإضاءة جيدة', alt: 'مطبخ بإضاءة جيدة في شقة طرطوس' },
    { src: '/listings/interior-luxury-10.svg', label: 'الشرفة البحرية', alt: 'إطلالة بحرية في شقة طرطوس' },
  ]),
  'daraa-mahata-rent': buildPropertyImages('شقة للإيجار في درعا المحطة', [
    { src: '/listings/interior-luxury-12.svg', label: 'الجلسة الهادئة', alt: 'جلسة هادئة في شقة درعا المحطة' },
    { src: '/listings/interior-luxury-6.svg', label: 'صالون عملي', alt: 'صالون عملي في شقة درعا المحطة' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم في شقة درعا المحطة' },
    { src: '/listings/interior-luxury-13.svg', label: 'ركن الطعام', alt: 'ركن طعام في شقة درعا المحطة' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ البسيط', alt: 'مطبخ بسيط في شقة درعا المحطة' },
    { src: '/listings/interior-luxury-9.svg', label: 'شرفة الحي', alt: 'شرفة مطلة على الحي في شقة درعا المحطة' },
  ]),
  'sweida-villa-sale': buildPropertyImages('شقة واسعة في السويداء', [
    { src: '/listings/interior-luxury-12.svg', label: 'الجلسة الواسعة', alt: 'جلسة واسعة في شقة السويداء' },
    { src: '/listings/interior-luxury-11.svg', label: 'صالون الاستقبال', alt: 'صالون استقبال في شقة السويداء' },
    { src: '/listings/interior-luxury-15.svg', label: 'جلسة إضافية', alt: 'جلسة إضافية في شقة السويداء' },
    { src: '/listings/interior-luxury-7.svg', label: 'غرفة النوم', alt: 'غرفة نوم في شقة السويداء' },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ المنزلي', alt: 'مطبخ منزلي في شقة السويداء' },
    { src: '/listings/interior-luxury-9.svg', label: 'الشرفة المفتوحة', alt: 'شرفة مفتوحة في شقة السويداء' },
  ]),
}

function buildFallbackGallery(property: Pick<SyrianProperty, 'title' | 'governorate' | 'furnishing' | 'type'>): PropertyGalleryImage[] {
  const isCoastal = property.governorate === 'اللاذقية' || property.governorate === 'طرطوس'
  const isFurnished = property.furnishing === 'مفروش' || property.furnishing === 'نصف مفروش'
  const cover = property.type === 'بيع' ? '/listings/interior-luxury-11.svg' : '/listings/interior-luxury-12.svg'

  return [
    { src: cover, label: 'اللقطة الرئيسية', alt: `اللقطة الرئيسية لعقار ${property.title}` },
    { src: isFurnished ? '/listings/interior-luxury-7.svg' : '/listings/interior-luxury-1.svg', label: 'جلسة المعيشة', alt: `جلسة المعيشة في عقار ${property.title}` },
    { src: '/listings/interior-luxury-13.svg', label: 'زاوية الطعام', alt: `زاوية الطعام في عقار ${property.title}` },
    { src: '/listings/interior-luxury-14.svg', label: 'جلسة إضافية', alt: `جلسة إضافية في عقار ${property.title}` },
    { src: '/listings/interior-luxury-8.svg', label: 'المطبخ', alt: `المطبخ في عقار ${property.title}` },
    { src: isCoastal ? '/listings/interior-luxury-10.svg' : '/listings/interior-luxury-9.svg', label: isCoastal ? 'الإطلالة البحرية' : 'الشرفة', alt: `الإطلالة أو الشرفة في عقار ${property.title}` },
  ]
}

export function getPropertyById(id: string) {
  return syrianProperties.find((property) => property.id === id)
}

export function getPropertyGallery(property: Pick<SyrianProperty, 'id' | 'title' | 'governorate' | 'furnishing' | 'type'>) {
  return propertyMediaById[property.id] ?? buildFallbackGallery(property)
}

export function getPropertyCoverImage(property: Pick<SyrianProperty, 'id' | 'title' | 'governorate' | 'furnishing' | 'type'>) {
  return getPropertyGallery(property)[0]?.src ?? '/listings/interior-luxury-1.svg'
}

function hashString(input: string) {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0
  }

  return Math.abs(hash)
}

export function getGovernorateCenter(governorate: string): PropertyCoordinates {
  return governorateCenters[governorate] ?? { latitude: 34.8021, longitude: 38.9968 }
}

export function getPropertyCoordinates(property: Pick<SyrianProperty, 'id' | 'governorate'> & Partial<Pick<SyrianProperty, 'latitude' | 'longitude'>>) {
  if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
    return {
      latitude: property.latitude,
      longitude: property.longitude,
    }
  }

  const center = getGovernorateCenter(property.governorate)
  const hash = hashString(property.id)
  const latitudeOffset = ((hash % 17) - 8) * 0.012
  const longitudeOffset = ((Math.floor(hash / 17) % 17) - 8) * 0.014

  return {
    latitude: center.latitude + latitudeOffset,
    longitude: center.longitude + longitudeOffset,
  }
}

export function filterProperties(filters: {
  type?: string
  governorate?: string
  minPrice?: number
  maxPrice?: number
  minRooms?: number
  furnishing?: string
  query?: string
}) {
  return syrianProperties.filter((property) => {
    if (filters.type && filters.type !== 'الكل' && property.type !== filters.type) {
      return false
    }

    if (
      filters.governorate &&
      filters.governorate !== 'الكل' &&
      property.governorate !== filters.governorate
    ) {
      return false
    }

    if (filters.furnishing && filters.furnishing !== 'الكل' && property.furnishing !== filters.furnishing) {
      return false
    }

    if (filters.minPrice && property.priceValue < filters.minPrice) {
      return false
    }

    if (filters.maxPrice && property.priceValue > filters.maxPrice) {
      return false
    }

    if (filters.minRooms && property.rooms < filters.minRooms) {
      return false
    }

    if (filters.query) {
      const normalizedQuery = filters.query.trim()

      if (normalizedQuery) {
        const searchText = [
          property.title,
          property.governorate,
          property.district,
          property.neighborhood,
          property.description,
          property.highlight,
          ...property.features,
          ...property.suitableFor,
        ].join(' ')

        if (!searchText.includes(normalizedQuery)) {
          return false
        }
      }
    }

    return true
  })
}