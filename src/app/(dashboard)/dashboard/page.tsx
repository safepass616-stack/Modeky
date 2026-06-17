// src/app/(dashboard)/dashboard/page.tsx
// Modeky dashboard overview — stat cards + attendance table
// Matches the Figma design system exactly

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, UserCheck, Clock, Building } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { AttendanceFilters } from './AttendanceFilters'

// Helper to format time
function fmtTime(ts: string | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface SearchParams {
  date?: string
  site_id?: string
  employee_id?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for company_id
  const { data: profile } = await supabase
    .from('users')
    .select('company_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) redirect('/login')

  const today = searchParams.date ?? new Date().toISOString().split('T')[0]

  // ── Stats queries ─────────────────────────────────────────────────────
  const [
    { count: totalEmployees },
    { count: checkedInCount },
    { count: lateCount },
    { data: sitesData },
    { data: attendanceRows },
    { data: employees },
    { data: sites },
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .eq('is_active', true),

    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`),

    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .gt('minutes_late', 0)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`),

    supabase
      .from('sites')
      .select('id')
      .eq('company_id', profile.company_id),

    // Attendance rows with filters
    supabase
      .from('attendance')
      .select(`
        id, check_in_time, check_out_time, status, minutes_late,
        verification_status, selfie_url,
        employees ( id, name ),
        sites     ( id, name )
      `)
      .eq('company_id', profile.company_id)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`)
      .order('check_in_time', { ascending: false })
      .limit(50),

    supabase
      .from('employees')
      .select('id, name')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .order('name'),

    supabase
      .from('sites')
      .select('id, name')
      .eq('company_id', profile.company_id)
      .order('name'),
  ])

  // Filter client-side for site/employee (avoids complex RPC)
  const filtered = (attendanceRows ?? []).filter((row: any) => {
    if (searchParams.site_id && row.sites?.id !== searchParams.site_id) return false
    if (searchParams.employee_id && row.employees?.id !== searchParams.employee_id) return false
    return true
  })

  // Absent = employees with schedule today but no check-in (simplified: total - checked in)
  const absentCount = Math.max(0, (totalEmployees ?? 0) - (checkedInCount ?? 0))

  // Staffed sites = sites that have at least one check-in today
  const staffedSiteIds = new Set(
    (attendanceRows ?? []).map((r: any) => r.sites?.id).filter(Boolean)
  )
  const totalSites   = sitesData?.length ?? 0
  const staffedSites = staffedSiteIds.size

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const displayName = profile.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {new Date(today).toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Employees"
          value={totalEmployees ?? 0}
          sub="Active field workers"
          icon={Users}
          variant="default"
        />
        <StatCard
          label="Checked In Today"
          value={checkedInCount ?? 0}
          sub={
            totalEmployees
              ? `${Math.round(((checkedInCount ?? 0) / totalEmployees) * 100)}% attendance rate`
              : 'No employees yet'
          }
          icon={UserCheck}
          variant="green"
        />
        <StatCard
          label="Late Today"
          value={lateCount ?? 0}
          sub={lateCount ? 'Arrived after scheduled time' : 'All on time'}
          icon={Clock}
          variant={lateCount ? 'amber' : 'default'}
        />
        <StatCard
          label="Sites Covered"
          value={`${staffedSites}/${totalSites}`}
          sub={
            staffedSites < totalSites
              ? `${totalSites - staffedSites} site${totalSites - staffedSites > 1 ? 's' : ''} with no check-ins`
              : 'All sites staffed'
          }
          icon={Building}
          variant={staffedSites < totalSites ? 'red' : 'green'}
        />
      </div>

      {/* ── Attendance table ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3
              className="font-bold text-slate-900 text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Attendance — {today}
            </h3>
            <span className="flex items-center gap-1 text-[11px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
            <span>{checkedInCount ?? 0} present</span>
            <span>·</span>
            <span>{absentCount} absent</span>
            <span>·</span>
            <span>{lateCount ?? 0} late</span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50">
          <AttendanceFilters
            employees={employees ?? []}
            sites={sites ?? []}
            currentDate={today}
            currentSiteId={searchParams.site_id}
            currentEmployeeId={searchParams.employee_id}
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UserCheck className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No attendance records for the selected filters</p>
            <p className="text-xs text-slate-300 mt-1">
              Employees check in by sending <strong>START</strong> on WhatsApp
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  {['Employee', 'Site', 'Check-in', 'Check-out', 'Late', 'Status', ''].map((h) => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row: any) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0"
                  >
                    {/* Employee */}
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                          {(row.employees?.name?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{row.employees?.name ?? '—'}</span>
                      </div>
                    </td>

                    {/* Site */}
                    <td className="td text-slate-500">{row.sites?.name ?? '—'}</td>

                    {/* Check-in */}
                    <td className="td text-slate-700" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {fmtTime(row.check_in_time)}
                    </td>

                    {/* Check-out */}
                    <td className="td text-slate-400" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {row.check_out_time ? fmtTime(row.check_out_time) : '—'}
                    </td>

                    {/* Minutes late */}
                    <td className="td">
                      {row.minutes_late > 0 ? (
                        <span className="text-amber-600 font-semibold text-xs">
                          +{row.minutes_late}m
                        </span>
                      ) : (
                        <span className="text-green-500 text-xs">On time</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="td">
                      <StatusBadge status={row.verification_status ?? row.status ?? 'present'} />
                    </td>

                    {/* Actions */}
                    <td className="td">
                      <a
                        href={`/attendance/${row.id}`}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
