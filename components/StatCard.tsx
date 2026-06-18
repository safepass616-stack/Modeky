// src/components/StatCard.tsx
// KPI stat card — matches Modeky Figma design exactly

import { type LucideIcon, MoreHorizontal } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  // Colour variant drives icon bg + value colour
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue'
}

const VARIANT_STYLES = {
  default: {
    iconBg:    'bg-slate-50',
    iconColor: 'text-slate-400',
    valueColor:'text-slate-800',
  },
  green: {
    iconBg:    'bg-green-50',
    iconColor: 'text-green-500',
    valueColor:'text-green-700',
  },
  amber: {
    iconBg:    'bg-amber-50',
    iconColor: 'text-amber-500',
    valueColor:'text-amber-700',
  },
  red: {
    iconBg:    'bg-red-50',
    iconColor: 'text-red-500',
    valueColor:'text-red-700',
  },
  blue: {
    iconBg:    'bg-blue-50',
    iconColor: 'text-blue-500',
    valueColor:'text-blue-700',
  },
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = 'default',
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover transition-shadow">
      {/* Top row: icon + overflow menu */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className={`w-4 h-4 ${styles.iconColor}`} />
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-300" />
      </div>

      {/* Value */}
      <div
        className={`text-2xl font-bold mb-0.5 ${styles.valueColor}`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {value}
      </div>

      {/* Label */}
      <div className="text-slate-500 text-xs font-medium">{label}</div>

      {/* Sub-label */}
      {sub && (
        <div className="text-slate-400 text-[11px] mt-1 leading-relaxed">{sub}</div>
      )}
    </div>
  )
}
