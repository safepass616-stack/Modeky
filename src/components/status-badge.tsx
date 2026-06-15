import { ATTENDANCE_STATUS_LABELS, VERIFICATION_STATUS_LABELS } from '@/lib/constants';
import type { AttendanceStatus, EmployeeStatus, VerificationStatus } from '@/lib/types';

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, string> = {
    present: 'badge-success',
    late: 'badge-warning',
    absent: 'badge-danger',
    checked_out: 'badge-neutral',
  };

  return <span className={map[status]}>{ATTENDANCE_STATUS_LABELS[status]}</span>;
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus | null }) {
  if (!status) {
    return <span className="badge-neutral">—</span>;
  }

  const map: Record<VerificationStatus, string> = {
    verified: 'badge-success',
    outside_site: 'badge-warning',
    missing_selfie: 'badge-warning',
    missing_gps: 'badge-warning',
    manual_override: 'badge-neutral',
  };

  return <span className={map[status]}>{VERIFICATION_STATUS_LABELS[status]}</span>;
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span className={status === 'active' ? 'badge-success' : 'badge-neutral'}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </span>
  );
}
