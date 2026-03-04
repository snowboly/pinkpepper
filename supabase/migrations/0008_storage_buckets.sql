-- Phase 9a - Supabase Storage bucket definitions and RLS policies

-- Create private buckets
insert into storage.buckets (id, name, public) values
  ('user-vault', 'user-vault', false),
  ('temp-uploads', 'temp-uploads', false),
  ('review-attachments', 'review-attachments', false);

-- ============================================================
-- user-vault: persistent storage for Plus/Pro users
-- owner-only access
-- ============================================================

create policy "vault_select_own" on storage.objects
  for select
  using (bucket_id = 'user-vault' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "vault_insert_own" on storage.objects
  for insert
  with check (bucket_id = 'user-vault' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "vault_delete_own" on storage.objects
  for delete
  using (bucket_id = 'user-vault' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- temp-uploads: ephemeral storage for all tiers (72h expiry)
-- owner-only access
-- ============================================================

create policy "temp_select_own" on storage.objects
  for select
  using (bucket_id = 'temp-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "temp_insert_own" on storage.objects
  for insert
  with check (bucket_id = 'temp-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "temp_delete_own" on storage.objects
  for delete
  using (bucket_id = 'temp-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- review-attachments: documents submitted with review requests
-- owners can insert and select their own; admins can select all
-- ============================================================

create policy "review_att_select_own" on storage.objects
  for select
  using (bucket_id = 'review-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "review_att_select_admin" on storage.objects
  for select
  using (
    bucket_id = 'review-attachments'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );

create policy "review_att_insert_own" on storage.objects
  for insert
  with check (bucket_id = 'review-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "review_att_delete_own" on storage.objects
  for delete
  using (bucket_id = 'review-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
