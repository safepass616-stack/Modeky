// src/components/StatusBadge.tsx
// Pill-shaped status badges — matches Modeky Figma design

interface StatusBadgeProps {
  status: string
  // If you pass a known status string, styling is automatic.
  // For custom labels, pass variant explicitly.
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'violet'
}

// Auto-map known status strings to variants
function resolveVariant(status: string): NonNullable<StatusBadgeProps['variant']> {
  const s = status.toLowerCase()
  if (['present', 'verified', 'on site', 'active', 'checked in', 'fully staffed'].includes(s)) return 'green'
  if (['late', 'understaffed', 'outside_site', 'on leave'].includes(s)) return 'amber'
  if (['absent', 'no check-ins', 'missing_gps', 'missing_selfie'].includes(s)) return 'red'
  if (['in review', 'pending', 'manual_override'].includes(s)) return 'violet'
  if (['open'].includes(s)) return 'blue'
  if (['resolved', 'closed'].includes(s)) return 'slate'
  return 'slate'
}

const VARIANT_CLASSES: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  green:  'bg-green-50  text-green-700  border border-green-200',
  amber:  'bg-amber-50  text-amber-700  border border-amber-200',
  red:    'bg-red-50    text-red-700    border border-red-200',
  blue:   'bg-blue-50   text-blue-700   border border-blue-200',
  violet: 'bg-violet-50 text-violet-700 border border-violet-200',
  slate:  'bg-slate-100 text-slate-600',
}

// Human-readable label overrides for DB enum values
const LABEL_MAP: Record<string, string> = {
  verified:        'Verified',
  outside_site:    'Outside Site',
  missing_selfie:  'Missing Selfie',
  missing_gps:     'Missing GPS',
  manual_override: 'Overridden',
  present:         'Present',
  absent:          'Absent',
  late:            'Late',
  'on site':       'On Site',
  'on leave':      'On Leave',
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = variant ?? resolveVariant(status)
  const label    = LABEL_MAP[status.toLowerCase()] ?? status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${VARIANT_CLASSES[resolved]}`}
    >
      {label}
    </span>
  )
}
