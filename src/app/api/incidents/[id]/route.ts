// src/app/api/incidents/[id]/route.ts
// PATCH — update incident status, severity, resolution note

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('company_id, id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id)
    return NextResponse.json({ error: 'No company' }, { status: 403 })

  const body = await req.json()
  const { status, severity, resolution_note, resolved_at } = body

  // Build update object with proper typing
  const updateData: Record<string, any> = {}
  if (status) updateData.status = status
  if (severity) updateData.severity = severity
  if (resolution_note) updateData.resolution_note = resolution_note
  if (resolved_at) updateData.resolved_at = resolved_at
  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_by = profile.id
  }

  // Only allow updating incidents that belong to this company (RLS also enforces this)
  const query = supabase
    .from('incidents') as any
  const result = await query
    .update(updateData)
    .eq('id', params.id)
    .eq('company_id', profile.company_id)
  
  const { error } = result

  if (error) {
    console.error('Incident update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
