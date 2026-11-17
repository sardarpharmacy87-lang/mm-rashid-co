import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminCraftForm } from "@/components/admin-craft-form";
import type { CraftItem } from "@/lib/craft";

export default async function AdminCraftPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("craft_items").select("*").order("sort_order").order("created_at");
  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div><p className="portal-kicker">Website administration</p><h1>Our Craft</h1><p>Add pictures and descriptions for the Our Craft page.</p></div>
        <Link className="portal-button" href="/capabilities">View Our Craft</Link>
      </div>
      <section className="portal-section"><h2>Add a craft entry</h2><AdminCraftForm /></section>
      <section className="portal-section">
        <h2>Craft entries</h2>
        {error ? <p role="alert">Unable to load craft entries. Please reload.</p> :
          data?.length ? <div className="admin-slide-grid">{(data as CraftItem[]).map(item =>
            <AdminCraftForm key={item.id + item.updated_at} item={item} />
          )}</div> : <p>No craft entries yet. Add your first entry above.</p>}
      </section>
    </main>
  );
}
