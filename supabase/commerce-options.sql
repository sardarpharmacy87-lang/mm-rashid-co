-- Additive upgrade: public prices, product options and checkout using existing orders.
create schema if not exists private;
alter table public.products add column if not exists sizes text[] not null default '{}';
alter table public.products add column if not exists colors text[] not null default '{}';
alter table public.products add column if not exists public_price numeric(12,2);
update public.products p set sizes = v.labels from
 (select product_id,array_agg(label order by sort_order) labels from public.product_variants where active group by product_id) v
 where p.id=v.product_id and cardinality(p.sizes)=0;
alter table public.products add constraint products_public_price_valid check
 ((price_on_request and public_price is null) or (not price_on_request and public_price is not null and public_price>0 and public_price<=1000000));

create table public.shop_settings (
 id text primary key check(id='main'),
 currency text not null default 'USD' check(currency in ('USD','GBP','EUR','PKR','AED')),
 checkout_enabled boolean not null default false,
 shipping_fee numeric(12,2) not null default 0 check(shipping_fee between 0 and 1000000),
 free_shipping_threshold numeric(12,2) check(free_shipping_threshold>0 and free_shipping_threshold<=100000000),
 tax_percent numeric(5,2) not null default 0 check(tax_percent between 0 and 100),
 minimum_order numeric(12,2) not null default 0 check(minimum_order between 0 and 100000000),
 max_quantity integer not null default 1000 check(max_quantity between 1 and 100000),
 checkout_note text not null default '' check(length(checkout_note)<=2000)
);
insert into public.shop_settings(id) values('main');
alter table public.shop_settings enable row level security;
create policy "Public checkout settings" on public.shop_settings for select to anon,authenticated using(true);
create policy "Admin checkout settings" on public.shop_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select on public.shop_settings to anon,authenticated;
grant insert,update on public.shop_settings to authenticated;
create or replace function private.guard_shop_currency() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.currency<>old.currency and exists(select 1 from public.products where not price_on_request) then
  raise exception 'Hide existing public product prices before changing the store currency.';
 end if;
 return new;
end $$;
create trigger guard_shop_currency before update on public.shop_settings for each row execute function private.guard_shop_currency();

alter table public.enquiries add column if not exists requirements jsonb not null default '{}';
alter table public.enquiries add column if not exists uploads_complete boolean not null default true;
alter table public.enquiries add column if not exists request_kind text not null default 'quotation' check(request_kind in ('quotation','checkout'));
alter table public.enquiries add column if not exists checkout_token uuid;
create unique index enquiries_checkout_token on public.enquiries(customer_id,checkout_token) where checkout_token is not null;

-- Scope uploaded file references to the customer's own enquiry folder.
drop policy if exists "Customers add own enquiry files" on public.enquiry_files;
create policy "Customers add own enquiry files" on public.enquiry_files for insert to authenticated with check (
 customer_id=(select auth.uid()) and storage_path like customer_id::text||'/'||enquiry_id::text||'/%'
 and exists(select 1 from public.enquiries e where e.id=enquiry_id and e.customer_id=(select auth.uid()) and e.status in ('submitted','under_review'))
);
drop policy if exists "Customers create own enquiries" on public.enquiries;
create policy "Customers create own enquiries" on public.enquiries for insert to authenticated with check (
 customer_id=(select auth.uid()) and status='submitted' and request_kind='quotation' and checkout_token is null
 and quantity between 1 and 100000 and length(title) between 3 and 250 and length(description)<=10000
);

-- Definer routines are private, authenticate the caller and expose only narrow invoker wrappers.
create function private.finish_custom_request(p_id uuid,p_file_count integer) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_file_count not between 0 and 10 then raise exception 'Invalid request'; end if;
 if not exists(select 1 from public.enquiries where id=p_id and customer_id=auth.uid() and status='submitted' and request_kind='quotation' and coalesce((requirements->>'expected_files')::integer,0)=p_file_count) then raise exception 'Request not found'; end if;
 if (select count(*) from public.enquiry_files f join storage.objects o on o.bucket_id='enquiry-files' and o.name=f.storage_path
     where f.enquiry_id=p_id and f.customer_id=auth.uid() and f.storage_path like auth.uid()::text||'/'||p_id::text||'/%') < p_file_count then raise exception 'Please finish uploading your reference files.'; end if;
 update public.enquiries set uploads_complete=true where id=p_id and customer_id=auth.uid();
end $$;
create function public.finish_custom_request(p_id uuid,p_file_count integer) returns void
language sql security invoker set search_path='' as $$ select private.finish_custom_request(p_id,p_file_count); $$;

create function private.checkout_methods() returns table(id integer,name text,kind text)
language sql stable security definer set search_path='' as $$
 select m.id,m.name,m.kind from public.payment_methods m where auth.uid() is not null and m.enabled order by m.id;
$$;
create function public.checkout_methods() returns table(id integer,name text,kind text)
language sql stable security invoker set search_path='' as $$ select * from private.checkout_methods(); $$;

create function private.place_cart_order(p_token uuid,p_items jsonb,p_address jsonb,p_method integer,p_currency text,p_expected_total numeric)
returns uuid language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); cfg public.shop_settings%rowtype; prod public.products%rowtype;
 line jsonb; lines jsonb:='[]'; seen text[]:='{}'; line_key text; size_choice text; color_choice text;
 qty integer; quantity_total integer:=0; subtotal numeric:=0; shipping numeric; tax numeric; total numeric;
 enquiry_id uuid; quote_id uuid; field text; description text:='';
