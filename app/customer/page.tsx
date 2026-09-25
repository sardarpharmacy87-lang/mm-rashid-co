import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboard() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: enquiries }, { data: quotations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, company_name, email, phone, country, city, role, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("enquiries")
      .select("id, enquiry_number, title, quantity, delivery_country, status, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("quotations")
      .select("id, enquiry_id, quotation_number, currency, subtotal, shipping, tax, discount, total, valid_until, status, sent_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const quoteMap = new Map((quotations ?? []).map((quote) => [quote.enquiry_id, quote]));

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">{profile?.role === "admin" ? "Administrator account" : "Customer account"}</p>
          <h1>Welcome, {profile?.full_name ?? "Customer"}</h1>
          <p>Your private MM Rashid &amp; Co. account, rate requests and quotations.</p>
        </div>
        {profile?.role === "admin" ? (
          <Link className="portal-button" href="/admin">Open admin portal</Link>
        ) : (
          <Link className="portal-button" href="/products">Browse products</Link>
        )}
      </div>

      <section className="portal-section">
        <div className="portal-section-head"><h2>My rate requests</h2></div>
        {(enquiries ?? []).length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr><th>Enquiry</th><th>Product</th><th>Qty</th><th>Status</th><th>Rate</th><th>Total</th></tr>
              </thead>
              <tbody>
                {(enquiries ?? []).map((enquiry) => {
                  const quote = quoteMap.get(enquiry.id);
                  const unitRate = quote && enquiry.quantity
                    ? Number(quote.subtotal) / enquiry.quantity
                    : null;

                  return (
                    <tr key={enquiry.id}>
                      <td><strong>{enquiry.enquiry_number}</strong><br /><small>{new Date(enquiry.created_at).toLocaleDateString()}</small></td>
                      <td>{enquiry.title.replace("Rate request — ", "")}</td>
                      <td>{enquiry.quantity}</td>
                      <td><span className="status">{enquiry.status.replace("_", " ")}</span></td>
                      <td>{quote && unitRate !== null ? quote.currency + " " + unitRate.toFixed(2) + " / unit" : "Awaiting rate"}</td>
                      <td>{quote ? <strong>{quote.currency} {Number(quote.total).toFixed(2)}</strong> : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p>You have not requested any rates yet.</p>
            <Link className="portal-button" href="/products">Browse products</Link>
          </div>
        )}
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Account details</h2></div>
        <div className="account-detail-grid">
          <div><span>Name</span><strong>{profile?.full_name ?? "—"}</strong></div>
          <div><span>Company</span><strong>{profile?.company_name ?? "—"}</strong></div>
          <div><span>Email</span><strong>{profile?.email ?? user.email ?? "—"}</strong></div>
          <div><span>Phone</span><strong>{profile?.phone ?? "—"}</strong></div>
          <div><span>City</span><strong>{profile?.city ?? "—"}</strong></div>
          <div><span>Country</span><strong>{profile?.country ?? "—"}</strong></div>
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Explore MM Rashid &amp; Co.</h2></div>
        <div className="customer-link-grid">
          <Link href="/products"><strong>Products</strong><span>Browse the complete product catalogue →</span></Link>
          <Link href="/catalogue"><strong>Catalogue</strong><span>View the company catalogue →</span></Link>
          <Link href="/#heritage"><strong>Our history</strong><span>Read about the workshop heritage since 1922 →</span></Link>
          <Link href="/#workshop"><strong>Workshop</strong><span>See the stitching process and workshop videos →</span></Link>
        </div>
      </section>
    </main>
  );
}
