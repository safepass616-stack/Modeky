-- ============================================================================
-- Modeky - Initial Multi-Tenant Schema
-- ============================================================================
-- This migration creates the core multi-tenant data model for Modeky.
-- Every business table carries a `company_id` column, and Row Level
-- Security (RLS) policies enforce that authenticated users can only ever
-- read or write rows belonging to their own company (tenant).
--
-- A separate `super_admin` flag (on the `users` table) allows Modeky staff
-- to access data across all tenants for support/troubleshooting purposes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Companies (Tenants)
-- ----------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subscription_plan text not null default 'starter'
    check (subscription_plan in ('starter', 'business', 'enterprise')),
  subscription_status text not null default 'active'
    check (subscription_status in ('active', 'trialing', 'past_due', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.companies is 'A tenant. Every customer business is a row in this table.';

-- ----------------------------------------------------------------------------
-- Users (extends auth.users)
-- ----------------------------------------------------------------------------
-- This table is a 1:1 extension of Supabase's auth.users table. It stores
-- the tenant (company) a user belongs to and their role within that tenant.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid references public.companies (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'company_admin'
    check (role in ('super_admin', 'company_admin', 'supervisor', 'payroll_admin', 'hr_admin', 'read_only')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Application user profile. 1:1 with auth.users. company_id = null only for super_admins.';

-- super_admins must not belong to a single company
create unique index if not exists users_email_idx on public.users (email);

-- ----------------------------------------------------------------------------
-- Employees
-- ----------------------------------------------------------------------------
create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_code text,
  full_name text not null,
  phone_number text not null,
  profile_photo_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.employees is 'Field employees belonging to a tenant company.';

-- Phone numbers are used to identify employees from inbound WhatsApp
-- messages, so they must be unique across the whole platform (WhatsApp
-- numbers are globally unique). We store them in E.164 format.
create unique index if not exists employees_phone_number_idx on public.employees (phone_number);
create index if not exists employees_company_id_idx on public.employees (company_id);

-- ----------------------------------------------------------------------------
-- Sites
-- ----------------------------------------------------------------------------
create table if not exists public.sites (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  site_name text not null,
  client_name text,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 150,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sites is 'Physical work sites belonging to a tenant company.';

create index if not exists sites_company_id_idx on public.sites (company_id);

-- ----------------------------------------------------------------------------
-- Attendance
-- ----------------------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  checkin_time timestamptz,
  checkout_time timestamptz,
  checkin_latitude double precision,
  checkin_longitude double precision,
  checkout_latitude double precision,
  checkout_longitude double precision,
  selfie_url text,
  status text not null default 'absent'
    check (status in ('present', 'late', 'absent', 'checked_out')),
  attendance_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.attendance is 'Daily attendance records (check-in / check-out) for employees.';

create index if not exists attendance_company_id_idx on public.attendance (company_id);
create index if not exists attendance_employee_id_idx on public.attendance (employee_id);
create index if not exists attendance_date_idx on public.attendance (attendance_date);

-- One attendance record per employee per day
create unique index if not exists attendance_employee_date_idx
  on public.attendance (employee_id, attendance_date);

-- ----------------------------------------------------------------------------
-- WhatsApp conversation state
-- ----------------------------------------------------------------------------
-- Tracks where an employee is in a multi-step WhatsApp conversation
-- (e.g. waiting for location, waiting for selfie).
create table if not exists public.whatsapp_sessions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  state text not null default 'idle'
    check (state in ('idle', 'awaiting_location', 'awaiting_selfie')),
  pending_action text check (pending_action in ('check_in', 'check_out')),
  pending_latitude double precision,
  pending_longitude double precision,
  updated_at timestamptz not null default now()
);

create unique index if not exists whatsapp_sessions_employee_idx on public.whatsapp_sessions (employee_id);

-- ----------------------------------------------------------------------------
-- Audit Log (architecture ready, not yet populated by the MVP UI)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  actor_user_id uuid references public.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_company_id_idx on public.audit_logs (company_id);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.companies;
create trigger set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.employees;
create trigger set_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.sites;
create trigger set_updated_at before update on public.sites
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.attendance;
create trigger set_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Helper functions for RLS
-- ----------------------------------------------------------------------------
-- Returns the company_id of the currently authenticated user.
-- SECURITY DEFINER + stable so it can be used cheaply inside RLS policies
-- without recursive RLS checks on public.users.
create or replace function public.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.users where id = auth.uid();
$$;

-- Returns true if the currently authenticated user is a super_admin.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.sites enable row level security;
alter table public.attendance enable row level security;
alter table public.whatsapp_sessions enable row level security;
alter table public.audit_logs enable row level security;

-- ----------------------------------------------------------------------------
-- Policies: companies
-- ----------------------------------------------------------------------------
drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies
  for select using (
    public.is_super_admin() or id = public.current_user_company_id()
  );

drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies
  for update using (
    public.is_super_admin() or id = public.current_user_company_id()
  );

-- Inserts into companies happen via the service role during signup, so no
-- insert policy is granted to regular authenticated users.

-- ----------------------------------------------------------------------------
-- Policies: users
-- ----------------------------------------------------------------------------
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users
  for select using (
    public.is_super_admin()
    or id = auth.uid()
    or company_id = public.current_user_company_id()
  );

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update using (id = auth.uid() or public.is_super_admin());

-- ----------------------------------------------------------------------------
-- Policies: employees
-- ----------------------------------------------------------------------------
drop policy if exists "employees_select" on public.employees;
create policy "employees_select" on public.employees
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "employees_insert" on public.employees;
create policy "employees_insert" on public.employees
  for insert with check (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "employees_update" on public.employees;
create policy "employees_update" on public.employees
  for update using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "employees_delete" on public.employees;
create policy "employees_delete" on public.employees
  for delete using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Policies: sites
-- ----------------------------------------------------------------------------
drop policy if exists "sites_select" on public.sites;
create policy "sites_select" on public.sites
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "sites_insert" on public.sites;
create policy "sites_insert" on public.sites
  for insert with check (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "sites_update" on public.sites;
create policy "sites_update" on public.sites
  for update using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "sites_delete" on public.sites;
create policy "sites_delete" on public.sites
  for delete using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Policies: attendance
-- ----------------------------------------------------------------------------
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "attendance_insert" on public.attendance;
create policy "attendance_insert" on public.attendance
  for insert with check (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "attendance_update" on public.attendance;
create policy "attendance_update" on public.attendance
  for update using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Policies: whatsapp_sessions (service-role only in practice, but scoped too)
-- ----------------------------------------------------------------------------
drop policy if exists "whatsapp_sessions_select" on public.whatsapp_sessions;
create policy "whatsapp_sessions_select" on public.whatsapp_sessions
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Policies: audit_logs
-- ----------------------------------------------------------------------------
drop policy if exists "audit_logs_select" on public.audit_logs;
create policy "audit_logs_select" on public.audit_logs
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ============================================================================
-- Notes:
-- - The WhatsApp webhook and tenant-onboarding routes run with the Supabase
--   *service role* key on the server, which bypasses RLS by design. Those
--   server-side code paths are responsible for setting company_id correctly
--   on every insert.
-- - All other application access (dashboard, API routes used by the
--   dashboard) uses the authenticated user's session, so RLS is the final
--   enforcement layer for tenant isolation.
-- ============================================================================
