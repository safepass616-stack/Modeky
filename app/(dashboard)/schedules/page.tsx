import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { deleteSchedule } from '@/lib/actions/schedules';
import type { ScheduleWithRelations } from '@/lib/types';

export default async function SchedulesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = createServerSupabaseClient();
  const date = searchParams.date || new Date().toISOString().slice(0, 10);

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, employees(id, full_name, employee_code), sites(id, site_name)')
    .eq('shift_date', date)
    .order('start_time', { ascending: true });

  const records = (schedules ?? []) as unknown as ScheduleWithRelations[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Schedules</h1>
          <p className="text-sm text-slate-500">Planned shifts — used to detect lateness against actual check-ins.</p>
        </div>
        <Link href="/schedules/new" className="btn-primary self-start">
          + Add shift
        </Link>
      </div>

      <form method="get" className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="date" className="label">Date</label>
          <input id="date" name="date" type="date" defaultValue={date} className="input" />
        </div>
        <button type="submit" className="btn-primary">View shifts</button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Site</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Start</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">End</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {schedule.employees?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {schedule.sites?.site_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{schedule.start_time?.slice(0, 5)}</td>
                  <td className="px-4 py-3 text-slate-600">{schedule.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-3">
                    <span className={schedule.status === 'cancelled' ? 'badge-danger' : schedule.status === 'completed' ? 'badge-success' : 'badge-neutral'}>
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/schedules/${schedule.id}`} className="btn-secondary text-xs">
                        Edit
                      </Link>
                      <form action={deleteSchedule.bind(null, schedule.id)}>
                        <button type="submit" className="btn-danger text-xs">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No shifts scheduled for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
