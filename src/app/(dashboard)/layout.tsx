// src/app/(dashboard)/layout.tsx
// Full Modeky dashboard shell — dark sidebar + white topbar + light content area

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/Sidebar'
import { MobileSidebarWrapper } from '@/components/MobileSidebarWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch company name + user display name
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, company_id')
    .eq('id', user.id)
    .single()

  let companyName: string | undefined
  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single()
    companyName = company?.name
  }

  const userName = profile?.full_name ?? undefined
  const userEmail = user.email ?? undefined

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#F8FAFC', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Desktop sidebar (always visible ≥ md) ─────────────────────── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          companyName={companyName}
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      {/* ── Mobile sidebar (drawer) ───────────────────────────────────── */}
      <MobileSidebarWrapper
        companyName={companyName}
        userName={userName}
        userEmail={userEmail}
      />

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-4 flex-shrink-0">
          {/* Mobile menu button injected by MobileSidebarWrapper */}
          <div id="mobile-menu-trigger" className="md:hidden" />

          {/* Company name — left of topbar */}
          <div className="flex-1">
            {companyName && (
              <span className="text-sm font-semibold text-slate-700">
                {companyName}
              </span>
            )}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>

            {/* User email */}
            <span className="hidden sm:block text-xs text-slate-500 truncate max-w-[180px]">
              {userName ?? userEmail}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
