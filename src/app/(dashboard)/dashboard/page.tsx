import { createServerSupabaseClient } from '@/lib/supabase/server';
import StatCard from '@/components/stat-card';
import FilterBar from '@/components/filter-bar';
import AttendanceTable from '@/components/attendance-table';
import type { AttendanceWithRelations, Employee } from '@/lib/types';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string; site_id?: string; employee_id?: string };
}) {
  const supabase = createServerSupabaseClient();

  const date = searchParams.date || new Date().toISOString().slice(0, 10);

  // Sites and employees for filter dropdowns.
  const [{ data: sites }, { data: employees }] = await Promise.all([
    supabase.from('sites').select('id, site_name').order('site_name'),
    supabase.from('employees').select('id, full_name, status').order('full_name'),
  ]);

  const employeeRows = (employees ?? []) as Pick<Employee, 'id' | 'full_name' | 'status'>[];
  const activeEmployees = employeeRows.filter((e) => e.status === 'active');

  // Build attendance query for the selected date.
  let query = supabase
    .from('attendance')
    .select('*, employees(id, full_name, employee_code), sites(id, site_name)')
    .eq('attendance_date', date)
    .order('checkin_time', { ascending: true });

  if (searchParams.site_id) {
    query = query.eq('site_id', searchParams.site_id);
  }
  if (searchParams.employee_id) {
    query = query.eq('employee_id', searchParams.employee_id);
  }

  const { data: attendance } = await query;
  const records = (attendance ?? []) as unknown as AttendanceWithRelations[];

  const checkedIn = records.filter((r) => r.checkin_time !== null).length;
  const lateToday = records.filter((r) => r.status === 'late').length;
  const employeesWithRecordToday = new Set(records.map((r) => r.employee_id));
  const absentToday = activeEmployees.filter((e) => !employeesWithRecordToday.has(e.id)).length
    + records.filter((r) => r.status === 'absent').length;
  const exceptionsToday = records.filter((r) =>
    r.verification_status != null
    && r.verification_status !== 'verified'
    && r.verification_status !== 'manual_override'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-slate-500">Workforce attendance overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Employees" value={activeEmployees.length} />
        <StatCard label="Checked In Today" value={checkedIn} accent="success" />
        <StatCard label="Absent Today" value={absentToday} accent="danger" />
        <StatCard label="Late Today" value={lateToday} accent="warning" />
        <StatCard label="Exceptions Today" value={exceptionsToday} accent="warning" />
      </div>

      <FilterBar
        sites={sites ?? []}
        employees={activeEmployees}
        date={date}
        siteId={searchParams.site_id}
        employeeId={searchParams.employee_id}
      />

      <AttendanceTable records={records} />
    </div>
  );
}
