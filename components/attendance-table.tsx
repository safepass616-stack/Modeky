import Link from 'next/link';
import { format } from 'date-fns';
import { AttendanceStatusBadge, VerificationStatusBadge } from '@/components/status-badge';
import type { AttendanceWithRelations } from '@/lib/types';

export default function AttendanceTable({
  records,
}: {
  records: AttendanceWithRelations[];
}) {
  if (records.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        No attendance records for the selected filters.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Employee</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Site</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Check-In</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Check-Out</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Late by</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Verification</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => {
              const needsReview = record.verification_status != null
                && record.verification_status !== 'verified'
                && record.verification_status !== 'manual_override';

              return (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {record.employees?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.sites?.site_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.checkin_time ? format(new Date(record.checkin_time), 'HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.checkout_time ? format(new Date(record.checkout_time), 'HH:mm') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <AttendanceStatusBadge status={record.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.minutes_late && record.minutes_late > 0 ? `${record.minutes_late} min` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <VerificationStatusBadge status={record.verification_status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {needsReview && (
                      <Link href={`/attendance/${record.id}`} className="btn-secondary text-xs">
                        Review
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
