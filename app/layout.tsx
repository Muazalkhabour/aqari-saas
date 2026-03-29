import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Cairo } from 'next/font/google'
import { GlobalProtectedHeader } from '@/components/global-protected-header'
import { SiteFooter } from '@/components/site-footer'
import 'leaflet/dist/leaflet.css'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'عقاري سوريا',
  description: 'منصة عربية لعرض العقارات وإدارتها في السوق السوري.',
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
        </div>
      </body>
    </html>
  )
}