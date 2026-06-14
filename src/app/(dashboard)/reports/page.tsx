import { createServerSupabaseClient } from '@/lib/supabase/server';
import AttendanceTable from '@/components/attendance-table';
import type { AttendanceWithRelations } from '@/lib/types';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = createServerSupabaseClient();
  const date = searchParams.date || new Date().toISOString().slice(0, 10);

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*, employees(id, full_name, employee_code), sites(id, site_name)')
    .eq('attendance_date', date)
    .order('checkin_time', { ascending: true });

  const records = (attendance ?? []) as unknown as AttendanceWithRelations[];

  const exportQuery = new URLSearchParams({ date }).toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Reports</h1>
        <p className="text-sm text-slate-500">Daily attendance report</p>
      </div>

      <form method="get" className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="date" className="label">Date</label>
          <input id="date" name="date" type="date" defaultValue={date} className="input" />
        </div>
        <button type="submit" className="btn-primary">View report</button>
      </form>

      <div className="flex flex-wrap gap-3">
        <a href={`/api/reports/attendance?format=csv&${exportQuery}`} className="btn-secondary">
          Export CSV
        </a>
        <a href={`/api/reports/attendance?format=xlsx&${exportQuery}`} className="btn-secondary">
          Export Excel
        </a>
      </div>

      <AttendanceTable records={records} />
    </div>
  );
}
