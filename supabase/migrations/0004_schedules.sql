-- ============================================================================
-- Modeky - Schedules (shift planning foundation)
-- ============================================================================
-- Stores the planned shift for an employee on a given date: which site they
-- are expected at, and what time they're expected to start/finish. This is
-- what allows attendance to be evaluated against a plan ("Sipho was due at
-- Site A at 07:00 and checked in at 07:20 - 20 minutes late") rather than
-- just a fixed global cutoff time.
-- ============================================================================

create table if not exists public.schedules (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.schedules is 'Planned shifts. One row per employee per shift date.';

-- One scheduled shift per employee per day (MVP: no split/double shifts yet).
create unique index if not exists schedules_employee_date_idx
  on public.schedules (employee_id, shift_date);

create index if not exists schedules_company_id_idx on public.schedules (company_id);
create index if not exists schedules_shift_date_idx on public.schedules (shift_date);
create index if not exists schedules_site_id_idx on public.schedules (site_id);

drop trigger if exists set_updated_at on public.schedules;
create trigger set_updated_at before update on public.schedules
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.schedules enable row level security;

drop policy if exists "schedules_select" on public.schedules;
create policy "schedules_select" on public.schedules
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "schedules_insert" on public.schedules;
create policy "schedules_insert" on public.schedules
  for insert with check (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "schedules_update" on public.schedules;
create policy "schedules_update" on public.schedules
  for update using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "schedules_delete" on public.schedules;
create policy "schedules_delete" on public.schedules
  for delete using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Attendance: link to the schedule + record how late the check-in was
-- ----------------------------------------------------------------------------
alter table public.attendance
  add column if not exists schedule_id uuid references public.schedules (id) on delete set null;

alter table public.attendance
  add column if not exists minutes_late integer;

comment on column public.attendance.minutes_late is
  'Minutes between the scheduled start_time and checkin_time. Null if there was no schedule for that day.';
