-- Pokaran Lab — storage buckets
-- Run once against a fresh project, after schema.sql (which defines public.is_staff()).
-- See docs/database-schema.md §5.1 (from system-design.md) for the reasoning: public-media is
-- public read for catalog/landing images, reports is private — patient PDFs are never publicly
-- listable, only reachable via a signed URL generated server-side (Phase 2, not built yet).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('reports', 'reports', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- public-media: anyone can read, only staff can write (uses public.is_staff() from schema.sql)
create policy "public read public-media" on storage.objects for select
  using (bucket_id = 'public-media');

create policy "staff insert public-media" on storage.objects for insert
  with check (bucket_id = 'public-media' and public.is_staff(auth.uid()));

create policy "staff update public-media" on storage.objects for update
  using (bucket_id = 'public-media' and public.is_staff(auth.uid()));

create policy "staff delete public-media" on storage.objects for delete
  using (bucket_id = 'public-media' and public.is_staff(auth.uid()));

-- reports: staff only, no public policy at all — patient downloads go through a signed URL
-- generated server-side with the service role key (Phase 2, see docs/todo.md), never a direct
-- anon-key read.
create policy "staff manage reports bucket" on storage.objects for all
  using (bucket_id = 'reports' and public.is_staff(auth.uid()))
  with check (bucket_id = 'reports' and public.is_staff(auth.uid()));
