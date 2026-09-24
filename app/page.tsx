import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

type ProductGroup = {
  id: string;
  name: string;
  slug: string;
};

type HomeProduct = ProductCardData & {
  product_group_id: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const [groupsResult, productsResult] = await Promise.all([
    supabase
      .from("product_groups")
      .select("id, name, slug")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, slug, sku, short_description, primary_image, stock_status, product_group_id")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const groups = (groupsResult.data ?? []) as ProductGroup[];
  const products = (productsResult.data ?? []) as HomeProduct[];

  return (
    <div className="store-shell">
      <CommerceHeader />

      <main>
        <section className="commerce-hero">
          <div className="commerce-hero-copy">
            <p className="store-kicker">MM Rashid &amp; Co. · Established 1922</p>
            <h1>Handcrafted regalia, made around your identity.</h1>
            <p>
              Custom ceremonial embroidery, bullion work, headwear, banners,
              badges and accessories made in Sialkot for customers worldwide.
            </p>
            <div className="commerce-hero-actions">
              <Link className="store-primary-button" href="/products">View products</Link>
              <Link className="store-secondary-button" href="/customer/enquiries/new">Send custom artwork</Link>
            </div>
            <div className="hero-trust">
              <span><strong>100+</strong> years of craft</span>
              <span><strong>Custom</strong> production</span>
              <span><strong>Worldwide</strong> enquiries</span>
            </div>
          </div>

          <div className="commerce-hero-visual">
            <div className="hero-product-ring" />
            <div className="hero-logo-stage" aria-label="MM Rashid and Company logo">
              <img src="/mm-rashid-logo.png" alt="MM Rashid and Company logo" />
            </div>
          </div>
        </section>

        {groups.length ? (
          <nav className="product-group-nav home-product-group-nav" aria-label="Browse products">
            {groups.map((group) => (
              <Link href={"/products?group=" + group.slug} key={group.id}>{group.name}</Link>
            ))}
          </nav>
        ) : null}

        {groups.map((group) => {
          const groupProducts = products.filter((product) => product.product_group_id === group.id);
          if (!groupProducts.length) return null;

          return (
            <section className="store-section product-shop home-product-group" key={group.id}>
              <div className="store-section-heading">
                <div><h2>{group.name}</h2></div>
                <Link href={"/products?group=" + group.slug}>View all →</Link>
              </div>
              <div className="store-product-grid">
                {groupProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="custom-order-strip">
          <div>
            <p className="store-kicker store-kicker-light">Need your own design?</p>
            <h2>Send artwork, measurements and quantity. We build the detail.</h2>
          </div>
          <Link href="/customer/enquiries/new">Start custom enquiry →</Link>
        </section>

        <section className="store-heritage" id="heritage">
          <div className="store-heritage-image">
            <img src="/images/heritage/mm-rashid-history.jpeg" alt="MM Rashid and Company historic workshop" />
          </div>
          <div className="store-heritage-copy">
            <p className="store-kicker">Our heritage</p>
            <h2>A Sialkot family craft established in 1922.</h2>
            <p>
              For more than a century, skilled hands have transformed metallic thread,
              purl, cord, sequins and fine textiles into ceremonial work made to carry
              identity, rank and tradition.
            </p>
            <p>
              Today MM Rashid &amp; Co. continues that specialist work for institutions,
              uniform businesses and private customers around the world.
            </p>
            <Link href="/customer/enquiries/new">Discuss a commission →</Link>
          </div>
        </section>

        <section className="store-workshop" id="workshop">
          <div className="store-section-heading">
            <div>
              <p className="store-kicker">Inside the workshop</p>
              <h2>See how the detail is made.</h2>
            </div>
          </div>
          <video controls playsInline preload="metadata" poster="/images/workshop/stitching-video-poster.jpg">
            <source src="/videos/stitching/stitching-process.mp4" type="video/mp4" />
          </video>
        </section>

        <section className="store-benefits">
          <article><strong>Custom production</strong><p>Artwork, colours, dimensions and finishing developed to your brief.</p></article>
          <article><strong>Secure customer portal</strong><p>Track enquiries, quotations and order progress from one account.</p></article>
          <article><strong>International enquiries</strong><p>Built for customers, institutions and businesses worldwide.</p></article>
          <article><strong>Made in Sialkot</strong><p>Specialist embroidery craftsmanship with more than a century of heritage.</p></article>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
