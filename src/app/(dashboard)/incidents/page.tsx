// src/app/(dashboard)/incidents/page.tsx
// Incidents dashboard — list, media preview, status management

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { IncidentStatusUpdater } from './IncidentStatusUpdater'

function severityIcon(severity: string) {
  const base = 'w-4 h-4'
  if (severity === 'critical') return <ShieldAlert className={`${base} text-red-600`} />
  if (severity === 'high')     return <AlertTriangle className={`${base} text-red-500`} />
  if (severity === 'medium')   return <AlertTriangle className={`${base} text-amber-500`} />
  return <AlertTriangle className={`${base} text-slate-400`} />
}

function severityBg(severity: string) {
  if (severity === 'critical') return 'bg-red-100'
  if (severity === 'high')     return 'bg-red-50'
  if (severity === 'medium')   return 'bg-amber-50'
  return 'bg-slate-50'
}

function humaniseCategory(c: string) {
  const map: Record<string, string> = {
    injury:        'Injury / Medical',
    safety_hazard: 'Safety Hazard',
    equipment:     'Equipment Failure',
    security:      'Security Breach',
    fire:          'Fire / Emergency',
    theft:         'Theft / Vandalism',
    other:         'Other',
  }
  return map[c] ?? c
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface SearchParams { status?: string; severity?: string }

export default async function IncidentsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()
  if (!profile?.company_id) redirect('/login')

  // Build query with optional filters
  let query = supabase
    .from('incidents')
    .select(`
      id, category, description, severity, status,
      media_urls, latitude, longitude,
      created_at, resolved_at, resolution_note,
      employees ( id, full_name ),
      sites     ( id, site_name )
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.status)   query = (query as any).eq('status', searchParams.status)
  if (searchParams.severity) query = (query as any).eq('severity', searchParams.severity)

  const { data: incidents } = await query

  // Summary counts
  const { data: counts } = await supabase
    .from('incidents')
    .select('status')
    .eq('company_id', profile.company_id)

  const open     = counts?.filter(r => r.status === 'open').length     ?? 0
  const inReview = counts?.filter(r => r.status === 'in_review').length ?? 0
  const resolved = counts?.filter(r => r.status === 'resolved').length  ?? 0
  const total    = counts?.length ?? 0

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Incidents
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Reported by field employees via WhatsApp</p>
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: total,    icon: AlertTriangle,  color: 'text-slate-700', bg: 'bg-slate-50',  iconColor: 'text-slate-400' },
          { label: 'Open',      value: open,      icon: AlertTriangle,  color: 'text-red-700',   bg: 'bg-red-50',    iconColor: 'text-red-500' },
          { label: 'In Review', value: inReview,  icon: Clock,          color: 'text-amber-700', bg: 'bg-amber-50',  iconColor: 'text-amber-500' },
          { label: 'Resolved',  value: resolved,  icon: CheckCircle2,   color: 'text-green-700', bg: 'bg-green-50',  iconColor: 'text-green-500' },
        ].map(({ label, value, icon: Icon, color, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-0.5 ${color}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {value}
            </div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: 'All',       href: '/incidents' },
          { label: 'Open',      href: '/incidents?status=open' },
          { label: 'In Review', href: '/incidents?status=in_review' },
          { label: 'Resolved',  href: '/incidents?status=resolved' },
        ].map(({ label, href }) => {
          const isActive = !searchParams.status
            ? href === '/incidents'
            : href.includes(searchParams.status ?? '')
          return (
            <a
              key={label}
              href={href}
              className={[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300',
              ].join(' ')}
            >
              {label}
            </a>
          )
        })}
      </div>

      {/* ── Incident list ─────────────────────────────────────────────── */}
      {!incidents?.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-card">
          <AlertTriangle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No incidents reported yet</p>
          <p className="text-xs text-slate-300 mt-1">
            Employees can report incidents by sending <strong>INCIDENT</strong> on WhatsApp
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc: any) => (
            <div
              key={inc.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Severity icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${severityBg(inc.severity)}`}>
                  {severityIcon(inc.severity)}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                        {humaniseCategory(inc.category)}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {inc.employees?.full_name ?? '—'}
                        {inc.sites?.site_name ? ` · ${inc.sites.site_name}` : ''}
                        {' · '}
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtDate(inc.created_at)}</span>
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge
                        status={inc.severity}
                        variant={
                          inc.severity === 'critical' || inc.severity === 'high' ? 'red'
                          : inc.severity === 'medium' ? 'amber'
                          : 'slate'
                        }
                      />
                      <StatusBadge
                        status={inc.status === 'in_review' ? 'In Review' : inc.status === 'open' ? 'Open' : inc.status === 'resolved' ? 'Resolved' : inc.status}
                        variant={
                          inc.status === 'open' ? 'red'
                          : inc.status === 'in_review' ? 'amber'
                          : inc.status === 'resolved' ? 'green'
                          : 'slate'
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {inc.description && (
                    <p className="text-slate-600 text-sm mt-2 leading-relaxed line-clamp-2">
                      {inc.description}
                    </p>
                  )}

                  {/* Media thumbnails */}
                  {inc.media_urls?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {inc.media_urls.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-16 h-16 rounded-xl overflow-hidden border border-slate-100 hover:border-blue-300 transition-colors flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Incident photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Resolution note */}
                  {inc.resolution_note && (
                    <div className="mt-3 px-3 py-2 bg-green-50 rounded-lg border border-green-100 text-xs text-green-700">
                      <span className="font-semibold">Resolution:</span> {inc.resolution_note}
                    </div>
                  )}

                  {/* Status updater */}
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <IncidentStatusUpdater
                      incidentId={inc.id}
                      currentStatus={inc.status}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
