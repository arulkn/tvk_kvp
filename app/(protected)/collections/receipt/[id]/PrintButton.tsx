'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center justify-center h-8 gap-1.5 px-3 rounded-lg text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
    >
      <Printer className="w-4 h-4" /> Print Receipt
    </button>
  )
}
