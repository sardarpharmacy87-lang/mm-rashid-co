import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("id, enquiry_number, customer_id, title, quantity, delivery_country, status, created_at")
    .order("created_at", { ascending: false });

  const rows = enquiries ?? [];
  const customerIds = Array.from(new Set(rows.map((row) => row.customer_id)));
  const { data: profiles } = customerIds.length
    ? await supabase.from("profiles").select("id, full_name, company_name, email").in("id", customerIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Sales enquiries</p>
          <h1>Rate requests</h1>
          <p>Customers submit a quantity first. Send the rate that applies to that quantity.</p>
        </div>
      </div>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Customer enquiries</h2></div>
        {rows.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead><tr><th>Enquiry</th><th>Customer</th><th>Product</th><th>Qty</th><th>Status</th><th /></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const profile = profileMap.get(row.customer_id);
                  return (
                    <tr key={row.id}>
                      <td><strong>{row.enquiry_number}</strong><br /><small>{new Date(row.created_at).toLocaleDateString()}</small></td>
                      <td>{profile?.company_name || profile?.full_name || profile?.email || "Customer"}</td>
                      <td>{row.title.replace("Rate request — ", "")}</td>
                      <td>{row.quantity}</td>
                      <td><span className="status">{row.status.replace("_", " ")}</span></td>
                      <td><Link className="portal-button portal-button-secondary" href={"/admin/enquiries/" + row.id}>Open</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p>No rate requests yet.</p>}
      </section>
    </main>
  );
}
