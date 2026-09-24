import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { HomepageSlider, type HomepageSlide } from "@/components/homepage-slider";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { RevealController } from "@/components/reveal-controller";
import { WorkshopReels } from "@/components/workshop-reels";
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

const groupVisuals: Record<string, string> = {};

const processSteps = [
  {
    number: "01",
    title: "Send the artwork",
    description: "Send artwork or a reference, along with size, quantity and colours.",
  },
  {
    number: "02",
    title: "Confirm materials",
    description: "We check construction, thread, materials and the required finish.",
  },
  {
    number: "03",
    title: "Production",
    description: "The piece is made in the workshop to the confirmed specification.",
  },
  {
    number: "04",
    title: "Final check",
    description: "We inspect, pack and dispatch the finished order.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [groupsResult, productsResult, slidesResult] = await Promise.all([
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
    supabase
      .from("homepage_slides")
      .select("id, image_url, alt_text, sort_order, delay_ms")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const groups = (groupsResult.data ?? []) as ProductGroup[];
  const products = (productsResult.data ?? []) as HomeProduct[];
  const slides = (slidesResult.data ?? []) as HomepageSlide[];
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mm-rashid-co-l5hh.vercel.app";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MM Rashid & Co.",
    url: siteUrl,
    logo: siteUrl + "/mm-rashid-logo.png",
    foundingDate: "1922",
    telephone: "+92 334 334 2223",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Commissioner Road",
      addressLocality: "Sialkot",
      postalCode: "51310",
      addressCountry: "PK",
    },
  };

  return (
    <div className="store-shell bloom-site">
      <RevealController />
      <CommerceHeader />

      <main className="bloom-home">
        <section className="bloom-hero">
          <div className="bloom-hero-grid" aria-hidden="true" />

          <div className="bloom-hero-copy reveal">
            <p className="bloom-eyebrow">Sialkot · Pakistan · Since 1922</p>
            <h1>
              Regalia with
              <span> a century of handwork.</span>
            </h1>
            <p className="bloom-hero-intro">
              Ceremonial embroidery, bullion work and insignia made in our
              Sialkot workshop to supplied artwork and specification.
            </p>

            <div className="bloom-hero-actions">
              <Link className="store-primary-button" href="/products">
                Explore products <span>↗</span>
              </Link>
            </div>

            <dl className="bloom-hero-facts">
              <div><dt>1922</dt><dd>Established</dd></div>
              <div><dt>Sialkot</dt><dd>Workshop</dd></div>
              <div><dt>Made to order</dt><dd>By specification</dd></div>
            </dl>
          </div>

          <div className="bloom-hero-mark reveal delay-one">
            <div className="bloom-orbit bloom-orbit-one" aria-hidden="true" />
            <div className="bloom-orbit bloom-orbit-two" aria-hidden="true" />
            <div className="bloom-emblem-stage">
              <img src="/mm-rashid-logo.png" alt="MM Rashid and Company emblem" />
            </div>
            <div className="luxury-seal" aria-label="Established 1922 in Sialkot">
              <span>EST.</span>
              <strong>1922</strong>
              <em>SIALKOT</em>
            </div>
          </div>

          <div className="bloom-scroll-cue" aria-hidden="true">
            <span />
            Scroll to explore
          </div>
        </section>

        <HomepageSlider slides={slides} />

        <section className="luxury-film-section reveal" aria-labelledby="owner-interview-title">
          <div className="luxury-film-copy">
            <p className="bloom-eyebrow">Owner interview</p>
            <h2 id="owner-interview-title">A conversation about the workshop.</h2>
            <p>
              The owner talks about the company, its history in Sialkot and the
              work being made in the workshop today.
            </p>
          </div>

          <div className="luxury-film-window">
            <div className="luxury-film-window-bar">
              <div aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <strong>OWNER INTERVIEW · MM RASHID &amp; CO.</strong>
              <em>SIALKOT · PAKISTAN</em>
            </div>
            <video controls playsInline preload="metadata">
              <source
                src="https://pub-dfe5ed136766499f955fc1f470752cdd.r2.dev/M-Rashid-Interview.mp4"
                type="video/mp4"
              />
              Your browser does not support the video element.
            </video>
          </div>
        </section>

        <section className="bloom-statement reveal">
          <p className="bloom-eyebrow">MM Rashid &amp; Co.</p>
          <div className="bloom-statement-grid">
            <h2>
              Ceremonial embroidery.
              <br />
              <span>Made to specification.</span>
            </h2>
            <div>
              <p>
                We make headwear, bullion embroidery, insignia and ceremonial
                pieces from supplied artwork, measurements and reference samples.
              </p>
              <Link href="#heritage">Our history ↘</Link>
            </div>
          </div>
        </section>

        <div className="luxury-marquee" aria-hidden="true">
          <div className="luxury-marquee-track">
            {[0, 1].map((copy) => (
              <div className="luxury-marquee-set" key={copy}>
                <span>GOLDWORK</span><i>◆</i>
                <span>BULLION</span><i>◆</i>
                <span>CEREMONIAL</span><i>◆</i>
                <span>BESPOKE</span><i>◆</i>
                <span>HANDCRAFTED IN SIALKOT</span><i>◆</i>
              </div>
            ))}
          </div>
        </div>

        {groups.length ? (
          <section className="bloom-groups reveal" aria-label="Product groups">
            <div className="bloom-section-heading">
              <div>
                <p className="bloom-eyebrow">Products</p>
                <h2>Browse by section.</h2>
              </div>
              <Link href="/products">View all products ↗</Link>
            </div>

            <div className="bloom-group-grid">
              {groups.map((group, index) => (
                <Link
                  className="bloom-group-card"
                  href={"/products?group=" + group.slug}
                  key={group.id}
                >
                  {groupVisuals[group.slug] ? (
                    <div className="luxury-group-media" aria-hidden="true">
                      <img
                        src={groupVisuals[group.slug]}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{group.name}</strong>
                  <i aria-hidden="true">↗</i>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {groups.map((group) => {
          const groupProducts = products.filter((product) => product.product_group_id === group.id);
          if (!groupProducts.length) return null;

          return (
            <section className="store-section product-shop home-product-group bloom-product-section reveal" key={group.id}>
              <div className="store-section-heading">
                <div>
                  <p className="bloom-eyebrow">Selected work</p>
                  <h2>{group.name}</h2>
                </div>
                <Link href={"/products?group=" + group.slug}>View all ↗</Link>
              </div>
              <div className="store-product-grid">
                {groupProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="bloom-commission reveal">
          <div>
            <p className="bloom-eyebrow bloom-eyebrow-light">Made to order</p>
            <h2>Send your artwork and requirements.</h2>
          </div>
          <div>
            <p>
              Include quantity, dimensions, colours and delivery country. We will
              review the details and reply with the next steps.
            </p>
            <Link className="store-primary-button" href="/customer/enquiries/new">
              Send an enquiry <span>↗</span>
            </Link>
          </div>
        </section>

        <section className="bloom-heritage" id="heritage">
          <div className="bloom-heritage-media reveal">
            <img
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="Historic MM Rashid and Company workshop in Sialkot, circa 1965"
            />
            <div className="bloom-year" aria-hidden="true">1922</div>
          </div>

          <div className="bloom-heritage-copy reveal delay-one">
            <p className="bloom-eyebrow">Our heritage</p>
            <h2 className="heritage-motion-title">
              <span className="motion-line">Three generations in</span>
              <span className="motion-line">the workshop.</span>
            </h2>
            <p>
              MM Rashid &amp; Co. began in Sialkot in 1922. The archive photograph
              records the workshop tradition that has continued through the family.
            </p>
            <p>
              Today the workshop still produces embroidery, bullion work and
              ceremonial pieces to customer specification.
            </p>
            <Link href="#process">See how we work ↘</Link>
          </div>
        </section>

        <section className="bloom-workshop" id="workshop">
          <div className="bloom-section-heading reveal">
            <div>
              <p className="bloom-eyebrow">Inside the workshop</p>
              <h2>Stitching in progress.</h2>
            </div>
            <p>
              A short look at the hand stitching behind the finished pieces.
            </p>
          </div>

          <div className="bloom-workshop-frame reveal">
            <WorkshopReels />
          </div>
        </section>

        <section className="bloom-process" id="process">
          <div className="bloom-process-intro reveal">
            <p className="bloom-eyebrow">How we work</p>
            <h2>From artwork to finished piece.</h2>
            <p>
              For made-to-order work, we confirm the details before production begins.
            </p>
          </div>

          <ol className="bloom-process-list">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <i aria-hidden="true">↗</i>
              </li>
            ))}
          </ol>
        </section>

        <section className="bloom-contact" id="contact">
          <div className="bloom-contact-copy reveal">
            <p className="bloom-eyebrow bloom-eyebrow-light">Contact</p>
            <h2>MM Rashid &amp; Co., Sialkot.</h2>
          </div>

          <div className="bloom-contact-actions reveal delay-one">
            <p>
              For quotations and order questions, contact the workshop by telephone
              or use the customer enquiry form.
            </p>
            <a href="tel:+923343342223">+92 334 334 2223</a>
            <span>Commissioner Road · Sialkot 51310 · Pakistan</span>
          </div>
        </section>

      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <StoreFooter />
    </div>
  );
}
