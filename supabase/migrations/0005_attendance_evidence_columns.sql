-- ============================================================================
-- Modeky Migration 0005: Attendance evidence columns
-- Adds minutes_late and verification_status to support the new dashboard's
-- exception-tracking view (Week 1 of the 2-week roadmap).
-- ============================================================================

alter table public.attendance
  add column if not exists minutes_late integer not null default 0;

alter table public.attendance
  add column if not exists verification_status text
    check (verification_status in ('verified', 'outside_site', 'missing_selfie', 'missing_gps', 'manual_override'));

create index if not exists attendance_minutes_late_idx on public.attendance (minutes_late);
create index if not exists attendance_verification_status_idx on public.attendance (verification_status);
