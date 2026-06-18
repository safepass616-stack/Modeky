import { LATE_GRACE_MINUTES } from '@/lib/constants';

/**
 * Given a scheduled shift start time (HH:MM:SS, local) and the actual
 * check-in Date, returns how many minutes late the check-in was (0 if on
 * time or early) and whether it counts as "late" once the grace period is
 * applied.
 */
export function computeLateness(
  scheduleStartTime: string,
  checkinTime: Date
): { minutesLate: number; isLate: boolean } {
  const [hours, minutes] = scheduleStartTime.split(':').map(Number);

  const scheduledStart = new Date(checkinTime);
  scheduledStart.setHours(hours, minutes, 0, 0);

  const diffMs = checkinTime.getTime() - scheduledStart.getTime();
  const minutesLate = Math.max(0, Math.round(diffMs / 60000));

  return {
    minutesLate,
    isLate: minutesLate > LATE_GRACE_MINUTES,
  };
}
