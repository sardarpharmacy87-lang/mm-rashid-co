import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; group?: string }>;
};

type ProductGroup = {
  id: string;
  name: string;
  slug: string;
};

type CatalogueProduct = ProductCardData & {
  created_at?: string | null;
  product_group_id?: string | null;
};

export const metadata = {
  title: "Products",
  description:
    "Browse ceremonial regalia, bullion embroidery, badges, caps and other made-to-order pieces.",
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 24;

  const [productsResult, groupsResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, sku, short_description, primary_image, stock_status, created_at, product_group_id")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("product_groups")
      .select("id, name, slug")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const allProducts = (productsResult.data ?? []) as CatalogueProduct[];
  const groups = (groupsResult.data ?? []) as ProductGroup[];
  const selectedGroup = groups.find((item) => item.slug === filters.group) ?? null;
  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));
  const safeSearch = (filters.q ?? "").trim().toLowerCase();

  let filtered = allProducts.filter((product) => {
    if (selectedGroup && product.product_group_id !== selectedGroup.id) return false;
    if (!safeSearch) return true;
    const haystack = [
      product.name,
      product.sku,
      product.short_description,
      product.product_group_id ? groupNameById.get(product.product_group_id) : null,
    ]
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

  const groupedHomeView = !selectedGroup && !safeSearch && !filters.sort;
  const groupedProducts = groups.map((group) => ({
    ...group,
    products: allProducts.filter((product) => product.product_group_id === group.id),
  }));
  const ungrouped = allProducts.filter((product) => !product.product_group_id);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const from = (safePage - 1) * pageSize;
  const products = filtered.slice(from, from + pageSize);

  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.group) params.set("group", filters.group);
    params.set("page", String(nextPage));
    return "/products?" + params.toString();
  };

  return (
    <div className="store-shell">
      <CommerceHeader />

      <main className="catalogue-page">
        <div className="catalogue-hero">
          <div>
            <p className="store-kicker">MM Rashid &amp; Co.</p>
            <h1>Products</h1>
            <p>Browse current pieces by section. For made-to-order work, send artwork and quantity with your enquiry.</p>
          </div>
          <Link className="store-primary-button" href="/customer/enquiries/new">Send enquiry</Link>
        </div>

        {groups.length ? (
          <nav className="product-group-nav" aria-label="Browse products">
            <Link className={!selectedGroup ? "is-active" : ""} href="/products">All</Link>
            {groups.map((group) => (
              <Link
                className={selectedGroup?.id === group.id ? "is-active" : ""}
                href={"/products?group=" + group.slug}
                key={group.id}
              >
                {group.name}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="catalogue-layout catalogue-layout-simple">
          <section className="catalogue-results">
            <form className="catalogue-toolbar catalogue-toolbar-simple" action="/products" method="get">
              {selectedGroup ? <input type="hidden" name="group" value={selectedGroup.slug} /> : null}
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

            {selectedGroup ? (
              <div className="product-group-heading">
                <h2>{selectedGroup.name}</h2>
                <span>{filtered.length} products</span>
              </div>
            ) : safeSearch ? (
              <div className="catalogue-count">
                <span>{filtered.length} products</span>
                <span>Search: “{filters.q}”</span>
              </div>
            ) : null}

            {groupedHomeView ? (
              <div className="product-group-list">
                {groupedProducts.map((group) => (
                  <section className="product-group-block" id={group.slug} key={group.id}>
                    <div className="product-group-heading">
                      <h2>{group.name}</h2>
                      {group.products.length ? (
                        <Link href={"/products?group=" + group.slug}>View all →</Link>
                      ) : null}
                    </div>
                    {group.products.length ? (
                      <div className="store-product-grid catalogue-product-grid">
                        {group.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}

                {ungrouped.length ? (
                  <section className="product-group-block">
                    <div className="product-group-heading"><h2>More</h2></div>
                    <div className="store-product-grid catalogue-product-grid">
                      {ungrouped.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                  </section>
                ) : null}

                {!allProducts.length ? (
                  <div className="catalogue-empty">
                    <h2>No products added yet</h2>
                    <p>Products will appear here after they are added in the admin portal.</p>
                  </div>
                ) : null}
              </div>
            ) : products.length ? (
              <div className="store-product-grid catalogue-product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="catalogue-empty">
                <h2>No matching products</h2>
                <p>Try another search or send us the product reference you need.</p>
                <Link href="/customer/enquiries/new">Send enquiry</Link>
              </div>
            )}

            {!groupedHomeView && pageCount > 1 ? (
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
