import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [featuredResult, latestResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, sku, short_description, primary_image, price_pkr, price_usd, previous_price_pkr, previous_price_usd, price_on_request, stock_status")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(8),
    supabase
      .from("products")
      .select("id, name, slug, sku, short_description, primary_image, price_pkr, price_usd, previous_price_pkr, previous_price_usd, price_on_request, stock_status")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const featured = (featuredResult.data ?? []) as ProductCardData[];
  const latest = (latestResult.data ?? []) as ProductCardData[];

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
            <img
              src="/images/showcase/fraternal-apron.webp"
              alt="Custom ceremonial work by MM Rashid and Company"
            />
            <div className="hero-floating-card">
              <small>Featured craft</small>
              <strong>Handcrafted ceremonial regalia</strong>
              <Link href="/products">View products →</Link>
            </div>
          </div>
        </section>

        <section className="store-section product-shop" id="featured">
          <div className="store-section-heading">
            <div>
              <p className="store-kicker">Selected work</p>
              <h2>Featured products</h2>
            </div>
            <Link href="/products">Browse all products →</Link>
          </div>

          <div className="store-product-grid">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="custom-order-strip">
          <div>
            <p className="store-kicker store-kicker-light">Need your own design?</p>
            <h2>Send artwork, measurements and quantity. We build the detail.</h2>
          </div>
          <Link href="/customer/enquiries/new">Start custom enquiry →</Link>
        </section>

        <section className="store-section product-shop">
          <div className="store-section-heading">
            <div>
              <p className="store-kicker">Recently added</p>
              <h2>More from the workshop</h2>
            </div>
            <Link href="/products?sort=newest">See newest →</Link>
          </div>
          <div className="store-product-grid">
            {latest.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
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
