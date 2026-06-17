'use client'

// src/components/Sidebar.tsx
// Dark navy sidebar — matches the Modeky Figma design system

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { ModekyLogo } from './ModekyLogo'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/employees',   label: 'Employees',  icon: Users           },
  { href: '/sites',       label: 'Sites',      icon: MapPin          },
  { href: '/schedules',   label: 'Schedules',  icon: Calendar        },
  { href: '/incidents',   label: 'Incidents',  icon: AlertTriangle   },
  { href: '/reports',     label: 'Reports',    icon: FileText        },
  { href: '/settings',    label: 'Settings',   icon: Settings        },
]

interface SidebarProps {
  companyName?: string
  userEmail?: string
  userName?: string
}

export function Sidebar({ companyName, userEmail, userName }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  // Derive initials from name or email
  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : (userEmail?.[0] ?? 'A').toUpperCase()

  const displayName = userName ?? userEmail ?? 'Admin'

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="flex flex-col h-full w-sidebar"
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* ── Logo ───────────────────────────────────────────────────── */}
      <div
        className="px-5 py-5 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <ModekyLogo size={28} variant="inverted" />
        <div className="min-w-0">
          <span
            className="text-white font-bold text-base leading-none block"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Modeky
          </span>
          {companyName && (
            <span className="text-slate-500 text-[11px] truncate block mt-0.5">
              {companyName}
            </span>
          )}
        </div>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            // Active if pathname starts with href (handles nested routes)
            // But /dashboard should only match exactly to avoid highlighting for all
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={[
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
                style={
                  isActive
                    ? { backgroundColor: '#2563EB' }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.backgroundColor = ''
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── User footer ────────────────────────────────────────────── */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{displayName}</div>
            <div className="text-slate-500 text-[11px]">Company admin</div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-300 text-xs transition-colors mt-1 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
