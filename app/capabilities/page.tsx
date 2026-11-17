import Image from "next/image";
import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";
import { CRAFT_IMAGE_PREFIX, type CraftItem } from "@/lib/craft";

export const metadata = { title: "Our craft", description: "Explore work from the MM Rashid & Co. workshop." };

export default async function CraftPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requested = Number(params.page);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 10000 ? requested : 1;
  const size = 24;
  const supabase = await createClient();
  const { data, count, error } = await supabase.from("craft_items")
    .select("id,title,description,image_path,active,sort_order,updated_at", { count: "exact" })
    .eq("active", true).order("sort_order").order("created_at").order("id")
    .range((page - 1) * size, page * size - 1);
  return (
    <div className="store-shell atelier">
      <CommerceHeader />
      <main className="editorial-page" id="main-content">
        <p className="eyebrow">MM Rashid &amp; Co.</p>
        <h1 className="editorial-title">Our craft.</h1>
        <p className="editorial-intro">A closer look at work from our workshop.</p>
        {error ? <p role="alert">Our craft collection is temporarily unavailable. Please try again shortly.</p> :
          data?.length ? <div className="store-product-grid">
            {(data as CraftItem[]).map(item => (
              <article className="store-product-card" key={item.id}>
                <div className="store-product-media">
                  <Image src={CRAFT_IMAGE_PREFIX + item.image_path} alt={item.title} fill sizes="(max-width:620px) 50vw, (max-width:1050px) 33vw, 25vw" style={{ objectFit: "contain" }} />
                </div>
                <div className="store-product-content">
                  <h2>{item.title}</h2>
                  <p style={{ whiteSpace: "pre-wrap" }}>{item.description}</p>
                </div>
              </article>
            ))}
          </div> : <p>No craft entries to display yet.</p>}
        {!error && (page > 1 || (count ?? 0) > page * size) && (
          <nav className="catalogue-pagination" aria-label="Craft pages">
            {page > 1 ? <Link href={"/capabilities?page=" + (page - 1)}>← Previous</Link> : <span />}
            <span>Page {page}</span>
            {(count ?? 0) > page * size ? <Link href={"/capabilities?page=" + (page + 1)}>Next →</Link> : <span />}
          </nav>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
