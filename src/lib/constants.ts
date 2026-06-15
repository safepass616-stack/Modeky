// ----------------------------------------------------------------------------
// Application-wide constants
// ----------------------------------------------------------------------------

/**
 * The hour (24h, local server time) after which a check-in is considered
 * "late". This is a simple MVP-wide setting. A future version could make
 * this configurable per company or per site.
 *
 * Only used as a FALLBACK when an employee has no `schedules` row for the
 * day. When a schedule exists, lateness is calculated against
 * `schedules.start_time` + LATE_GRACE_MINUTES instead.
 */
export const LATE_CHECKIN_HOUR = 9;

/**
 * Minutes of grace allowed after a scheduled shift start time before a
 * check-in is marked "late".
 */
export const LATE_GRACE_MINUTES = 5;

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  checked_out: 'Checked Out',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  verified: 'Verified',
  outside_site: 'Outside Site',
  missing_selfie: 'Missing Selfie',
  missing_gps: 'Missing GPS',
  manual_override: 'Manual Override',
};
