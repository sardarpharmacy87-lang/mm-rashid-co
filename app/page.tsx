import Image from "next/image";
import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import {
  HomepageSlider,
  type HomepageSlide,
} from "@/components/homepage-slider";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { WorkshopReels } from "@/components/workshop-reels";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";
import { Faq } from "@/components/faq";
import { RoyalHero } from "@/components/royal-hero";

type Group = { id: string; name: string; slug: string };
type HomeProduct = ProductCardData & { product_group_id: string | null };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ newsletter?: string }>;
}) {
  const { newsletter } = await searchParams;
  const supabase = await createClient();
  const [g, p, s] = await Promise.all([
    supabase
      .from("product_groups")
      .select("id,name,slug")
      .eq("active", true)
      .order("sort_order"),
    supabase.rpc("homepage_products", { per_group: 4 }),
    supabase
      .from("homepage_slides")
      .select("id,image_url,alt_text,sort_order,delay_ms")
      .eq("active", true)
      .order("sort_order"),
  ]);
  const groups = (g.data ?? []) as Group[];
  const products = (p.data ?? []) as HomeProduct[];
  const slides = (s.data ?? []) as HomepageSlide[];
  return (
    <div className="store-shell atelier royal-home">
      <CommerceHeader />
      <main id="main-content">
        <RoyalHero />
        <section
          className="atelier-section royal-collection-section"
          id="collections"
        >
          <div className="atelier-section-heading">
            <div>
              <p className="eyebrow">The MM Rashid collection</p>
              <h2>Our products</h2>
              <p className="royal-section-subtitle">
                Quality regalia, made to order.
              </p>
            </div>
            <Link className="text-link" href="/collections">
              Discover all collections ↗
            </Link>
          </div>
          <div className="atelier-collections">
            {groups.slice(0, 3).map((group, i) => {
              const product = products.find(
                (item) =>
                  item.product_group_id === group.id && item.primary_image,
              );
              return (
                <Link
                  href={"/products?group=" + group.slug}
                  className="atelier-collection"
                  key={group.id}
                >
                  <div className="collection-image">
                    <Image
                      src={
                        product?.primary_image ||
                        "/images/gallery/gold-bullion-naval-badge.webp"
                      }
                      alt={group.name}
                      fill
                      sizes="(max-width:760px) 90vw, 33vw"
                    />
                  </div>
                  <div className="collection-caption">
                    <span className="collection-number">0{i + 1}</span>
                    <h3>{group.name}</h3>
                    <span aria-hidden="true">↗</span>
                  </div>
                </Link>
              );
            })}
          </div>
          {!groups.length && (
            <p>
              Explore our{" "}
              <Link className="text-link" href="/products">
                product catalogue
              </Link>{" "}
              or{" "}
              <Link className="text-link" href="/contact">
                discuss a custom commission
              </Link>
              .
            </p>
          )}
        </section>
        <section className="atelier-manifesto">
          <p className="eyebrow">The MM Rashid signature</p>
          <h2>
            Some things should
            <br />
            always be <em>made by hand.</em>
          </h2>
          <p>
            The weight of bullion. The precision of a stitch. The care in a
            finished edge. These are the details we have built our name on.
          </p>
          <Link className="text-link" href="/capabilities">
            Discover our craft ↗
          </Link>
        </section>
        {products.length > 0 && (
          <section className="atelier-section">
            <div className="atelier-section-heading">
              <div>
                <p className="eyebrow">From the workshop</p>
                <h2>Selected pieces.</h2>
              </div>
              <Link className="text-link" href="/products">
                View the complete collection ↗
              </Link>
            </div>
            <div className="store-product-grid">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
        <section className="atelier-story" id="heritage">
          <div className="atelier-story-image">
            <Image
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="The historic MM Rashid & Company workshop in Sialkot"
              fill
              sizes="(max-width:760px) 100vw, 50vw"
            />
            <span>FROM THE FAMILY ARCHIVE</span>
          </div>
          <div className="atelier-story-copy">
            <p className="eyebrow">Our story · Since 1922</p>
            <h2>
              A family craft.
              <br />
              <em>A lasting legacy.</em>
            </h2>
            <p>
              Our story began in Sialkot in 1922. Through three generations, the
              workshop has remained a place where patient hands turn an idea
              into something of lasting significance.
            </p>
            <p>
              Today we make ceremonial headwear, embroidered insignia and
              regalia for customers with their own traditions to honour.
            </p>
            <Link className="text-link" href="/journal/a-century-of-craft">
              Read our story ↗
            </Link>
          </div>
        </section>
        {slides.length > 0 && (
          <section className="atelier-section atelier-slides">
            <div className="atelier-section-heading">
              <div>
                <p className="eyebrow">A closer look</p>
                <h2>Details that define us.</h2>
              </div>
            </div>
            <HomepageSlider slides={slides} />
          </section>
        )}
        <section className="atelier-section" id="workshop">
          <div className="atelier-section-heading">
            <div>
              <p className="eyebrow">Behind the finished piece</p>
              <h2>In the hands of the maker.</h2>
            </div>
            <p>
              Step inside our workshop.
              <br />
              See the craft, one stitch at a time.
            </p>
          </div>
          <WorkshopReels />
        </section>
        <section className="atelier-commission" id="process">
          <div>
            <p className="eyebrow">Made for you</p>
            <h2>
              Your vision.
              <br />
              <em>Our craftsmanship.</em>
            </h2>
            <p>
              From a single insignia to a complete ceremonial collection, every
              commission begins with a conversation.
            </p>
            <Link className="atelier-button" href="/contact">
              Discuss your project ↗
            </Link>
          </div>
          <ol>
            {[
              [
                "Share your brief",
                "Send your artwork, measurements, quantity and preferred materials.",
              ],
              [
                "Receive your quotation",
                "We prepare a private price for your exact requirements.",
              ],
              [
                "Confirm the details",
                "Approve the specification, delivery schedule and payment arrangements.",
              ],
              [
                "Made with care",
                "Your pieces are crafted, checked and prepared for dispatch.",
              ],
            ].map(([title, description], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="atelier-section atelier-interview">
          <div>
            <p className="eyebrow">A conversation with the owner</p>
            <h2>
              The people
              <br />
              behind the craft.
            </h2>
            <p>
              A personal introduction to the workshop, our history and the work
              we make today.
            </p>
          </div>
          <video
            controls
            playsInline
            preload="none"
            poster="/images/heritage/mm-rashid-history.jpeg"
          >
            <source
              src="https://pub-dfe5ed136766499f955fc1f470752cdd.r2.dev/M-Rashid-Interview.mp4"
              type="video/mp4"
            />
          </video>
        </section>
        <section className="atelier-section atelier-faq">
          <div>
            <p className="eyebrow">Before you commission</p>
            <h2>
              A few things
              <br />
              worth knowing.
            </h2>
            <Link className="text-link" href="/contact">
              Speak to our team ↗
            </Link>
          </div>
          <Faq />
        </section>
        <section className="atelier-closing">
          <p className="eyebrow">Your next piece starts here</p>
          <h2>
            Let’s make something <em>exceptional.</em>
          </h2>
          <Link className="atelier-button" href="/products">
            Find your piece ↗
          </Link>
        </section>
      </main>
      <StoreFooter newsletter={newsletter} />
    </div>
  );
}
