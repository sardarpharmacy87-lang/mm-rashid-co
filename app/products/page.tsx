import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
};

export const metadata = {
  title: "Products | MM Rashid & Co.",
  description: "Browse handcrafted ceremonial regalia, bullion embroidery, badges, aprons, caps, banners and custom accessories.",
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 24;

  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  let query = supabase
    .from("products")
    .select("id, name, slug, sku, short_description, primary_image, price_pkr, price_usd, previous_price_pkr, previous_price_usd, price_on_request, stock_status, categories(name, slug)", { count: "exact" })
    .eq("active", true);

  const selectedCategory = categories.find((category) => category.slug === filters.category);
  if (selectedCategory) query = query.eq("category_id", selectedCategory.id);

  const safeSearch = (filters.q ?? "").trim().replace(/[%_]/g, "");
  if (safeSearch) query = query.ilike("name", "%" + safeSearch + "%");

  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "name") query = query.order("name", { ascending: true });
  else query = query.order("sort_order", { ascending: true }).order("name", { ascending: true });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const result = await query.range(from, to);
  const products = (result.data ?? []) as unknown as ProductCardData[];
  const pageCount = Math.max(1, Math.ceil((result.count ?? 0) / pageSize));

  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", String(nextPage));
    return "/products?" + params.toString();
  };

  return (
    <div className="store-shell">
      <CommerceHeader categories={categories.map(({ name, slug }) => ({ name, slug }))} />

      <main className="catalogue-page">
        <div className="catalogue-hero">
          <div>
            <p className="store-kicker">MM Rashid catalogue</p>
            <h1>Products &amp; custom regalia</h1>
            <p>Browse our core product range or send your own artwork for a custom quotation.</p>
          </div>
          <Link className="store-primary-button" href="/customer/enquiries/new">Custom enquiry</Link>
        </div>

        <div className="catalogue-layout">
          <aside className="catalogue-sidebar">
            <strong>Categories</strong>
            <Link className={!filters.category ? "is-active" : ""} href="/products">All products</Link>
            {categories.map((category) => (
              <Link
                className={filters.category === category.slug ? "is-active" : ""}
                href={"/products?category=" + encodeURIComponent(category.slug)}
                key={category.id}
              >
                {category.name}
              </Link>
            ))}
          </aside>

          <section className="catalogue-results">
            <form className="catalogue-toolbar" action="/products" method="get">
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Search product name..."
                aria-label="Search catalogue"
              />
              <select name="category" defaultValue={filters.category ?? ""}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option value={category.slug} key={category.id}>{category.name}</option>
                ))}
              </select>
              <select name="sort" defaultValue={filters.sort ?? ""}>
                <option value="">Recommended</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
              </select>
              <button type="submit">Apply</button>
            </form>

            <div className="catalogue-count">
              <span>{result.count ?? products.length} products</span>
              {safeSearch ? <span>Search: “{safeSearch}”</span> : null}
            </div>

            {products.length ? (
              <div className="store-product-grid catalogue-product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="catalogue-empty">
                <h2>No matching products</h2>
                <p>Try another category or send us the product reference you need.</p>
                <Link href="/customer/enquiries/new">Send custom enquiry</Link>
              </div>
            )}

            {pageCount > 1 ? (
              <nav className="catalogue-pagination" aria-label="Product pages">
                {page > 1 ? <Link href={makePageHref(page - 1)}>← Previous</Link> : <span />}
                <strong>Page {page} of {pageCount}</strong>
                {page < pageCount ? <Link href={makePageHref(page + 1)}>Next →</Link> : <span />}
              </nav>
            ) : null}
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
