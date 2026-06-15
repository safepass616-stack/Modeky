-- ============================================================================
-- Modeky - Attendance verification status ("evidence score")
-- ============================================================================
-- Adds a `verification_status` column to `attendance` so managers can see
-- at a glance whether a check-in was fully verified (selfie + GPS within
-- the site radius) or is an exception that needs a look:
--
--   verified         - selfie + GPS within the assigned site's radius
--   outside_site     - selfie + GPS captured, but outside every site radius
--   missing_selfie   - check-in recorded without a selfie
--   missing_gps      - check-in recorded without GPS coordinates
--   manual_override  - a manager has reviewed and manually corrected the record
--
-- Null = not yet evaluated (e.g. records created before this migration, or
-- attendance rows that don't represent a check-in such as 'absent').
-- ============================================================================

alter table public.attendance
  add column if not exists verification_status text
  check (verification_status in (
    'verified',
    'outside_site',
    'missing_selfie',
    'missing_gps',
    'manual_override'
  ));

create index if not exists attendance_verification_status_idx
  on public.attendance (verification_status);

comment on column public.attendance.verification_status is
  'Evidence/exception status for the check-in. Null = not evaluated (e.g. no check-in yet).';
