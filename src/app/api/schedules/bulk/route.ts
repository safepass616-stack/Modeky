// src/app/api/schedules/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { dates, employeeIds, siteId, startTime, endTime } = await req.json()
  if (!dates?.length || !employeeIds?.length || !siteId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check existing schedules to avoid duplicates
  const { data: existing } = await supabase
    .from('schedules')
    .select('employee_id, shift_date')
    .eq('company_id', profile.company_id)
    .in('shift_date', dates)
    .in('employee_id', employeeIds)

  const existingSet = new Set((existing ?? []).map((r: any) => `${r.employee_id}:${r.shift_date}`))

  const toInsert = []
  for (const date of dates) {
    for (const empId of employeeIds) {
      if (!existingSet.has(`${empId}:${date}`)) {
        toInsert.push({
          company_id:  profile.company_id,
          employee_id: empId,
          site_id:     siteId,
          shift_date:  date,
          start_time:  startTime,
          end_time:    endTime,
          status:      'scheduled' as const,
        })
      }
    }
  }

  const skipped = dates.length * employeeIds.length - toInsert.length

  if (toInsert.length > 0) {
    const { error } = await supabase.from('schedules').insert(toInsert)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ created: toInsert.length, skipped })
}
