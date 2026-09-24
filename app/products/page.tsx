import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

type CatalogueProduct = ProductCardData & {
  created_at?: string | null;
};

export const metadata = {
  title: "Products",
  description:
    "Browse handcrafted ceremonial regalia, bullion embroidery, badges, caps, banners and custom accessories.",
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 24;

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, short_description, primary_image, price_pkr, price_usd, previous_price_pkr, previous_price_usd, price_on_request, stock_status, created_at",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const allProducts = (data ?? []) as CatalogueProduct[];
  const safeSearch = (filters.q ?? "").trim().toLowerCase();

  let filtered = allProducts.filter((product) => {
    if (!safeSearch) return true;
    const haystack = [product.name, product.sku, product.short_description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(safeSearch);
  });

  if (filters.sort === "newest") {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
  } else if (filters.sort === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const from = (safePage - 1) * pageSize;
  const products = filtered.slice(from, from + pageSize);

  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", String(nextPage));
    return "/products?" + params.toString();
  };

  return (
    <div className="store-shell">
      <CommerceHeader />

      <main className="catalogue-page">
        <div className="catalogue-hero">
          <div>
            <p className="store-kicker">MM Rashid catalogue</p>
            <h1>Products &amp; custom regalia</h1>
            <p>Browse all products or send your own artwork for a custom quotation.</p>
          </div>
          <Link className="store-primary-button" href="/customer/enquiries/new">Custom enquiry</Link>
        </div>

        <div className="catalogue-layout catalogue-layout-simple">
          <section className="catalogue-results">
            <form className="catalogue-toolbar catalogue-toolbar-simple" action="/products" method="get">
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Search product name or SKU..."
                aria-label="Search catalogue"
              />
              <select name="sort" defaultValue={filters.sort ?? ""}>
                <option value="">Recommended</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
              </select>
              <button type="submit">Apply</button>
            </form>

            <div className="catalogue-count">
              <span>{filtered.length} products</span>
              {safeSearch ? <span>Search: “{filters.q}”</span> : null}
            </div>

            {products.length ? (
              <div className="store-product-grid catalogue-product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="catalogue-empty">
                <h2>No matching products</h2>
                <p>Try another search or send us the product reference you need.</p>
                <Link href="/customer/enquiries/new">Send custom enquiry</Link>
              </div>
            )}

            {pageCount > 1 ? (
              <nav className="catalogue-pagination" aria-label="Product pages">
                {safePage > 1 ? <Link href={makePageHref(safePage - 1)}>← Previous</Link> : <span />}
                <strong>Page {safePage} of {pageCount}</strong>
                {safePage < pageCount ? <Link href={makePageHref(safePage + 1)}>Next →</Link> : <span />}
              </nav>
            ) : null}
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
