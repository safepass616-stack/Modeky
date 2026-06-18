// src/app/api/import/sites/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { rows } = await req.json()
  const results = []

  for (const row of rows) {
    const lat = parseFloat(row.latitude)
    const lng = parseFloat(row.longitude)
    if (!row.site_name || isNaN(lat) || isNaN(lng)) {
      results.push({ row, success: false, error: 'Missing site name, latitude, or longitude' })
      continue
    }
    const { error } = await supabase.from('sites').insert({
      company_id:    profile.company_id,
      site_name:     row.site_name.trim(),
      client_name:   row.client_name?.trim() || null,
      address:       row.address?.trim() || null,
      latitude:      lat,
      longitude:     lng,
      radius_meters: parseInt(row.radius_meters ?? '150') || 150,
    })
    results.push(error ? { row, success: false, error: error.message } : { row, success: true })
  }

  return NextResponse.json({ results })
}
