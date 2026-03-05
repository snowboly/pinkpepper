-- Public bucket for static assets (logo, marketing images, etc.)
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true);

-- Anyone can read objects in this bucket (required for email image delivery)
create policy "assets_public_select" on storage.objects
  for select
  using (bucket_id = 'assets');

-- Only service role / admins can upload
create policy "assets_insert_admin" on storage.objects
  for insert
  with check (
    bucket_id = 'assets'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );

create policy "assets_delete_admin" on storage.objects
  for delete
  using (
    bucket_id = 'assets'
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_admin = true
    )
  );
