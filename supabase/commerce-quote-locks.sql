-- Preserve agreed totals, and expose quotation acceptance through an authenticated wrapper.
create or replace function private.protect_agreed_quote() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if (old.status='accepted' or old.payment_status='paid') and
  (new.subtotal,new.shipping,new.tax,new.discount,new.currency,new.customer_id,new.enquiry_id,new.status)
  is distinct from (old.subtotal,old.shipping,old.tax,old.discount,old.currency,old.customer_id,old.enquiry_id,old.status)
 then raise exception 'An accepted or paid quotation cannot be repriced.'; end if;
 if old.payment_status='paid' and new.payment_status<>'paid' then raise exception 'A verified payment cannot be cleared here.'; end if;
 return new;
end $$;
create trigger protect_agreed_quote before update on public.quotations for each row execute function private.protect_agreed_quote();
create function private.accept_quote(p_quotation_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare q public.quotations%rowtype; order_id uuid;
begin
 if auth.uid() is null then raise exception 'Please sign in.'; end if;
 select * into q from public.quotations where id=p_quotation_id and customer_id=auth.uid() for update;
 if not found then raise exception 'Quotation not found'; end if;
 if q.status='accepted' then select id into order_id from public.orders where quotation_id=q.id; return order_id; end if;
 if q.status<>'sent' or q.valid_until<current_date or q.total<=0 then raise exception 'Quotation is not available for acceptance'; end if;
 update public.quotations set status='accepted' where id=q.id;
 update public.enquiries set status='accepted' where id=q.enquiry_id;
 insert into public.orders(enquiry_id,quotation_id,customer_id,currency,total,status) values(q.enquiry_id,q.id,q.customer_id,q.currency,q.total,'pending') returning id into order_id;
 return order_id;
end $$;
create or replace function public.accept_quotation(p_quotation_id uuid) returns uuid language sql security invoker set search_path='' as $$ select private.accept_quote(p_quotation_id); $$;
revoke all on function public.accept_quotation(uuid),private.accept_quote(uuid) from public,anon;
grant execute on function public.accept_quotation(uuid),private.accept_quote(uuid) to authenticated;
