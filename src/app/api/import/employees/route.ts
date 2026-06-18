// src/app/api/import/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  return `+${digits}`
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })

  const { rows } = await req.json()
  const results = []

  for (const row of rows) {
    const phone = normalizePhone(row.phone_number ?? '')
    if (!row.full_name || phone === '+') {
      results.push({ row, success: false, error: 'Missing name or phone' })
      continue
    }
    const { error } = await supabase.from('employees').insert({
      company_id:    profile.company_id,
      full_name:     row.full_name.trim(),
      phone_number:  phone,
      employee_code: row.employee_code?.trim() || null,
      status:        'active',
    })
    if (error) {
      results.push({ row, success: false, error: error.code === '23505' ? 'Phone number already exists' : error.message })
    } else {
      results.push({ row, success: true })
    }
  }

  return NextResponse.json({ results })
}
