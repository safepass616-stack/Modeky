// src/app/(dashboard)/incidents/page.tsx
// Incidents reported by employees via WhatsApp, right after check-in.

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Camera, Mic, FileText } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { IncidentStatusControl } from './IncidentStatusControl'

function fmtDateTime(ts: string): string {
  return new Date(ts).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface SearchParams {
  status?: string
  site_id?: string
  employee_id?: string
}

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) redirect('/login')

  let query = supabase
    .from('incidents')
    .select(`
      id, description, media_url, media_type, status, created_at,
      employees ( id, full_name ),
      sites     ( id, site_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.status) {
    query = query.eq('status', searchParams.status as 'open' | 'reviewed' | 'resolved')
  }
  if (searchParams.site_id) {
    query = query.eq('site_id', searchParams.site_id)
  }
  if (searchParams.employee_id) {
    query = query.eq('employee_id', searchParams.employee_id)
  }

  const [{ data: incidents }, { data: employees }, { data: sites }] = await Promise.all([
    query,
    supabase.from('employees').select('id, full_name').eq('status', 'active').order('full_name'),
    supabase.from('sites').select('id, site_name').order('site_name'),
  ])

  const openCount = (incidents ?? []).filter((i: any) => i.status === 'open').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Incidents
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Reported by employees via WhatsApp, right after check-in
          </p>
        </div>
        {openCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            {openCount} open
          </span>
        )}
      </div>

      {/* Filters */}
      <form method="get" className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={searchParams.status ?? ''} className="input">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="label">Site</label>
          <select name="site_id" defaultValue={searchParams.site_id ?? ''} className="input">
            <option value="">All sites</option>
            {(sites ?? []).map((s: any) => (
              <option key={s.id} value={s.id}>{s.site_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Employee</label>
          <select name="employee_id" defaultValue={searchParams.employee_id ?? ''} className="input">
            <option value="">All employees</option>
            {(employees ?? []).map((e: any) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      {/* List */}
      {(incidents ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-16 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No incidents reported</p>
          <p className="text-xs text-slate-300 mt-1">
            Employees can report incidents right after checking in on WhatsApp
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(incidents ?? []).map((incident: any) => (
            <div
              key={incident.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-sm text-slate-800">
                    {incident.employees?.full_name ?? 'Unknown employee'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{incident.sites?.site_name ?? 'No site'}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{fmtDateTime(incident.created_at)}</span>
                </div>

                {incident.description && (
                  <p className="text-sm text-slate-600 mb-2">{incident.description}</p>
                )}

                {incident.media_type === 'photo' && incident.media_url && (
                  <a href={incident.media_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2">
                    <Camera className="w-3.5 h-3.5" /> View photo
                  </a>
                )}

                {incident.media_type === 'voice' && incident.media_url && (
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-3.5 h-3.5 text-slate-400" />
                    <audio controls src={incident.media_url} className="h-8" />
                  </div>
                )}

                {!incident.description && !incident.media_url && (
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> No details provided
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={incident.status} />
                <IncidentStatusControl incidentId={incident.id} initialStatus={incident.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

