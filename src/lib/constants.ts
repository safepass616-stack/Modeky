// ----------------------------------------------------------------------------
// Application-wide constants
// ----------------------------------------------------------------------------

/**
 * The hour (24h, local server time) after which a check-in is considered
 * "late". This is a simple MVP-wide setting. A future version could make
 * this configurable per company or per site.
 */
export const LATE_CHECKIN_HOUR = 9;

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  checked_out: 'Checked Out',
};
