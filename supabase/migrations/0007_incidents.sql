-- ============================================================================
-- Modeky - Incident reporting
-- ============================================================================
-- Lets an employee report an incident via WhatsApp right after checking in.
-- Captures free text, and optionally a photo or voice note uploaded to the
-- same storage bucket pattern used for selfies.
-- ============================================================================

create table if not exists public.incidents (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references public.companies (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  attendance_id uuid references public.attendance (id) on delete set null,
  description text,
  media_url text,
  media_type text check (media_type in ('photo', 'voice', null)),
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.incidents is
  'Incidents reported by employees via WhatsApp, typically right after check-in.';

create index if not exists incidents_company_id_idx on public.incidents (company_id);
create index if not exists incidents_employee_id_idx on public.incidents (employee_id);
create index if not exists incidents_site_id_idx on public.incidents (site_id);
create index if not exists incidents_created_at_idx on public.incidents (created_at);
create index if not exists incidents_status_idx on public.incidents (status);

drop trigger if exists set_updated_at on public.incidents;
create trigger set_updated_at before update on public.incidents
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.incidents enable row level security;

drop policy if exists "incidents_select" on public.incidents;
create policy "incidents_select" on public.incidents
  for select using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "incidents_insert" on public.incidents;
create policy "incidents_insert" on public.incidents
  for insert with check (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "incidents_update" on public.incidents;
create policy "incidents_update" on public.incidents
  for update using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

drop policy if exists "incidents_delete" on public.incidents;
create policy "incidents_delete" on public.incidents
  for delete using (
    public.is_super_admin() or company_id = public.current_user_company_id()
  );

-- ----------------------------------------------------------------------------
-- Storage: reuse the same public-bucket + company-scoped pattern as selfies
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('incident-media', 'incident-media', true)
on conflict (id) do nothing;

drop policy if exists "incident_media_upload" on storage.objects;
create policy "incident_media_upload" on storage.objects
  for insert to authenticated, anon
  with check (bucket_id = 'incident-media');

drop policy if exists "incident_media_read" on storage.objects;
create policy "incident_media_read" on storage.objects
  for select to public
  using (bucket_id = 'incident-media');
