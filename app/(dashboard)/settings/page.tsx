// src/app/(dashboard)/settings/page.tsx
// Placeholder — company-level settings (subscription, branding, roles).

import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Company profile, subscription, and team management
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-16 text-center">
        <Settings className="w-8 h-8 text-slate-200 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-400">Settings page is coming soon</p>
        <p className="text-xs text-slate-300 mt-1">
          Company details, subscription plan, and user roles will live here
        </p>
      </div>
    </div>
  )
}
