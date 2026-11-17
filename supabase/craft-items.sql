create table public.craft_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 5000),
  image_path text not null check (image_path ~ '^craft/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.craft_items enable row level security;
revoke all on public.craft_items from anon, authenticated;
grant select on public.craft_items to anon, authenticated;
grant insert, update, delete on public.craft_items to authenticated;
create policy "Public read published craft" on public.craft_items for select to anon, authenticated using (active);
create policy "Admins manage craft" on public.craft_items for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create index craft_items_public_order on public.craft_items(active, sort_order, created_at, id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('craft-images','craft-images',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy "Public read craft images" on storage.objects for select to anon, authenticated using (bucket_id='craft-images');
create policy "Admins upload craft images" on storage.objects for insert to authenticated with check (bucket_id='craft-images' and (select public.is_admin()));
create policy "Admins delete craft images" on storage.objects for delete to authenticated using (bucket_id='craft-images' and (select public.is_admin()));
