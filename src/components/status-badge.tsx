import React from 'react';

export type VerificationStatus = 'verified' | 'outside_site' | 'missing_selfie' | 'missing_gps' | 'manual_override';

const STATUS_MAP: Record<VerificationStatus, { label: string; classes: string }> = {
  verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-500/10',
  outside_site: 'bg-destructive/10 text-destructive dark:bg-destructive/20 border-destructive/20 animate-pulse',
  missing_selfie: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-500/10',
  missing_gps: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-500/10',
  manual_override: 'bg-secondary text-secondary-foreground border-primary/10',
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus | null }) {
  if (!status) {
    return <span className="text-muted-foreground font-normal text-sm">Unverified</span>;
  }
  
  const labels: Record<VerificationStatus, string> = {
    verified: 'Verified',
    outside_site: 'Outside Site',
    missing_selfie: 'Missing Selfie',
    missing_gps: 'Missing GPS',
    manual_override: 'Overridden',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${STATUS_MAP[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full current-color" />
      {labels[status]}
    </span>
  );
}