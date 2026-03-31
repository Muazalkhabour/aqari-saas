import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Cairo } from 'next/font/google'
import { GlobalProtectedHeader } from '@/components/global-protected-header'
import { ScrollToTopButton } from '@/components/scroll-to-top-button'
import { SiteFooter } from '@/components/site-footer'
import { getSiteUrl } from '@/lib/env'
import 'leaflet/dist/leaflet.css'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })
const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'عقاري سوريا',
    template: '%s | عقاري سوريا',
  },
  description: 'منصة عربية لاكتشاف العقارات ومتابعة أحدث العروض وإدارة التجربة العقارية في السوق السوري.',
  applicationName: 'عقاري سوريا',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    url: siteUrl,
    siteName: 'عقاري سوريا',
    title: 'عقاري سوريا',
    description: 'اكتشف أحدث العروض العقارية في سوريا وشارك الصفحات بروابط جاهزة وصور معاينة محسنة.',
    images: [
      {
        url: '/listings/interior-luxury-1.svg',
        width: 1200,
        height: 630,
        alt: 'واجهة عقاري سوريا لاستعراض أحدث العروض العقارية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عقاري سوريا',
    description: 'اكتشف أحدث العروض العقارية في سوريا وشارك الصفحات بروابط جاهزة وصور معاينة محسنة.',
    images: ['/listings/interior-luxury-1.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${cairo.className} min-h-screen antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <GlobalProtectedHeader />
          </Suspense>
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <ScrollToTopButton />
        </div>
      </body>
    </html>
  )
}