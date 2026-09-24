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

const processSteps = [
  {
    number: "01",
    title: "Share the brief",
    description: "Send your artwork, measurements, quantity and required finish.",
  },
  {
    number: "02",
    title: "Material and detail review",
    description: "We confirm colours, bullion style, construction and production details.",
  },
  {
    number: "03",
    title: "Hand production",
    description: "Our artisans build each piece with disciplined and exacting handwork.",
  },
  {
    number: "04",
    title: "Inspection and dispatch",
    description: "Finished work is checked carefully before secure packing and dispatch.",
  },
];

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

        <section className="store-heritage store-heritage-expanded" id="heritage">
          <div className="store-heritage-image">
            <img
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="Historic MM Rashid and Company workshop in Sialkot, circa 1965"
            />
            <div className="heritage-caption">
              <strong>MM Rashid &amp; Co. workshop, circa 1965</strong>
              <span>Muhammad Pura, Commissioner Road, Sialkot</span>
            </div>
          </div>

          <div className="store-heritage-copy">
            <p className="store-kicker">Our heritage</p>
            <h2>A family craft established in 1922.</h2>
            <p>
              This historical photograph, taken around 1965 at Muhammad Pura,
              Commissioner Road, Sialkot, preserves an early chapter of MM Rashid
              &amp; Co. and the workshop tradition behind the company.
            </p>
            <p>
              Founder Muhammad Rashid is pictured with his father Muhammad Hakim
              Deen, his son Muhammad Rafique and craftsmen working by hand on
              embroidered pieces. Behind them are examples of badges and other
              workshop work produced using skills passed through generations.
            </p>
            <p>
              Today the same emphasis on handwork, accuracy and ceremonial detail
              continues in commissions made for institutions, uniform businesses,
              fraternal organisations and private customers worldwide.
            </p>
            <Link href="#process">See how we work →</Link>
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

        <section className="legacy-process" id="process">
          <div className="legacy-process-copy">
            <p className="store-kicker store-kicker-light">Our process</p>
            <h2>From your brief to finished handwork.</h2>
            <p>
              A clear process keeps custom details faithful to your artwork,
              dimensions and required finish.
            </p>
          </div>

          <ol className="legacy-process-list">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="legacy-contact" id="contact">
          <div>
            <p className="store-kicker store-kicker-light">Commission enquiries</p>
            <h2>Let&apos;s create something worthy of the occasion.</h2>
            <p>
              Tell us what you need, the required quantity, delivery country and
              any artwork or measurements you already have.
            </p>
          </div>

          <div className="legacy-contact-actions">
            <Link className="store-primary-button" href="/customer/enquiries/new">
              Start custom enquiry
            </Link>
            <a className="legacy-phone-link" href="tel:+923343342223">+92 334 334 2223</a>
            <span>Commissioner Road · Sialkot 51310 · Pakistan</span>
          </div>
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
