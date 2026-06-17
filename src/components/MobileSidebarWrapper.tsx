'use client'

// src/components/MobileSidebarWrapper.tsx
// Handles mobile sidebar open/close state — client component only

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface Props {
  companyName?: string
  userName?: string
  userEmail?: string
}

export function MobileSidebarWrapper({ companyName, userName, userEmail }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button in topbar */}
      <button
        className="md:hidden fixed top-3 left-4 z-50 p-1.5 text-slate-500 hover:text-slate-700 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 md:hidden flex flex-col transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ width: '15rem' }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>

        <Sidebar
          companyName={companyName}
          userName={userName}
          userEmail={userEmail}
        />
      </div>
    </>
  )
}
