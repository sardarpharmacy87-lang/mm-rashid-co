import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { RevealController } from "@/components/reveal-controller";
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

const groupVisuals: Record<string, string> = {
  fez: "/images/gallery/custom-maroon-fez.webp",
  caps: "/images/gallery/silver-bullion-cap-visor.webp",
  jackets: "/images/workshop/hand-stitching.jpeg",
};

const timelineItems = [
  {
    year: "1922",
    label: "The beginning",
    title: "A specialist workshop tradition begins in Sialkot.",
    text: "MM Rashid & Co. was established in Sialkot, building its reputation around disciplined hand embroidery and ceremonial detail.",
    image: "/images/gallery/goldwork-leaf-detail.webp",
  },
  {
    year: "1965",
    label: "The archive",
    title: "The craft passes through the family workshop.",
    text: "A surviving workshop photograph records the people, environment and hand skills that shaped the company through the mid-century period.",
    image: "/images/heritage/mm-rashid-history.jpeg",
  },
  {
    year: "Today",
    label: "The atelier now",
    title: "The same attention to detail continues by hand.",
    text: "Custom ceremonial work is still developed in Sialkot for customers, institutions and specialist businesses around the world.",
    image: "/images/workshop/hand-stitching.jpeg",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share the brief",
    description: "Artwork, dimensions, quantity, colours and the finish you want us to achieve.",
  },
  {
    number: "02",
    title: "Refine the detail",
    description: "We review construction, metallic thread, materials and any specialist requirements.",
  },
  {
    number: "03",
    title: "Make it by hand",
    description: "Our artisans build the piece with the same disciplined handwork the company is known for.",
  },
  {
    number: "04",
    title: "Inspect & dispatch",
    description: "Every finished piece is checked carefully before secure packing and dispatch.",
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
              Ceremonial embroidery, bullion work and custom insignia made with
              patience, precision and a deep respect for tradition.
            </p>

            <div className="bloom-hero-actions">
              <Link className="store-primary-button" href="/products">
                Explore products <span>↗</span>
              </Link>
              <Link className="bloom-text-link" href="/customer/enquiries/new">
                Start a custom enquiry
              </Link>
            </div>

            <dl className="bloom-hero-facts">
              <div><dt>1922</dt><dd>Established</dd></div>
              <div><dt>100+</dt><dd>Years of craft</dd></div>
              <div><dt>Worldwide</dt><dd>Custom work</dd></div>
            </dl>
          </div>

          <div className="bloom-hero-mark reveal delay-one">
            <div className="bloom-orbit bloom-orbit-one" aria-hidden="true" />
            <div className="bloom-orbit bloom-orbit-two" aria-hidden="true" />
            <div className="bloom-emblem-stage">
              <img src="/mm-rashid-logo.png" alt="MM Rashid and Company emblem" />
            </div>
            <div className="bloom-mark-note bloom-mark-note-top">
              <span>01</span>
              <strong>Goldwork</strong>
            </div>
            <div className="bloom-mark-note bloom-mark-note-bottom">
              <span>02</span>
              <strong>Custom regalia</strong>
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

        <section className="luxury-film-section reveal" aria-labelledby="owner-interview-title">
          <div className="luxury-film-copy">
            <p className="bloom-eyebrow">Owner interview</p>
            <h2 id="owner-interview-title">The story behind MM Rashid &amp; Co.</h2>
            <p>
              Hear directly from the company about its history, craftsmanship,
              workshop tradition and the values carried forward in Sialkot.
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
            <div className="luxury-youtube-frame">
              <iframe
                src="https://www.youtube-nocookie.com/embed/h9EH23XPLOk?rel=0"
                title="MM Rashid & Co. owner interview"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="bloom-statement reveal">
          <p className="bloom-eyebrow">MM Rashid &amp; Co.</p>
          <div className="bloom-statement-grid">
            <h2>
              Built slowly.
              <br />
              <span>Remembered instantly.</span>
            </h2>
            <div>
              <p>
                From formal headwear and ceremonial pieces to bespoke insignia,
                our work is developed around the identity it needs to carry.
              </p>
              <Link href="#heritage">Discover our story ↘</Link>
            </div>
          </div>
        </section>

        <div className="luxury-marquee" aria-hidden="true">
          <span>GOLDWORK</span><i>◆</i>
          <span>BULLION</span><i>◆</i>
          <span>CEREMONIAL</span><i>◆</i>
          <span>BESPOKE</span><i>◆</i>
          <span>HANDCRAFTED IN SIALKOT</span>
        </div>

        {groups.length ? (
          <section className="bloom-groups reveal" aria-label="Product groups">
            <div className="bloom-section-heading">
              <div>
                <p className="bloom-eyebrow">Browse the work</p>
                <h2>Choose a direction.</h2>
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
                  <div className="luxury-group-media" aria-hidden="true">
                    <img
                      src={groupVisuals[group.slug] ?? "/images/gallery/goldwork-leaf-detail.webp"}
                      alt=""
                      loading="lazy"
                    />
                  </div>
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
            <p className="bloom-eyebrow bloom-eyebrow-light">Custom commissions</p>
            <h2>Bring us the brief. We&apos;ll build the detail.</h2>
          </div>
          <div>
            <p>
              Send artwork, measurements and quantity. We&apos;ll review the
              construction and prepare the next step around your requirement.
            </p>
            <Link className="store-primary-button" href="/customer/enquiries/new">
              Start your enquiry <span>↗</span>
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
            <div className="bloom-heritage-caption">
              <span>Archive</span>
              <strong>MM Rashid &amp; Co. workshop, circa 1965</strong>
            </div>
          </div>

          <div className="bloom-heritage-copy reveal delay-one">
            <p className="bloom-eyebrow">Our heritage</p>
            <h2>Four generations of specialist handwork.</h2>
            <p>
              The company began in Sialkot in 1922 and grew around the discipline
              of making ceremonial work by hand. The archive photograph preserves
              that workshop tradition and the people behind it.
            </p>
            <p>
              Today, the same emphasis on accuracy, material knowledge and careful
              finishing continues for institutions, uniform businesses, fraternal
              organisations and private customers worldwide.
            </p>
            <Link href="#process">See how we work ↘</Link>
          </div>
        </section>

        <section className="luxury-timeline" id="legacy">
          <div className="luxury-timeline-intro reveal">
            <p className="bloom-eyebrow">A century in three moments</p>
            <h2>1922. 1965. Today.</h2>
            <p>
              The company has changed with time, but the value placed on handwork,
              precision and ceremonial detail has remained constant.
            </p>
          </div>

          <div className="luxury-timeline-list">
            {timelineItems.map((item, index) => (
              <article className="luxury-timeline-item reveal" key={item.year}>
                <div className="luxury-timeline-year">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.year}</strong>
                </div>
                <div className="luxury-timeline-media">
                  <img src={item.image} alt="" loading="lazy" />
                </div>
                <div className="luxury-timeline-copy">
                  <p>{item.label}</p>
                  <h3>{item.title}</h3>
                  <span>{item.text}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bloom-workshop" id="workshop">
          <div className="bloom-section-heading reveal">
            <div>
              <p className="bloom-eyebrow">Inside the workshop</p>
              <h2>Watch the work come together.</h2>
            </div>
            <p>
              A closer look at the hand processes, materials and concentration
              behind the finished detail.
            </p>
          </div>

          <div className="bloom-workshop-frame reveal">
            <video controls playsInline preload="metadata" poster="/images/workshop/stitching-video-poster.jpg">
              <source src="/videos/stitching/stitching-process.mp4" type="video/mp4" />
            </video>
            <div className="bloom-workshop-label">
              <span>Workshop film</span>
              <strong>Hand embroidery · Sialkot</strong>
            </div>
          </div>
        </section>

        <section className="bloom-process" id="process">
          <div className="bloom-process-intro reveal">
            <p className="bloom-eyebrow">How we work</p>
            <h2>A clear route from idea to finished piece.</h2>
            <p>
              Custom work stays simple when each decision is made in the right order.
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
            <p className="bloom-eyebrow bloom-eyebrow-light">Commission enquiries</p>
            <h2>Something worth making starts with a conversation.</h2>
          </div>

          <div className="bloom-contact-actions reveal delay-one">
            <p>
              Tell us what you need, the quantity, delivery country and any artwork
              or measurements you already have.
            </p>
            <Link className="store-primary-button" href="/customer/enquiries/new">
              Start custom enquiry <span>↗</span>
            </Link>
            <a href="tel:+923343342223">+92 334 334 2223</a>
            <span>Commissioner Road · Sialkot 51310 · Pakistan</span>
          </div>
        </section>

        <section className="bloom-trust-rail">
          <article><span>01</span><strong>Custom production</strong><p>Built around your artwork and specification.</p></article>
          <article><span>02</span><strong>Secure portal</strong><p>Track enquiries, quotations and orders.</p></article>
          <article><span>03</span><strong>Worldwide enquiries</strong><p>Working with customers beyond Pakistan.</p></article>
          <article><span>04</span><strong>Made in Sialkot</strong><p>More than a century of specialist craft.</p></article>
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
