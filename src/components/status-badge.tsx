import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants';
import type { AttendanceStatus, EmployeeStatus } from '@/lib/types';

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, string> = {
    present: 'badge-success',
    late: 'badge-warning',
    absent: 'badge-danger',
    checked_out: 'badge-neutral',
  };

  return <span className={map[status]}>{ATTENDANCE_STATUS_LABELS[status]}</span>;
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={status === 'active' ? 'badge-success' : 'badge-neutral'}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}