begin
 if u is null or p_token is null then raise exception 'Please sign in to checkout.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||p_token::text,0));
 select q.id into quote_id from public.enquiries e join public.quotations q on q.enquiry_id=e.id where e.customer_id=u and e.checkout_token=p_token;
 if quote_id is not null then return quote_id; end if;
 select * into cfg from public.shop_settings where id='main' for share;
 if not found or not cfg.checkout_enabled then raise exception 'Checkout is not currently available. Please request a quotation.'; end if;
 if p_currency is distinct from cfg.currency then raise exception 'The store currency changed. Refresh your cart.'; end if;
 perform 1 from public.payment_methods where id=p_method and enabled for share;
 if not found then raise exception 'Choose an available payment method.'; end if;
 if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
 if jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Your cart must contain 1–30 items.'; end if;
 if jsonb_typeof(p_address) is distinct from 'object' then raise exception 'Complete your delivery address.'; end if;
 foreach field in array array['name','phone','country','city','address','postal_code'] loop
  if length(trim(coalesce(p_address->>field,''))) not between 1 and 500 then raise exception 'Complete your delivery address.'; end if;
 end loop;
 if length(coalesce(p_address->>'notes',''))>2000 then raise exception 'Order notes are too long.'; end if;
 for line in select * from jsonb_array_elements(p_items) loop
  if coalesce(line->>'quantity','') !~ '^[0-9]{1,6}$' then raise exception 'Enter whole-number quantities.'; end if;
  qty:=(line->>'quantity')::integer;
  if qty not between 1 and cfg.max_quantity then raise exception 'A quantity exceeds the store limit.'; end if;
  select * into prod from public.products where id=(line->>'id')::uuid for share;
  if not found or not prod.active or prod.stock_status='out_of_stock' or prod.price_on_request or prod.public_price is null then raise exception 'A product is unavailable or requires a quotation. Review your cart.'; end if;
  size_choice:=coalesce(line->>'size',''); color_choice:=coalesce(line->>'color','');
  if (cardinality(prod.sizes)>0 and not(size_choice=any(prod.sizes))) or (cardinality(prod.sizes)=0 and size_choice<>'') then raise exception 'Choose an available size for each product.'; end if;
  if (cardinality(prod.colors)>0 and not(color_choice=any(prod.colors))) or (cardinality(prod.colors)=0 and color_choice<>'') then raise exception 'Choose an available color for each product.'; end if;
  line_key:=jsonb_build_array(prod.id,size_choice,color_choice)::text;
  if line_key=any(seen) then raise exception 'Combine duplicate cart items.'; end if;
  seen:=array_append(seen,line_key);
  subtotal:=subtotal+prod.public_price*qty; quantity_total:=quantity_total+qty;
  lines:=lines||jsonb_build_array(jsonb_build_object('id',prod.id,'name',prod.name,'size',size_choice,'color',color_choice,'quantity',qty,'unit_price',prod.public_price,'line_total',prod.public_price*qty));
  description:=description||prod.name||' · '||qty||' × '||cfg.currency||' '||prod.public_price||' · Size: '||coalesce(nullif(size_choice,''),'One size')||' · Color: '||coalesce(nullif(color_choice,''),'As shown')||E'\n';
 end loop;
 if subtotal<cfg.minimum_order or subtotal>100000000 then raise exception 'The cart subtotal is outside the store order limits.'; end if;
 shipping:=case when cfg.free_shipping_threshold is not null and subtotal>=cfg.free_shipping_threshold then 0 else cfg.shipping_fee end;
 tax:=round(subtotal*cfg.tax_percent/100,2); total:=subtotal+shipping+tax;
 if p_expected_total is distinct from total then raise exception 'Prices or delivery charges changed. Refresh and review your cart before ordering.'; end if;
 insert into public.enquiries(customer_id,title,category,description,quantity,delivery_country,status,request_kind,checkout_token,requirements)
 values(u,'Catalogue order','other',description,quantity_total,p_address->>'country','accepted','checkout',p_token,jsonb_build_object('items',lines,'delivery',p_address)) returning id into enquiry_id;
 insert into public.quotations(enquiry_id,customer_id,currency,subtotal,shipping,tax,discount,valid_until,status,sent_at,payment_method_id,notes)
 values(enquiry_id,u,cfg.currency,subtotal,shipping,tax,0,current_date+14,'accepted',now(),p_method,'Catalogue order. Payment is pending until receipt is verified.') returning id into quote_id;
 insert into public.orders(enquiry_id,quotation_id,customer_id,currency,total,status) values(enquiry_id,quote_id,u,cfg.currency,total,'pending');
 return quote_id;
end $$;
create function public.place_cart_order(p_token uuid,p_items jsonb,p_address jsonb,p_method integer,p_currency text,p_expected_total numeric)
returns uuid language sql security invoker set search_path='' as $$ select private.place_cart_order(p_token,p_items,p_address,p_method,p_currency,p_expected_total); $$;

revoke all on function private.finish_custom_request(uuid,integer),private.checkout_methods(),private.place_cart_order(uuid,jsonb,jsonb,integer,text,numeric) from public,anon;
revoke all on function public.finish_custom_request(uuid,integer),public.checkout_methods(),public.place_cart_order(uuid,jsonb,jsonb,integer,text,numeric) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.finish_custom_request(uuid,integer),private.checkout_methods(),private.place_cart_order(uuid,jsonb,jsonb,integer,text,numeric) to authenticated;
grant execute on function public.finish_custom_request(uuid,integer),public.checkout_methods(),public.place_cart_order(uuid,jsonb,jsonb,integer,text,numeric) to authenticated;
