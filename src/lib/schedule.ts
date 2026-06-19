// lib/schedule.ts
// Schedule and lateness computation utilities

interface Schedule {
  id: string;
  site_id: string | null;
  start_time: string; // ISO time string, e.g. "2026-06-19T06:00:00"
  status: string;
}

interface LatenessResult {
  isLate: boolean;
  minutesLate: number;
}

// ── Compute Lateness ──────────────────────────────────────────────────────

export function computeLateness(scheduledStartTime: string, actualTime: Date): LatenessResult {
  const scheduled = new Date(scheduledStartTime);
  const actual = new Date(actualTime);

  // Compare only the time components (ignore date differences)
  const scheduledMinutes = scheduled.getHours() * 60 + scheduled.getMinutes();
  const actualMinutes = actual.getHours() * 60 + actual.getMinutes();

  const diffMinutes = actualMinutes - scheduledMinutes;

  return {
    isLate: diffMinutes > 0,
    minutesLate: Math.max(0, diffMinutes),
  };
}

// ── Format Duration ─────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

// ── Get Shift Duration ────────────────────────────────────────────────────

export function getShiftDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}