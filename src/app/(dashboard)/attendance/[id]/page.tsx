import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { overrideAttendance } from '@/lib/actions/attendance';
import { AttendanceStatusBadge, VerificationStatusBadge } from '@/components/status-badge';
import type { AttendanceWithRelations } from '@/lib/types';

export default async function AttendanceReviewPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createServerSupabaseClient();

  const [{ data: attendance }, { data: sites }] = await Promise.all([
    supabase
      .from('attendance')
      .select('*, employees(id, full_name, employee_code), sites(id, site_name)')
      .eq('id', params.id)
      .single(),
    supabase.from('sites').select('id, site_name').order('site_name'),
  ]);

  if (!attendance) {
    notFound();
  }

  const record = attendance as unknown as AttendanceWithRelations;
  const updateAction = overrideAttendance.bind(null, record.id);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Review attendance</h1>
        <p className="text-sm text-slate-500">
          {record.employees?.full_name ?? 'Unknown employee'} — {record.attendance_date}
        </p>
      </div>

      <div className="card space-y-4 p-6">
        {searchParams.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Status</p>
            <p className="mt-1"><AttendanceStatusBadge status={record.status} /></p>
          </div>
          <div>
            <p className="text-slate-500">Verification</p>
            <p className="mt-1"><VerificationStatusBadge status={record.verification_status} /></p>
          </div>
          <div>
            <p className="text-slate-500">Check-in</p>
            <p className="mt-1 font-medium text-slate-800">
              {record.checkin_time ? format(new Date(record.checkin_time), 'PPP HH:mm') : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Check-out</p>
            <p className="mt-1 font-medium text-slate-800">
              {record.checkout_time ? format(new Date(record.checkout_time), 'PPP HH:mm') : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Site</p>
            <p className="mt-1 font-medium text-slate-800">{record.sites?.site_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">GPS</p>
            <p className="mt-1 font-medium text-slate-800">
              {record.checkin_latitude != null && record.checkin_longitude != null
                ? `${record.checkin_latitude.toFixed(5)}, ${record.checkin_longitude.toFixed(5)}`
                : '—'}
            </p>
          </div>
          {record.minutes_late != null && record.minutes_late > 0 && (
            <div>
              <p className="text-slate-500">Late by</p>
              <p className="mt-1 font-medium text-slate-800">{record.minutes_late} min</p>
            </div>
          )}
        </div>

        {record.selfie_url && (
          <div>
            <p className="mb-2 text-sm text-slate-500">Selfie</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={record.selfie_url}
              alt="Check-in selfie"
              className="h-48 w-48 rounded-md border border-slate-200 object-cover"
            />
          </div>
        )}

        <hr className="border-slate-200" />

        <p className="text-sm font-medium text-slate-700">Manager override</p>

        <form action={updateAction} className="space-y-4">
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" defaultValue={record.status} className="input">
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>
          <div>
            <label htmlFor="site_id" className="label">Site</label>
            <select id="site_id" name="site_id" defaultValue={record.site_id ?? ''} className="input">
              <option value="">No site</option>
              {(sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>{site.site_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">Save & mark reviewed</button>
            <Link href="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
