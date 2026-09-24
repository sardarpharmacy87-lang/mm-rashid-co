import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function AdminDashboard({ searchParams }: PageProps) {
  const feedback = await searchParams;
  const supabase = await createClient();
  const [enquiriesResult, ordersResult, customersResult] = await Promise.all([
    supabase.from("enquiries").select("id, enquiry_number, title, customer_id, status, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("orders").select("id, order_number, customer_id, currency, total, status, tracking_number, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("profiles").select("id, full_name, company_name, email"),
  ]);

  const enquiries = enquiriesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const customers = customersResult.data ?? [];
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

  return (
    <main className="portal-main">
      <div className="portal-title-row"><div><p className="portal-kicker">Administration</p><h1>Enquiries and orders</h1><p>Review enquiries, create quotations and keep customers informed.</p></div></div>
      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="summary-grid"><article><strong>{customers.length}</strong><span>Customers</span></article><article><strong>{enquiries.filter((item) => ["submitted", "under_review"].includes(item.status)).length}</strong><span>Awaiting review</span></article><article><strong>{orders.filter((item) => !["delivered", "cancelled"].includes(item.status)).length}</strong><span>Active orders</span></article></section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Customer enquiries</h2></div>
        <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Reference</th><th>Customer</th><th>Enquiry</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>
          {enquiries.map((item) => { const customer = customerMap.get(item.customer_id); return <tr key={item.id}><td>{item.enquiry_number}</td><td>{customer?.company_name ?? customer?.full_name ?? "Customer"}</td><td>{item.title}</td><td>{formatDate(item.created_at)}</td><td><span className={`status status-${item.status}`}>{statusLabel(item.status)}</span></td><td><Link href={`/admin/enquiries/${item.id}`}>Review</Link></td></tr>; })}
        </tbody></table></div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Order management</h2></div>
        {orders.length ? <div className="admin-order-list">{orders.map((order) => { const customer = customerMap.get(order.customer_id); return (
          <article className="portal-card" key={order.id}>
            <div className="admin-order-head"><div><small>{order.order_number}</small><h3>{customer?.company_name ?? customer?.full_name}</h3><p>{formatDate(order.created_at)} · {formatMoney(order.total, order.currency)}</p></div><span className={`status status-${order.status}`}>{statusLabel(order.status)}</span></div>
            <form action={updateOrderStatus} className="order-update-form">
              <input name="orderId" type="hidden" value={order.id} />
              <label>Status<select name="status" defaultValue={order.status}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in_production">In production</option><option value="quality_check">Quality check</option><option value="ready">Ready</option><option value="dispatched">Dispatched</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
              <label>Tracking number<input name="trackingNumber" defaultValue={order.tracking_number ?? ""} /></label>
              <label className="form-span-two">Customer update note<input name="note" placeholder="Optional message included in the email" /></label>
              <button className="portal-button" type="submit">Update and notify</button>
            </form>
          </article>
        ); })}</div> : <div className="portal-empty"><p>No orders yet.</p></div>}
      </section>
    </main>
  );
}
