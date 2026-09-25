import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboard() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, email, phone, country, city, role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">{profile?.role === "admin" ? "Administrator account" : "Customer account"}</p>
          <h1>Welcome, {profile?.full_name ?? "Customer"}</h1>
          <p>Your private MM Rashid &amp; Co. account and website shortcuts.</p>
        </div>
        {profile?.role === "admin" ? (
          <Link className="portal-button" href="/admin">Open admin portal</Link>
        ) : (
          <Link className="portal-button" href="/products">Browse products</Link>
        )}
      </div>

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
