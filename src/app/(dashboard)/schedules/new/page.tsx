import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createSchedule } from '@/lib/actions/schedules';

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createServerSupabaseClient();

  const [{ data: employees }, { data: sites }] = await Promise.all([
    supabase.from('employees').select('id, full_name, employee_code').eq('status', 'active').order('full_name'),
    supabase.from('sites').select('id, site_name').order('site_name'),
  ]);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add shift</h1>
        <p className="text-sm text-slate-500">Scheduling a shift lets Modeky tell exactly how late a check-in is.</p>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={createSchedule} className="space-y-4">
          <div>
            <label htmlFor="employee_id" className="label">Employee</label>
            <select id="employee_id" name="employee_id" required className="input">
              <option value="">Select employee</option>
              {(employees ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="site_id" className="label">Site (optional)</label>
            <select id="site_id" name="site_id" className="input">
              <option value="">No specific site</option>
              {(sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>{site.site_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="shift_date" className="label">Date</label>
            <input id="shift_date" name="shift_date" type="date" required className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="label">Start time</label>
              <input id="start_time" name="start_time" type="time" required className="input" defaultValue="07:00" />
            </div>
            <div>
              <label htmlFor="end_time" className="label">End time</label>
              <input id="end_time" name="end_time" type="time" required className="input" defaultValue="17:00" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save shift</button>
            <Link href="/schedules" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
