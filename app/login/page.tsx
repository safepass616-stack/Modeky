// src/app/login/page.tsx
// Modeky login page — dark navy hero + centred white card

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LoginForm } from './LoginForm'
import { ModekyLogo } from '@/components/ModekyLogo'

export default async function LoginPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Blue glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Logo + wordmark */}
      <div className="relative flex flex-col items-center mb-8">
        <ModekyLogo size={40} variant="inverted" />
        <h1
          className="text-white text-2xl font-bold mt-3 tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Modeky
        </h1>
        <p className="text-slate-400 text-sm mt-1">The WhatsApp Workforce Operating System</p>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h2
          className="text-lg font-bold text-slate-900 mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Sign in
        </h2>
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="relative text-slate-600 text-xs mt-8">
        © {new Date().getFullYear()} Modeky. All rights reserved.
      </p>
    </div>
  )
}
