'use client'

// src/app/(dashboard)/incidents/IncidentStatusUpdater.tsx
// Inline status + severity controls for each incident card

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronDown } from 'lucide-react'

interface Props {
  incidentId:    string
  currentStatus: string
  currentSeverity?: string
}

const STATUS_OPTIONS = [
  { value: 'open',      label: 'Open',      color: 'text-red-600' },
  { value: 'in_review', label: 'In Review', color: 'text-amber-600' },
  { value: 'resolved',  label: 'Resolved',  color: 'text-green-600' },
  { value: 'closed',    label: 'Closed',    color: 'text-slate-500' },
]

const SEVERITY_OPTIONS = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function IncidentStatusUpdater({ incidentId, currentStatus, currentSeverity = 'medium' }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status,   setStatus]   = useState(currentStatus)
  const [severity, setSeverity] = useState(currentSeverity)
  const [note,     setNote]     = useState('')
  const [showNote, setShowNote] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function save() {
    setError(null)
    const res = await fetch(`/api/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        severity,
        resolution_note: note || undefined,
        resolved_at: status === 'resolved' || status === 'closed'
          ? new Date().toISOString()
          : undefined,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Failed to update')
      return
    }

    startTransition(() => router.refresh())
    setShowNote(false)
  }

  const hasChanges = status !== currentStatus || severity !== currentSeverity || note

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status selector */}
        <div className="relative">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors cursor-pointer"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Severity selector */}
        <div className="relative">
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-colors cursor-pointer"
          >
            {SEVERITY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label} severity</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        {/* Add note toggle */}
        <button
          onClick={() => setShowNote(v => !v)}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
        >
          {showNote ? 'Hide note' : 'Add resolution note'}
        </button>

        {/* Save button */}
        {hasChanges && (
          <button
            onClick={save}
            disabled={isPending}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            {isPending ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      {/* Resolution note input */}
      {showNote && (
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe how this was resolved…"
          rows={2}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 resize-none transition-colors"
        />
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
