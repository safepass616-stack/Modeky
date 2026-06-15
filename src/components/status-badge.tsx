import React from 'react';

export type VerificationStatus = 'verified' | 'outside_site' | 'missing_selfie' | 'missing_gps' | 'manual_override';

const STATUS_MAP: Record<VerificationStatus, { 
  label: string;
  classes: string;
  dotClassName: string;
}> = {
  verified: {
    label: 'Verified',
    classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    dotClassName: 'bg-emerald-500 dark:bg-emerald-400',
  },
  outside_site: {
    label: 'Outside Site',
    classes: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800/50',
    dotClassName: 'bg-red-500 dark:bg-red-400 animate-pulse',
  },
  missing_selfie: {
    label: 'Missing Selfie',
    classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    dotClassName: 'bg-amber-500 dark:bg-amber-400',
  },
  missing_gps: {
    label: 'Missing GPS',
    classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    dotClassName: 'bg-blue-500 dark:bg-blue-400',
  },
  manual_override: {
    label: 'Overridden',
    classes: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50',
    dotClassName: 'bg-purple-500 dark:bg-purple-400',
  },
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium text-muted-foreground">
        Unverified
      </span>
    );
  }
  
  const statusConfig = STATUS_MAP[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusConfig.dotClassName}`} />
      {statusConfig.label}
    </span>
  );
}