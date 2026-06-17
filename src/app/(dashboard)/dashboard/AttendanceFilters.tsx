'use client'

// src/app/(dashboard)/dashboard/AttendanceFilters.tsx
// Client component — date/site/employee filter controls

import { useRouter, usePathname } from 'next/navigation'

interface FilterOption { id: string; name: string }

interface AttendanceFiltersProps {
  employees: FilterOption[]
  sites:     FilterOption[]
  currentDate:       string
  currentSiteId?:     string
  currentEmployeeId?: string
}

export function AttendanceFilters({
  employees,
  sites,
  currentDate,
  currentSiteId,
  currentEmployeeId,
}: AttendanceFiltersProps) {
  const router   = useRouter()
  const pathname = usePathname()

  function update(key: string, value: string) {
    const params = new URLSearchParams()
    if (key !== 'date'        && currentDate)       params.set('date',        currentDate)
    if (key !== 'site_id'     && currentSiteId)     params.set('site_id',     currentSiteId)
    if (key !== 'employee_id' && currentEmployeeId) params.set('employee_id', currentEmployeeId)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Date */}
      <input
        type="date"
        defaultValue={currentDate}
        onChange={(e) => update('date', e.target.value)}
        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-colors"
      />

      {/* Site */}
      <select
        defaultValue={currentSiteId ?? ''}
        onChange={(e) => update('site_id', e.target.value)}
        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-colors"
      >
        <option value="">All sites</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Employee */}
      <select
        defaultValue={currentEmployeeId ?? ''}
        onChange={(e) => update('employee_id', e.target.value)}
        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-colors"
      >
        <option value="">All employees</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>
    </div>
  )
}
