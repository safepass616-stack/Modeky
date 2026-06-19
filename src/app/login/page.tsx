// src/app/login/page.tsx
// Modeky login page — light background matching the landing page,
// blue accent colour kept consistent with "Get Started" / brand identity

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
      style={{ backgroundColor: '#F8FAFC' }}
    >
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft blue glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative flex flex-col items-center mb-8">
        <ModekyLogo size={40} variant="default" />
        <p className="text-slate-500 text-sm mt-2">The WhatsApp Workforce Operating System</p>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <h2
          className="text-lg font-bold text-slate-900 mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Sign in
        </h2>
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="relative text-slate-400 text-xs mt-8">
        © {new Date().getFullYear()} Modeky. All rights reserved.
      </p>
    </div>
  )
}
