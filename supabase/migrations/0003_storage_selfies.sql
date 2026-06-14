-- ============================================================================
-- Modeky - Storage setup for attendance selfies
-- ============================================================================
-- Creates a public storage bucket for employee check-in selfies. Files are
-- uploaded by the WhatsApp webhook (using the service role key, which
-- bypasses storage RLS) under the path:
--
--   selfies/<company_id>/<employee_id>/<date>-<timestamp>.jpg
--
-- The bucket is public so the dashboard can render selfies directly via
-- their public URL. If you need selfies to be private, set `public` to
-- false below and switch the dashboard to use signed URLs
-- (supabase.storage.from('selfies').createSignedUrl(...)).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('selfies', 'selfies', true)
on conflict (id) do nothing;

-- Allow authenticated dashboard users to read selfies belonging to their
-- own company. The folder structure encodes company_id as the first path
-- segment, so we can check it against the user's company_id.
drop policy if exists "selfies_select_own_company" on storage.objects;
create policy "selfies_select_own_company" on storage.objects
  for select using (
    bucket_id = 'selfies'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_user_company_id()::text
    )
  );
