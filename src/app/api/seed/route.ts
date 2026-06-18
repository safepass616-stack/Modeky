// src/app/api/seed/route.ts
// Populates the app with realistic demo data for one company
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!profile?.company_id) return NextResponse.json({ error: 'No company' }, { status: 403 })
  const cid = profile.company_id

  // ── Sites ────────────────────────────────────────────────────────────
  const sitesData = [
    { site_name: 'Head Office',     client_name: 'Modeky HQ',      address: '1 Tech Park, Sandton',    latitude: -26.1070, longitude: 28.0567, radius_meters: 150 },
    { site_name: 'Warehouse Alpha', client_name: 'Logistics Co',    address: '45 Industrial Ave',       latitude: -26.2041, longitude: 28.0473, radius_meters: 200 },
    { site_name: 'Retail Centre',   client_name: 'Mall Security',   address: 'Sandton City, Level 3',   latitude: -26.1073, longitude: 28.0566, radius_meters: 100 },
    { site_name: 'Airport Gate B',  client_name: 'OR Tambo Sec',    address: 'OR Tambo International',  latitude: -26.1367, longitude: 28.2411, radius_meters: 250 },
    { site_name: 'Hospital Wing C', client_name: 'Netcare Rosebank', address: '14 Sturdee Ave, Rosebank', latitude: -26.1448, longitude: 28.0427, radius_meters: 120 },
  ]

  const { data: sites, error: siteErr } = await supabase
    .from('sites').insert(sitesData.map(s => ({ ...s, company_id: cid }))).select('id, site_name')
  if (siteErr && siteErr.code !== '23505') return NextResponse.json({ error: 'Sites: ' + siteErr.message }, { status: 500 })
  const siteIds = (sites ?? []).map((s: any) => s.id)

  // ── Employees ────────────────────────────────────────────────────────
  const employeesData = [
    { full_name: 'Sipho Ndlovu',     phone_number: '+27821110001', employee_code: 'MKB001' },
    { full_name: 'Thandi Mokoena',   phone_number: '+27821110002', employee_code: 'MKB002' },
    { full_name: 'Bongani Zulu',     phone_number: '+27821110003', employee_code: 'MKB003' },
    { full_name: 'Nomsa Dlamini',    phone_number: '+27821110004', employee_code: 'MKB004' },
    { full_name: 'Kagiso Sithole',   phone_number: '+27821110005', employee_code: 'MKB005' },
    { full_name: 'Ayanda Nkosi',     phone_number: '+27821110006', employee_code: 'MKB006' },
    { full_name: 'Lebo Mahlangu',    phone_number: '+27821110007', employee_code: 'MKB007' },
    { full_name: 'Zanele Khumalo',   phone_number: '+27821110008', employee_code: 'MKB008' },
    { full_name: 'Mpho Motsepe',     phone_number: '+27821110009', employee_code: 'MKB009' },
    { full_name: 'Tebogo Molefe',    phone_number: '+27821110010', employee_code: 'MKB010' },
  ]

  const { data: employees, error: empErr } = await supabase
    .from('employees').insert(employeesData.map(e => ({ ...e, company_id: cid, status: 'active' }))).select('id')
  if (empErr && empErr.code !== '23505') return NextResponse.json({ error: 'Employees: ' + empErr.message }, { status: 500 })
  const empIds = (employees ?? []).map((e: any) => e.id)

  // ── Schedules (last 7 days + next 7 days) ───────────────────────────
  if (siteIds.length > 0 && empIds.length > 0) {
    const schedules: Record<string,unknown>[] = []
    for (let d = -7; d <= 7; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      // Assign each employee a site and shift
      empIds.forEach((empId: string, i: number) => {
        const siteId = siteIds[i % siteIds.length]
        schedules.push({
          company_id: cid, employee_id: empId, site_id: siteId,
          shift_date: dateStr, start_time: '08:00', end_time: '17:00', status: 'scheduled',
        })
      })
    }
    const { error: schErr } = await (supabase as any).from('schedules').insert(schedules)
    if (schErr && schErr.code !== '23505') console.error('Schedule seed error:', schErr.message)
  }

  // ── Attendance (last 5 days, most employees) ─────────────────────────
  if (empIds.length > 0 && siteIds.length > 0) {
    const attendance: Record<string,unknown>[] = []
    for (let d = -5; d <= 0; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]
      // 80% of employees check in each day
      empIds.slice(0, Math.ceil(empIds.length * 0.8)).forEach((empId: string, i: number) => {
        const siteId = siteIds[i % siteIds.length]
        const checkinHour = 8 + (i % 3 === 0 ? 0 : i % 3 === 1 ? 0 : 0) // some late
        const minsLate = i % 4 === 0 ? 15 : 0
        const checkin = new Date(date)
        checkin.setHours(8, minsLate, 0, 0)
        const checkout = new Date(date)
        checkout.setHours(17, 0, 0, 0)
        attendance.push({
          company_id: cid, employee_id: empId, site_id: siteId,
          checkin_time: checkin.toISOString(),
          checkout_time: d < 0 ? checkout.toISOString() : null,
          attendance_date: dateStr,
          status: minsLate > 0 ? 'late' : 'present',
          verification_status: i % 5 === 0 ? 'outside_site' : 'verified',
          minutes_late: minsLate > 0 ? minsLate : null,
          checkin_latitude: siteIds.length > 0 ? -26.1070 + (i * 0.001) : null,
          checkin_longitude: siteIds.length > 0 ? 28.0567 + (i * 0.001) : null,
        })
      })
    }
    const { error: attErr } = await (supabase as any).from('attendance').insert(attendance)
    if (attErr && attErr.code !== '23505') console.error('Attendance seed error:', attErr.message)
  }

  return NextResponse.json({
    ok: true,
    summary: {
      sites:     siteIds.length,
      employees: empIds.length,
      message:   'Demo data created successfully',
    }
  })
}
