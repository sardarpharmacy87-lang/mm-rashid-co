import Image from "next/image";
import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";
export const metadata = {
  title: "The collections",
  description:
    "Discover ceremonial regalia, bullion embroidery and made-to-order insignia from MM Rashid & Co.",
};
export default async function Collections() {
  const supabase = await createClient();
  const [{ data: groups }, { data: products }] = await Promise.all([
    supabase
      .from("product_groups")
      .select("id,name,slug")
      .eq("active", true)
      .order("sort_order"),
    supabase.rpc("homepage_products", { per_group: 1 }),
  ]);
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main id="main-content" className="editorial-page">
        <p className="eyebrow">MM Rashid &amp; Co.</p>
        <h1 className="editorial-title">The collections.</h1>
        <p className="editorial-intro">
          Distinctive pieces. Shared craftsmanship. Explore our work, then make
          it your own.
        </p>
        <div className="atelier-collections">
          {(groups ?? []).map((g, i) => {
            const product = (
              (products as {
                product_group_id: string;
                primary_image: string;
              }[]) ?? []
            ).find((p) => p.product_group_id === g.id);
            return (
              <Link
                key={g.id}
                href={"/products?group=" + g.slug}
                className="atelier-collection"
              >
                <div className="collection-image">
                  {product?.primary_image ? (
                    <Image
                      src={product.primary_image}
                      alt={g.name}
                      fill
                      sizes="(max-width:760px) 90vw, 30vw"
                    />
                  ) : (
                    <div className="store-image-placeholder">
                      MM RASHID &amp; CO.
                    </div>
                  )}
                </div>
                <div className="collection-caption">
                  <span className="collection-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{g.name}</h3>
                  <span>↗</span>
                </div>
              </Link>
            );
          })}
        </div>
        {!groups?.length && (
          <p>
            The collections are temporarily unavailable.{" "}
            <Link className="text-link" href="/contact">
              Contact our workshop
            </Link>
            .
          </p>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
