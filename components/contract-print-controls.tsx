'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer } from 'lucide-react'

type ContractPrintControlsProps = {
  autoPrint: boolean
}

export function ContractPrintControls({ autoPrint }: ContractPrintControlsProps) {
  useEffect(() => {
    if (!autoPrint) {
      return
    }

    const timer = window.setTimeout(() => {
      window.print()
    }, 320)

    return () => window.clearTimeout(timer)
  }, [autoPrint])

  return (
    <div className="print:hidden flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => window.print()} className="btn-base btn-primary">
        حفظ أو طباعة PDF
        <Printer className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => window.print()} className="btn-base btn-secondary">
        تنزيل العقد
        <Download className="h-4 w-4" />
      </button>
      <Link href="/dashboard" className="btn-base btn-secondary">
        العودة إلى اللوحة
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  )
}