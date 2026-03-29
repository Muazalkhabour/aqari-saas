'use client'

import { usePathname } from 'next/navigation'
import { DeveloperCredit } from '@/components/developer-credit'

export function SiteFooter() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  return (
    <footer className="border-t border-slate-900/10 bg-white/70 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DeveloperCredit />
      </div>
    </footer>
  )
}