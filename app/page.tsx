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
import { getStorefrontSettings } from "@/lib/storefront-settings";

type Group = { id: string; name: string; slug: string };
type HomeProduct = ProductCardData & { product_group_id: string | null };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ newsletter?: string }>;
}) {
  const { newsletter } = await searchParams;
  const supabase = await createClient();
  const [g, p, s, preferences] = await Promise.all([
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
    getStorefrontSettings(),
  ]);
  const groups = (g.data ?? []) as Group[];
  const products = (p.data ?? []) as HomeProduct[];
  const slides = (s.data ?? []) as HomepageSlide[];
  const featured = preferences.featuredProductId
    ? await supabase
        .from("products")
        .select("id,name,slug,primary_image,stock_status")
        .eq("id", preferences.featuredProductId)
        .eq("active", true)
        .not("primary_image", "is", null)
        .neq("primary_image", "")
        .maybeSingle()
    : null;
  const categories = groups
    .map((group) => ({
      ...group,
      products: products
        .filter((product) => product.product_group_id === group.id)
        .slice(0, 4),
    }))
    .filter((group) => group.products.length > 0);
  return (
    <div className="store-shell atelier studio-home">
      <CommerceHeader />
      <main id="main-content">
        <RoyalHero product={featured?.data || undefined} />
        <div className="home-categories" id="collections">
          {categories.map((group) => (
            <section
              className="atelier-section home-category-products"
              key={group.id}
              aria-labelledby={"category-" + group.id}
            >
              <div className="home-category-heading">
                <h2 id={"category-" + group.id}>{group.name}</h2>
                <Link
                  className="text-link"
                  href={"/products?group=" + encodeURIComponent(group.slug)}
                  aria-label={"Browse all " + group.name}
                >
                  Browse all <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className="store-product-grid home-category-row">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
          {!categories.length && (
            <p className="atelier-section">
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
        </div>
        <section className="atelier-manifesto">
          <p className="eyebrow">Inside the workshop</p>
          <h2>
            Bullion, thread
            <br />
            and <em>handwork.</em>
          </h2>
          <p>
            We work from artwork, measurements and reference samples. See how
            our team prepares and stitches the details of each piece.
          </p>
          <Link className="text-link" href="/capabilities">
            Discover our craft ↗
          </Link>
        </section>
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
              Our workshop
              <br />
              <em>in Sialkot.</em>
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
                <h2>Regalia and embroidery.</h2>
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
              Start with
              <br />
              <em>your design.</em>
            </h2>
            <p>
              Send a reference, the quantity you need and your delivery date. We
              will discuss the materials and prepare a quotation.
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
          <p className="eyebrow">Have a design in mind?</p>
          <h2>
            Talk to <em>our workshop.</em>
          </h2>
          <Link className="atelier-button" href="/contact">
            Send your requirements ↗
          </Link>
        </section>
      </main>
      <StoreFooter newsletter={newsletter} />
    </div>
  );
}
