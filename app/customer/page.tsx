import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboard() {
  const user = await requireUser();
  const supabase = await createClient();
  const [profileResult, enquiriesResult, quotationsResult, ordersResult, notificationsResult] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("enquiries").select("id, enquiry_number, title, status, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("quotations").select("id, quotation_number, enquiry_id, currency, total, status, valid_until").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("id, order_number, currency, total, status, tracking_number, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("notifications").select("id, title, message, link, read_at, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const enquiries = enquiriesResult.data ?? [];
  const quotations = quotationsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const notifications = notificationsResult.data ?? [];
  const isAdmin = profileResult.data?.role === "admin";

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Customer dashboard</p>
          <h1>Welcome, {profileResult.data?.full_name ?? "Customer"}</h1>
          <p>Track every enquiry, quotation and order from one secure place.</p>
        </div>
        <Link className="portal-button" href="/customer/enquiries/new">Create new enquiry</Link>
      </div>

      <section className="summary-grid" aria-label="Account summary">
        <article><strong>{enquiries.length}</strong><span>Recent enquiries</span></article>
        <article><strong>{quotations.filter((item) => item.status === "sent").length}</strong><span>Quotations awaiting decision</span></article>
        <article><strong>{orders.filter((item) => !["delivered", "cancelled"].includes(item.status)).length}</strong><span>Active orders</span></article>
      </section>

      {isAdmin ? (
        <section className="portal-section">
          <div className="portal-section-head">
            <div>
              <h2>Product management</h2>
              <p>Add products, assign them under Fez, Caps, Jackets or any name you create, and upload product images.</p>
            </div>
            <Link className="portal-button" href="/admin/products">Manage products</Link>
          </div>
        </section>
      ) : null}

      <section className="portal-section">
        <div className="portal-section-head"><h2>Enquiries and quotations</h2><Link href="/customer/enquiries/new">New enquiry</Link></div>
        {enquiries.length ? (
          <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Reference</th><th>Enquiry</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>
            {enquiries.map((item) => <tr key={item.id}><td>{item.enquiry_number}</td><td>{item.title}</td><td>{formatDate(item.created_at)}</td><td><span className={`status status-${item.status}`}>{statusLabel(item.status)}</span></td><td><Link href={`/customer/enquiries/${item.id}`}>View</Link></td></tr>)}
          </tbody></table></div>
        ) : <div className="portal-empty"><p>No enquiries yet.</p><Link href="/customer/enquiries/new">Submit your first enquiry</Link></div>}
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Orders</h2></div>
        {orders.length ? (
          <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Tracking</th></tr></thead><tbody>
            {orders.map((item) => <tr key={item.id}><td>{item.order_number}</td><td>{formatDate(item.created_at)}</td><td>{formatMoney(item.total, item.currency)}</td><td><span className={`status status-${item.status}`}>{statusLabel(item.status)}</span></td><td>{item.tracking_number || "Not assigned"}</td></tr>)}
          </tbody></table></div>
        ) : <div className="portal-empty"><p>Orders appear here after you accept a quotation.</p></div>}
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Notifications</h2></div>
        {notifications.length ? <div className="notification-list">{notifications.map((item) => (
          <article className={item.read_at ? "" : "is-unread"} key={item.id}>
            <div><strong>{item.title}</strong><p>{item.message}</p><small>{formatDate(item.created_at)}</small></div>
            {item.link ? <Link href={item.link}>Open</Link> : null}
          </article>
        ))}</div> : <div className="portal-empty"><p>No notifications yet.</p></div>}
      </section>
    </main>
  );
}
