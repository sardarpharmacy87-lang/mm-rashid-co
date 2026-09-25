import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [productsResult, groupsResult, slidesResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("product_groups").select("id", { count: "exact", head: true }),
    supabase.from("homepage_slides").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Administration</p>
          <h1>Website management</h1>
          <p>Manage products, product sections and homepage slides.</p>
        </div>
      </div>

      <section className="summary-grid">
        <article><strong>{productsResult.count ?? 0}</strong><span>Products</span></article>
        <article><strong>{groupsResult.count ?? 0}</strong><span>Product sections</span></article>
        <article><strong>{slidesResult.count ?? 0}</strong><span>Homepage slides</span></article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Products</h2>
            <p>Add, edit and organize the public product catalogue.</p>
          </div>
          <Link className="portal-button" href="/admin/products">Manage products</Link>
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Homepage slides</h2>
            <p>Manage the images shown in the homepage presentation.</p>
          </div>
          <Link className="portal-button" href="/admin/slides">Manage slides</Link>
        </div>
      </section>
    </main>
  );
}
