-- ============================================================================
-- Modeky - Generic WhatsApp session engine
-- ============================================================================
-- Generalizes whatsapp_sessions from a check-in-only table into a reusable
-- engine that can drive any multi-step WhatsApp conversation: check-in,
-- incident reporting, leave requests, payslip requests, etc.
--
-- Before: state ('idle'|'awaiting_location'|'awaiting_selfie'),
--         pending_action ('check_in'|'check_out'),
--         pending_latitude, pending_longitude
--
-- After:  session_type   - which flow is active ('check_in', 'incident', ...)
--         current_step    - free-form step name, meaning depends on session_type
--         metadata         - jsonb bucket for any in-progress data the flow needs
--         expires_at       - abandoned sessions older than this can be reset
--
-- The old columns are kept (not dropped) during the transition so a bad
-- deploy can roll back without data loss; the application code stops
-- reading/writing them after this migration ships. They can be dropped in
-- a later cleanup migration once the new shape has been live for a while.
-- ============================================================================

alter table public.whatsapp_sessions
  add column if not exists session_type text not null default 'check_in'
    check (session_type in ('check_in', 'incident', 'leave_request', 'payslip')),
  add column if not exists current_step text not null default 'idle',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists expires_at timestamptz;

comment on column public.whatsapp_sessions.session_type is
  'Which conversational flow is in progress for this employee.';
comment on column public.whatsapp_sessions.current_step is
  'Free-form step name within the active session_type flow (e.g. awaiting_location, awaiting_incident_media).';
comment on column public.whatsapp_sessions.metadata is
  'In-progress data for the active flow (pending GPS coords, draft incident text, etc.), shape depends on session_type.';
comment on column public.whatsapp_sessions.expires_at is
  'If set and in the past, the session is considered abandoned and may be reset on the next message.';

-- Backfill current_step/metadata from the legacy columns for any sessions
-- that are mid-flow at the time this migration runs, so nobody gets stuck.
update public.whatsapp_sessions
set
  session_type = coalesce(
    case when pending_action in ('check_in', 'check_out') then 'check_in' else session_type end,
    'check_in'
  ),
  current_step = coalesce(state, 'idle'),
  metadata = case
    when pending_latitude is not null or pending_longitude is not null then
      jsonb_build_object(
        'pending_action', pending_action,
        'pending_latitude', pending_latitude,
        'pending_longitude', pending_longitude
      )
    else '{}'::jsonb
  end
where current_step = 'idle' and (state is not null and state <> 'idle');

create index if not exists whatsapp_sessions_expires_at_idx
  on public.whatsapp_sessions (expires_at)
  where expires_at is not null;
