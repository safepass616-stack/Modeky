import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateSchedule } from '@/lib/actions/schedules';

export default async function EditSchedulePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createServerSupabaseClient();

  const [{ data: schedule }, { data: employees }, { data: sites }] = await Promise.all([
    supabase.from('schedules').select('*').eq('id', params.id).single(),
    supabase.from('employees').select('id, full_name, employee_code').eq('status', 'active').order('full_name'),
    supabase.from('sites').select('id, site_name').order('site_name'),
  ]);

  if (!schedule) {
    notFound();
  }

  const updateAction = updateSchedule.bind(null, schedule.id);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Edit shift</h1>
      </div>

      <div className="card p-6">
        {searchParams.error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <form action={updateAction} className="space-y-4">
          <div>
            <label htmlFor="employee_id" className="label">Employee</label>
            <select id="employee_id" name="employee_id" required defaultValue={schedule.employee_id} className="input">
              <option value="">Select employee</option>
              {(employees ?? []).map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="site_id" className="label">Site (optional)</label>
            <select id="site_id" name="site_id" defaultValue={schedule.site_id ?? ''} className="input">
              <option value="">No specific site</option>
              {(sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>{site.site_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="shift_date" className="label">Date</label>
            <input id="shift_date" name="shift_date" type="date" required defaultValue={schedule.shift_date} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="label">Start time</label>
              <input id="start_time" name="start_time" type="time" required defaultValue={schedule.start_time?.slice(0, 5)} className="input" />
            </div>
            <div>
              <label htmlFor="end_time" className="label">End time</label>
              <input id="end_time" name="end_time" type="time" required defaultValue={schedule.end_time?.slice(0, 5)} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" defaultValue={schedule.status} className="input">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save changes</button>
            <Link href="/schedules" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
