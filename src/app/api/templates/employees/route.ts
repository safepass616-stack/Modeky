import { NextResponse } from 'next/server'
export async function GET() {
  const csv = 'full_name,phone_number,employee_code\nJohn Smith,+27821234567,EMP001\nJane Doe,+27831234567,EMP002\n'
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="employees-template.csv"' } })
}
