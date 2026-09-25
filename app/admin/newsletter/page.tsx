import { createClient } from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Marketing</p>
          <h1>Newsletter subscribers</h1>
          <p>Recent email subscribers collected from the website footer.</p>
        </div>
      </div>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>{subscribers?.length ?? 0} recent subscribers</h2>
        </div>
        {(subscribers ?? []).length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead><tr><th>Email</th><th>Subscribed</th></tr></thead>
              <tbody>
                {(subscribers ?? []).map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.email}</td>
                    <td>{new Date(subscriber.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>No newsletter subscribers yet.</p>}
      </section>
    </main>
  );
}
