'use client';

import { useState, useTransition } from 'react';
import { updateIncidentStatus, type IncidentStatus } from '@/lib/actions/incidents';

const OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
];

export function IncidentStatusControl({
  incidentId,
  initialStatus,
}: {
  incidentId: string;
  initialStatus: IncidentStatus;
}) {
  const [status, setStatus] = useState<IncidentStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: IncidentStatus) {
    setStatus(next);
    startTransition(async () => {
      try {
        await updateIncidentStatus(incidentId, next);
      } catch {
        // Revert on failure so the UI doesn't lie about what's saved.
        setStatus(initialStatus);
      }
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as IncidentStatus)}
      className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 disabled:opacity-50"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
