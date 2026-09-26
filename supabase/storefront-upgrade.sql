-- Additive storefront upgrade. Apply once using Supabase SQL Editor.
-- Uses the existing public.is_admin() authorization function.
begin;
create table if not exists public.storefront_preferences (
 id text primary key check (id='main'),
 translation_key text not null default '',
 translation_languages text[] not null default array['en'],
 updated_at timestamptz not null default now()
);
alter table public.storefront_preferences enable row level security;
drop policy if exists "Read public storefront preferences" on public.storefront_preferences;
create policy "Read public storefront preferences" on public.storefront_preferences for select to anon,authenticated using (true);
drop policy if exists "Admins manage storefront preferences" on public.storefront_preferences;
create policy "Admins manage storefront preferences" on public.storefront_preferences for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select on public.storefront_preferences to anon,authenticated;
grant insert,update,delete on public.storefront_preferences to authenticated;
insert into public.storefront_preferences(id) values('main') on conflict do nothing;

create table if not exists public.payment_methods (
 id integer primary key check(id between 1 and 3),
 name text not null default '',
 kind text not null default 'bank_transfer' check(kind in ('bank_transfer','hosted_gateway','manual')),
 enabled boolean not null default false,
 account_name text not null default '',
 account_number text not null default '',
 bank_name text not null default '',
 gateway_host text not null default '',
 instructions text not null default '',
 updated_at timestamptz not null default now()
);
alter table public.payment_methods enable row level security;
drop policy if exists "Admins manage payment methods" on public.payment_methods;
create policy "Admins manage payment methods" on public.payment_methods for all to authenticated using(public.is_admin()) with check(public.is_admin());
revoke all on public.payment_methods from anon;
grant select,insert,update,delete on public.payment_methods to authenticated;
insert into public.payment_methods(id) values(1),(2),(3) on conflict do nothing;

alter table public.quotations add column if not exists payment_method_id integer references public.payment_methods(id);
alter table public.quotations add column if not exists payment_url text;
alter table public.quotations add column if not exists payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid'));
alter table public.quotations add column if not exists payment_reference text;
alter table public.quotations add column if not exists paid_at timestamptz;
drop policy if exists "Quoted customers read enabled payment methods" on public.payment_methods;
create policy "Quoted customers read enabled payment methods" on public.payment_methods for select to authenticated using(
 enabled and exists(select 1 from public.quotations q where q.customer_id=(select auth.uid()) and q.payment_method_id=payment_methods.id and q.status in ('sent','accepted') and q.valid_until>=current_date)
);
-- Keep draft prices private until the administrator issues the quotation.
drop policy if exists "Customers read own quotations" on public.quotations;
create policy "Customers read own quotations" on public.quotations for select to authenticated
 using (customer_id=(select auth.uid()) and status in ('sent','accepted','expired','rejected'));
-- The existing admin ALL policy retains admin read/write access.
commit;
