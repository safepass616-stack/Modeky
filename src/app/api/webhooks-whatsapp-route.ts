// src/app/api/webhooks/whatsapp/route.ts
// Modeky WhatsApp Session Engine — Meta Cloud API
// Flows: checkin (START→location→selfie) | incident (INCIDENT→category→description→photo)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return createClient(url, key)
}
function waToken()    { return process.env.WHATSAPP_ACCESS_TOKEN as string }
function waPhoneId()  { return process.env.WHATSAPP_PHONE_NUMBER_ID as string }
function verifyToken(){ return process.env.WHATSAPP_VERIFY_TOKEN as string }

// ── Webhook verification (GET) ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (
    searchParams.get('hub.mode')         === 'subscribe' &&
    searchParams.get('hub.verify_token') === verifyToken()
  ) {
    return new NextResponse(searchParams.get('hub.challenge'), { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// ── Webhook receiver (POST) ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  processAsync(body).catch(console.error)
  return NextResponse.json({ status: 'ok' })
}

// ═════════════════════════════════════════════════════════════════════════
// ASYNC PROCESSOR
// ═════════════════════════════════════════════════════════════════════════
async function processAsync(body: any) {
  const supabase = getSupabase()
  const entry   = body?.entry?.[0]
  const changes = entry?.changes?.[0]
  const value   = changes?.value
  const msg     = value?.messages?.[0]
  if (!msg) return

  const from = msg.from
  const type = msg.type

  const normalised = normalisePhone(from)
  const { data: employee } = await supabase
    .from('employees')
    .select('id, company_id, full_name, status')
    .eq('phone_number', normalised)
    .single()

  if (!employee) {
    await sendText(from, "❌ Your number isn't registered on Modeky. Contact your manager.")
    return
  }
  if (employee.status !== 'active') {
    await sendText(from, 'Your account is inactive. Contact your manager.')
    return
  }

  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('employee_id', employee.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const text = msg.text?.body?.trim().toUpperCase() ?? ''

  if (text === 'START') { await handleCheckinStart(from, employee); return }
  if (text === 'END')   { await handleCheckout(from, employee);     return }
  if (text === 'INCIDENT') { await handleIncidentStart(from, employee); return }
  if (text === 'HELP') {
    await sendText(from,
      '*Modeky Commands*\n\n' +
      '*START* — Check in for your shift\n' +
      '*END* — Check out at end of shift\n' +
      '*INCIDENT* — Report an incident\n' +
      '*HELP* — Show this menu'
    )
    return
  }

  if (!session) return
  if (session.session_type === 'checkin')  await routeCheckinStep(from, employee, session, msg, type)
  if (session.session_type === 'incident') await routeIncidentStep(from, employee, session, msg, type, text)
}

// ═════════════════════════════════════════════════════════════════════════
// CHECKIN FLOW
// ═════════════════════════════════════════════════════════════════════════

async function handleCheckinStart(from: string, employee: any) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, checkin_time')
    .eq('employee_id', employee.id)
    .eq('attendance_date', today)
    .not('checkin_time', 'is', null)
    .single()

  if (existing) {
    const t = new Date(existing.checkin_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    await sendText(from, `✅ You already checked in today at *${t}*.\n\nSend *END* to check out.`)
    return
  }

  await upsertSession(employee, { session_type: 'checkin', current_step: 'awaiting_location', metadata: {} })

  const name = employee.full_name.split(' ')[0]
  await sendText(from,
    `👋 Hi *${name}*! Let's get you checked in.\n\n` +
    `📍 Please share your *current location*.\n\n` +
    `Tap the *📎 paperclip* → *Location* → *Send your current location*.`
  )
}

async function routeCheckinStep(from: string, employee: any, session: any, msg: any, type: string) {
  const supabase = getSupabase()

  if (session.current_step === 'awaiting_location') {
    if (type !== 'location') {
      await sendText(from, '📍 Please share your GPS location to continue check-in.')
      return
    }
    const lat = msg.location.latitude
    const lng = msg.location.longitude

    const { data: sites } = await supabase
      .from('sites')
      .select('id, site_name, latitude, longitude, radius_meters')
      .eq('company_id', employee.company_id)

    const nearest = findNearestSite(lat, lng, sites ?? [])

    await upsertSession(employee, {
      session_type: 'checkin',
      current_step: 'awaiting_selfie',
      metadata: {
        latitude:      lat,
        longitude:     lng,
        site_id:       nearest?.site?.id ?? null,
        site_name:     nearest?.site?.site_name ?? null,
        within_radius: nearest ? nearest.distance <= nearest.site.radius_meters : false,
      },
    })

    const locationMsg = nearest
      ? `📍 *${nearest.site.site_name}* (${Math.round(nearest.distance)}m away)`
      : '📍 Location noted (no site nearby)'

    await sendText(from, `${locationMsg}\n\n📸 Now please send a *selfie* to complete your check-in.`)
    return
  }

  if (session.current_step === 'awaiting_selfie') {
    if (type !== 'image') {
      await sendText(from, '📸 Please send a selfie photo to complete check-in.')
      return
    }

    const selfieUrl = await downloadAndStoreMedia(msg.image.id, employee, 'selfie')
    const meta      = session.metadata ?? {}

    let verificationStatus = 'verified'
    if (!meta.latitude)           verificationStatus = 'missing_gps'
    else if (!selfieUrl)          verificationStatus = 'missing_selfie'
    else if (!meta.within_radius) verificationStatus = 'outside_site'

    const today = new Date().toISOString().split('T')[0]
    const { data: schedule } = await supabase
      .from('schedules')
      .select('id, start_time')
      .eq('employee_id', employee.id)
      .eq('shift_date', today)
      .eq('status', 'scheduled')
      .single()

    let minutesLate: number | null = null
    let attendanceStatus = 'present'
    const now = new Date()

    if (schedule) {
      const [h, m] = schedule.start_time.split(':').map(Number)
      const scheduled = new Date(now)
      scheduled.setHours(h, m, 0, 0)
      const diffMins = Math.floor((now.getTime() - scheduled.getTime()) / 60000)
      if (diffMins > 5) { minutesLate = diffMins; attendanceStatus = 'late' }
    }

    const { data: attendance, error: attErr } = await supabase
      .from('attendance')
      .insert({
        company_id:          employee.company_id,
        employee_id:         employee.id,
        site_id:             meta.site_id ?? null,
        checkin_time:        now.toISOString(),
        checkin_latitude:    meta.latitude ?? null,
        checkin_longitude:   meta.longitude ?? null,
        selfie_url:          selfieUrl,
        status:              attendanceStatus,
        attendance_date:     today,
        schedule_id:         schedule?.id ?? null,
        minutes_late:        minutesLate,
        verification_status: verificationStatus,
      })
      .select('id')
      .single()

    if (attErr) {
      console.error('Attendance insert error:', attErr)
      await sendText(from, '⚠️ Something went wrong recording your check-in. Please try again.')
      return
    }

    await upsertSession(employee, {
      session_type: 'checkin',
      current_step: 'idle',
      metadata: { last_attendance_id: attendance?.id },
    })

    const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    const lateMsg = minutesLate ? `\n⏰ *${minutesLate} minutes late*` : ''
    const siteMsg = meta.site_name ? `\n📍 *${meta.site_name}*` : ''
    const vMsg    = verificationStatus !== 'verified'
      ? `\n⚠️ ${humaniseVerification(verificationStatus)}`
      : '\n✅ GPS & selfie verified'

    await sendText(from,
      `✅ *Checked in at ${timeStr}*${siteMsg}${lateMsg}${vMsg}\n\n` +
      `Send *END* when your shift is complete.\nSend *INCIDENT* to report an issue.`
    )
  }
}

// ═════════════════════════════════════════════════════════════════════════
// CHECKOUT
// ═════════════════════════════════════════════════════════════════════════

async function handleCheckout(from: string, employee: any) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const { data: record } = await supabase
    .from('attendance')
    .select('id, checkin_time, checkout_time')
    .eq('employee_id', employee.id)
    .eq('attendance_date', today)
    .not('checkin_time', 'is', null)
    .is('checkout_time', null)
    .single()

  if (!record) {
    await sendText(from, "You haven't checked in today. Send *START* to check in.")
    return
  }

  const now = new Date()
  const hours = ((now.getTime() - new Date(record.checkin_time).getTime()) / 3_600_000).toFixed(1)

  await supabase
    .from('attendance')
    .update({ checkout_time: now.toISOString(), status: 'checked_out' })
    .eq('id', record.id)

  await upsertSession(employee, { session_type: 'checkin', current_step: 'idle', metadata: {} })

  const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  await sendText(from, `👋 *Checked out at ${timeStr}*\n⏱ Shift duration: *${hours} hours*\n\nHave a safe journey home!`)
}

// ═════════════════════════════════════════════════════════════════════════
// INCIDENT FLOW
// ═════════════════════════════════════════════════════════════════════════

const INCIDENT_CATEGORIES: Record<string, string> = {
  '1': 'injury', '2': 'safety_hazard', '3': 'equipment',
  '4': 'security', '5': 'fire', '6': 'theft', '7': 'other',
}

async function handleIncidentStart(from: string, employee: any) {
  await upsertSession(employee, { session_type: 'incident', current_step: 'awaiting_category', metadata: {} })
  await sendText(from,
    '🚨 *Incident Report*\n\n' +
    'What type of incident are you reporting?\n\n' +
    '1 — Injury / Medical\n2 — Safety Hazard\n3 — Equipment Failure\n' +
    '4 — Security Breach\n5 — Fire / Emergency\n6 — Theft / Vandalism\n7 — Other\n\n' +
    'Reply with a number (1–7).'
  )
}

async function routeIncidentStep(
  from: string, employee: any, session: any,
  msg: any, type: string, text: string
) {
  const supabase = getSupabase()
  const meta = session.metadata ?? {}

  if (session.current_step === 'awaiting_category') {
    const category = INCIDENT_CATEGORIES[text]
    if (!category) { await sendText(from, 'Please reply with a number between 1 and 7.'); return }
    await upsertSession(employee, { session_type: 'incident', current_step: 'awaiting_description', metadata: { ...meta, category } })
    await sendText(from, `📝 *${humaniseCategory(category)}*\n\nPlease describe what happened.\n\n_(Type your description and send)_`)
    return
  }

  if (session.current_step === 'awaiting_description') {
    if (type !== 'text' || text.length < 5) { await sendText(from, 'Please type a description of the incident.'); return }
    await upsertSession(employee, { session_type: 'incident', current_step: 'awaiting_location', metadata: { ...meta, description: msg.text.body.trim() } })
    await sendText(from, '📍 Please share your *current location* so we know where this happened.\n\nTap *📎* → *Location* → *Send your current location*.')
    return
  }

  if (session.current_step === 'awaiting_location') {
    if (type !== 'location') { await sendText(from, '📍 Please share your location.'); return }
    const { data: sites } = await supabase
      .from('sites').select('id, site_name, latitude, longitude, radius_meters').eq('company_id', employee.company_id)
    const nearest = findNearestSite(msg.location.latitude, msg.location.longitude, sites ?? [])
    await upsertSession(employee, {
      session_type: 'incident', current_step: 'awaiting_photo',
      metadata: { ...meta, latitude: msg.location.latitude, longitude: msg.location.longitude, site_id: nearest?.site?.id ?? null },
    })
    await sendText(from, '📸 Almost done. Send a *photo* of the incident if you have one.\n\n_(Send a photo, or type *SKIP* to submit without a photo)_')
    return
  }

  if (session.current_step === 'awaiting_photo') {
    let mediaUrls: string[] = meta.media_urls ?? []
    if (type === 'image') {
      const url = await downloadAndStoreMedia(msg.image.id, employee, 'incident')
      if (url) mediaUrls = [...mediaUrls, url]
    } else if (text !== 'SKIP' && text !== 'DONE') {
      await sendText(from, 'Send a photo of the incident, or type *SKIP* to submit.')
      return
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        company_id:  employee.company_id,
        employee_id: employee.id,
        site_id:     meta.site_id ?? null,
        category:    meta.category,
        description: meta.description,
        media_urls:  mediaUrls,
        latitude:    meta.latitude ?? null,
        longitude:   meta.longitude ?? null,
        severity:    'medium',
        status:      'open',
        session_id:  session.id,
      })
      .select('id')
      .single()

    if (error) { console.error('Incident insert error:', error); await sendText(from, '⚠️ Failed to save your report. Please try again.'); return }

    await upsertSession(employee, { session_type: 'incident', current_step: 'idle', metadata: {} })

    await sendText(from,
      `✅ *Incident report submitted!*\n\n` +
      `📋 Category: *${humaniseCategory(meta.category)}*\n` +
      `🔢 Ref: #${(incident?.id ?? '').slice(0, 8).toUpperCase()}\n\n` +
      `Your manager has been notified. Stay safe!\n\nSend *START* to check in or *HELP* for commands.`
    )
  }
}

// ═════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════

function normalisePhone(raw: string): string {
  let n = raw.replace(/\D/g, '')
  if (n.startsWith('00')) n = n.slice(2)
  return `+${n}`
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findNearestSite(lat: number, lng: number, sites: any[]) {
  if (!sites.length) return null
  let nearest = null; let minDist = Infinity
  for (const site of sites) {
    const d = haversineDistance(lat, lng, site.latitude, site.longitude)
    if (d < minDist) { minDist = d; nearest = site }
  }
  return nearest ? { site: nearest, distance: minDist } : null
}

async function upsertSession(employee: any, fields: { session_type: string; current_step: string; metadata: Record<string, any> }) {
  const supabase = getSupabase()
  await supabase
    .from('whatsapp_sessions')
    .upsert(
      { employee_id: employee.id, company_id: employee.company_id, ...fields, state: fields.current_step, updated_at: new Date().toISOString() },
      { onConflict: 'employee_id' }
    )
}

async function downloadAndStoreMedia(mediaId: string, employee: any, type: 'selfie' | 'incident'): Promise<string | null> {
  const supabase = getSupabase()
  try {
    const urlRes = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, { headers: { Authorization: `Bearer ${waToken()}` } })
    const urlData = await urlRes.json()
    if (!urlData.url) return null
    const fileRes = await fetch(urlData.url, { headers: { Authorization: `Bearer ${waToken()}` } })
    const buffer = await fileRes.arrayBuffer()
    const contentType = fileRes.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : 'jpg'
    const bucket = type === 'selfie' ? 'selfies' : 'incident-media'
    const path = `${employee.company_id}/${employee.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType, upsert: false })
    if (error) { console.error('Storage upload error:', error); return null }
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  } catch (err) {
    console.error('Media download error:', err); return null
  }
}

async function sendText(to: string, text: string) {
  await fetch(`https://graph.facebook.com/v19.0/${waPhoneId()}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${waToken()}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
  })
}

function humaniseVerification(v: string): string {
  return ({ outside_site: 'You were outside the expected site radius', missing_selfie: 'Selfie could not be saved', missing_gps: 'Location was not captured' } as Record<string,string>)[v] ?? v
}

function humaniseCategory(c: string): string {
  return ({ injury: 'Injury / Medical', safety_hazard: 'Safety Hazard', equipment: 'Equipment Failure', security: 'Security Breach', fire: 'Fire / Emergency', theft: 'Theft / Vandalism', other: 'Other' } as Record<string,string>)[c] ?? c
}
