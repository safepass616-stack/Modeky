import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import type { AttendanceWithRelations } from '@/lib/types';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const exportFormat = searchParams.get('format') || 'csv';

  // RLS automatically scopes this to the authenticated user's company.
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select('*, employees(id, full_name, employee_code), sites(id, site_name)')
    .eq('attendance_date', date)
    .order('checkin_time', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const records = (attendance ?? []) as unknown as AttendanceWithRelations[];

  const rows = records.map((r) => ({
    employee: r.employees?.full_name ?? '',
    employeeCode: r.employees?.employee_code ?? '',
    site: r.sites?.site_name ?? '',
    checkIn: r.checkin_time ? format(new Date(r.checkin_time), 'yyyy-MM-dd HH:mm') : '',
    checkOut: r.checkout_time ? format(new Date(r.checkout_time), 'yyyy-MM-dd HH:mm') : '',
    status: ATTENDANCE_STATUS_LABELS[r.status] ?? r.status,
  }));

  const filename = `modeky-attendance-${date}`;

  if (exportFormat === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Employee', key: 'employee', width: 28 },
      { header: 'Employee Code', key: 'employeeCode', width: 16 },
      { header: 'Site', key: 'site', width: 24 },
      { header: 'Check-In Time', key: 'checkIn', width: 20 },
      { header: 'Check-Out Time', key: 'checkOut', width: 20 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    sheet.getRow(1).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  // Default: CSV
  const header = ['Employee', 'Employee Code', 'Site', 'Check-In Time', 'Check-Out Time', 'Status'];
  const csvLines = [header.join(',')];

  for (const row of rows) {
    const line = [row.employee, row.employeeCode, row.site, row.checkIn, row.checkOut, row.status]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
    csvLines.push(line);
  }

  return new NextResponse(csvLines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
