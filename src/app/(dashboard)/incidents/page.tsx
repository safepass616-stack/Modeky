// src/app/(dashboard)/incidents/page.tsx
// Placeholder — full incident reporting lands in Week 2 of the roadmap.

import { AlertTriangle } from 'lucide-react'

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Incidents
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Site incidents reported by employees via WhatsApp
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-16 text-center">
        <AlertTriangle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-400">Incident reporting is coming soon</p>
        <p className="text-xs text-slate-300 mt-1">
          Employees will be able to report incidents right after checking in on WhatsApp
        </p>
      </div>
    </div>
  )
}
