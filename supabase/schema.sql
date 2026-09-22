-- MM Rashid & Co. customer portal
-- Run this complete file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create sequence if not exists public.enquiry_number_seq start 1;
create sequence if not exists public.quotation_number_seq start 1;
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  company_name text not null,
  customer_type text not null check (customer_type in ('individual','company','institution','military','fraternal')),
  phone text not null,
  whatsapp text not null,
  country text not null,
  city text not null,
  address text not null,
  postal_code text not null,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_number text not null unique default (
    'ENQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.enquiry_number_seq')::text, 6, '0')
  ),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (category in ('goldwork','military','regalia','crest','cap-visor','fez','other')),
  description text not null,
  quantity integer not null check (quantity > 0),
  delivery_country text not null,
  required_by date,
  status text not null default 'submitted' check (
    status in ('submitted','under_review','quoted','accepted','rejected','closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique default (
    'Q-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quotation_number_seq')::text, 6, '0')
  ),
  enquiry_id uuid not null unique references public.enquiries(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  currency text not null check (currency in ('USD','GBP','EUR','PKR','AED')),
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  shipping numeric(14,2) not null default 0 check (shipping >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  total numeric(14,2) generated always as (subtotal + shipping + tax - discount) stored,
  notes text,
  valid_until date not null,
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0')
  ),
  enquiry_id uuid not null references public.enquiries(id),
  quotation_id uuid not null unique references public.quotations(id),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  currency text not null,
  total numeric(14,2) not null,
  status text not null default 'pending' check (
    status in ('pending','confirmed','in_production','quality_check','ready','dispatched','delivered','cancelled')
  ),
  tracking_number text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('account','enquiry','quotation','order')),
  title text not null,
  message text not null,
  link text,
  emailed_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiry_files (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in (
    'image/jpeg','image/png','image/webp','image/gif',
    'video/mp4','video/webm','video/quicktime'
  )),
  file_type text not null check (file_type in ('image','video')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 262144000),
  created_at timestamptz not null default now()
);

create index if not exists enquiries_customer_id_idx on public.enquiries(customer_id);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);
create index if not exists quotations_customer_id_idx on public.quotations(customer_id);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists notifications_customer_id_idx on public.notifications(customer_id, created_at desc);
create index if not exists enquiry_files_enquiry_id_idx on public.enquiry_files(enquiry_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function public.set_updated_at();

drop trigger if exists quotations_set_updated_at on public.quotations;
create trigger quotations_set_updated_at before update on public.quotations
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, full_name, company_name, customer_type, phone, whatsapp,
    country, city, address, postal_code
  ) values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), 'Individual'),
    coalesce(nullif(new.raw_user_meta_data ->> 'customer_type', ''), 'individual'),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'whatsapp', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'address', ''), 'Not provided'),
    coalesce(nullif(new.raw_user_meta_data ->> 'postal_code', ''), 'Not provided')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.quotations enable row level security;
alter table public.orders enable row level security;
alter table public.notifications enable row level security;
alter table public.enquiry_files enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Customers read own profile" on public.profiles;
create policy "Customers read own profile" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers create own enquiries" on public.enquiries;
create policy "Customers create own enquiries" on public.enquiries
for insert to authenticated with check (customer_id = auth.uid());

drop policy if exists "Customers read own enquiries" on public.enquiries;
create policy "Customers read own enquiries" on public.enquiries
for select to authenticated using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own quotations" on public.quotations;
create policy "Customers read own quotations" on public.quotations
for select to authenticated using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage quotations" on public.quotations;
create policy "Admins manage quotations" on public.quotations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own orders" on public.orders;
create policy "Customers read own orders" on public.orders
for select to authenticated using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own notifications" on public.notifications;
create policy "Customers read own notifications" on public.notifications
for select to authenticated using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications" on public.notifications
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read own enquiry files" on public.enquiry_files;
create policy "Customers read own enquiry files" on public.enquiry_files
for select to authenticated using (customer_id = auth.uid() or public.is_admin());

drop policy if exists "Customers add own enquiry files" on public.enquiry_files;
create policy "Customers add own enquiry files" on public.enquiry_files
for insert to authenticated with check (
  customer_id = auth.uid()
  and exists (
    select 1 from public.enquiries
    where id = enquiry_id
      and customer_id = auth.uid()
      and status in ('submitted','under_review')
  )
);

drop policy if exists "Admins manage enquiry files" on public.enquiry_files;
create policy "Admins manage enquiry files" on public.enquiry_files
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enquiry-files',
  'enquiry-files',
  false,
  262144000,
  array[
    'image/jpeg','image/png','image/webp','image/gif',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Customers upload own enquiry objects" on storage.objects;
create policy "Customers upload own enquiry objects" on storage.objects
for insert to authenticated with check (
  bucket_id = 'enquiry-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1 from public.enquiries
    where customer_id = auth.uid()
      and id::text = (storage.foldername(name))[2]
      and status in ('submitted','under_review')
  )
);

drop policy if exists "Customers read own enquiry objects" on storage.objects;
create policy "Customers read own enquiry objects" on storage.objects
for select to authenticated using (
  bucket_id = 'enquiry-files'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "Customers delete own enquiry objects" on storage.objects;
create policy "Customers delete own enquiry objects" on storage.objects
for delete to authenticated using (
  bucket_id = 'enquiry-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.accept_quotation(p_quotation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.quotations%rowtype;
  new_order_id uuid;
begin
  select * into q from public.quotations
  where id = p_quotation_id and customer_id = auth.uid()
  for update;

  if not found then raise exception 'Quotation not found'; end if;
  if q.status <> 'sent' then raise exception 'Quotation is not available for acceptance'; end if;
  if q.valid_until < current_date then raise exception 'Quotation has expired'; end if;

  update public.quotations set status = 'accepted' where id = q.id;
  update public.enquiries set status = 'accepted' where id = q.enquiry_id;

  insert into public.orders (
    enquiry_id, quotation_id, customer_id, currency, total, status
  ) values (
    q.enquiry_id, q.id, q.customer_id, q.currency, q.total, 'pending'
  )
  on conflict (quotation_id) do update set updated_at = now()
  returning id into new_order_id;

  insert into public.notifications (customer_id, kind, title, message, link)
  values (
    q.customer_id,
    'order',
    'Quotation accepted',
    'Your quotation has been accepted and an order record has been created.',
    '/customer'
  );

  return new_order_id;
end;
$$;

create or replace function public.reject_quotation(p_quotation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.quotations%rowtype;
begin
  select * into q from public.quotations
  where id = p_quotation_id and customer_id = auth.uid()
  for update;

  if not found then raise exception 'Quotation not found'; end if;
  if q.status <> 'sent' then raise exception 'Quotation is not available for rejection'; end if;

  update public.quotations set status = 'rejected' where id = q.id;
  update public.enquiries set status = 'rejected' where id = q.enquiry_id;
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id and customer_id = auth.uid();
$$;

grant usage on schema public to authenticated;
grant select on public.profiles, public.enquiries, public.quotations, public.orders, public.notifications, public.enquiry_files to authenticated;
grant insert on public.enquiries, public.enquiry_files to authenticated;
grant insert, update, delete on public.profiles, public.enquiries, public.quotations, public.orders, public.notifications, public.enquiry_files to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.accept_quotation(uuid) to authenticated;
grant execute on function public.reject_quotation(uuid) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;

-- After creating your own account, make it the administrator by running:
-- update public.profiles set role = 'admin' where email = 'YOUR-EMAIL@example.com';
