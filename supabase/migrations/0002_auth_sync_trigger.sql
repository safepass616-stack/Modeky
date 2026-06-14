-- ============================================================================
-- Modeky - Auth sync trigger
-- ============================================================================
-- When a new row is inserted into auth.users (e.g. via
-- supabase.auth.admin.createUser during tenant onboarding), automatically
-- create the matching public.users profile row using the metadata that was
-- supplied at creation time (company_id, role, full_name).
-- ============================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, company_id, email, full_name, role)
  values (
    new.id,
    (new.raw_user_meta_data->>'company_id')::uuid,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'company_admin')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
