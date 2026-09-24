import Image from "next/image";
import { Brand } from "@/components/brand";
import { RevealController } from "@/components/reveal-controller";
import { SiteHeader } from "@/components/site-header";
import { HomeHeroSlider } from "@/components/home-hero-slider";
import { RegaliaShowcaseSlider } from "@/components/regalia-showcase-slider";
import { catalogue } from "@/lib/catalogue";

const categories = [
  {
    title: "Goldwork & Bullion",
    description: "Raised metallic embroidery, purl, cord and ceremonial handwork.",
    image: "/images/gallery/goldwork-leaf-detail.webp",
  },
  {
    title: "Military & Ceremonial",
    description: "Badges, banners, shoulder pieces and uniform embellishment.",
    image: "/images/gallery/ceremonial-embroidered-banner.webp",
  },
  {
    title: "Regalia & Fez Work",
    description: "Custom fraternal regalia, fez embroidery and ceremonial emblems.",
    image: "/images/gallery/custom-purple-fez-set.webp",
  },
];

const featuredWork = [
  {
    title: "Gold Bullion Naval Badge",
    category: "Goldwork embroidery",
    image: "/images/gallery/gold-bullion-naval-badge.webp",
  },
  {
    title: "Bullion Shoulder Boards",
    category: "Military insignia",
    image: "/images/gallery/gold-bullion-shoulder-boards.webp",
  },
  {
    title: "Silver Bullion Cap Visor",
    category: "Ceremonial headwear",
    image: "/images/gallery/silver-bullion-cap-visor.webp",
  },
  {
    title: "Custom Maroon Fez",
    category: "Fraternal regalia",
    image: "/images/gallery/custom-maroon-fez.webp",
  },
];

const collections = [
  {
    title: "Ceremonial Banners",
    image: "/images/gallery/ceremonial-embroidered-banner.webp",
  },
  {
    title: "Gold Bullion Badges",
    image: "/images/gallery/gold-bullion-naval-badge.webp",
  },
  {
    title: "Shoulder Boards",
    image: "/images/gallery/gold-bullion-shoulder-boards.webp",
  },
  {
    title: "Caps & Visors",
    image: "/images/gallery/silver-bullion-cap-visor.webp",
  },
  {
    title: "Custom Fez Work",
    image: "/images/gallery/custom-purple-fez-set.webp",
  },
  {
    title: "Crests & Emblems",
    image: "/images/gallery/silver-bullion-ceremonial-emblem.webp",
  },
];

const reasons = [
  {
    number: "01",
    title: "Made by hand",
    description: "Experienced artisans build the detail, depth and finish by hand in Sialkot.",
  },
  {
    number: "02",
    title: "Custom to brief",
    description: "Artwork, dimensions, materials and finishing can be developed around your requirement.",
  },
  {
    number: "03",
    title: "Worldwide enquiries",
    description: "We work with international customers, institutions and uniform businesses.",
  },
  {
    number: "04",
    title: "Heritage since 1922",
    description: "A family tradition of specialist embroidery and ceremonial craftsmanship.",
  },
];

const faqs = [
  {
    question: "Can you make a custom design from our artwork?",
    answer:
      "Yes. Send your artwork, measurements, quantity and required finish through the enquiry form. We review the details before confirming production.",
  },
  {
    question: "Do you accept international enquiries?",
    answer:
      "Yes. MM Rashid & Co. accepts enquiries from customers outside Pakistan. Include your delivery country when you send the brief.",
  },
  {
    question: "Can I send reference images or video with an enquiry?",
    answer:
      "Yes. The customer enquiry system supports multiple reference images and video files so the production brief can be reviewed clearly.",
  },
  {
    question: "How do I receive pricing for a custom item?",
    answer:
      "Create an enquiry with the design, quantity and specifications. A quotation can then be prepared for the requested work.",
  },
];

export default function HomePage() {
  return (
    <div className="page-shell commerce-home">
      <RevealController />
      <SiteHeader />

      <main>
        <HomeHeroSlider />
        <RegaliaShowcaseSlider />

        <section className="commerce-section category-section" id="craft">
          <div className="commerce-heading reveal">
            <div>
              <p className="commerce-kicker">Explore our craft</p>
              <h2>Signature categories</h2>
            </div>
            <a className="commerce-view-all" href="#collections">
              View all collections <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="category-grid">
            {categories.map((item, index) => (
              <a
                className={`category-tile reveal delay-${index + 1}`}
                href="#contact"
                key={item.title}
              >
                <div className="category-tile-image">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                </div>
                <div className="category-tile-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>Explore category →</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="commerce-section featured-section" id="gallery">
          <div className="commerce-heading reveal">
            <div>
              <p className="commerce-kicker">Selected work</p>
              <h2>Featured commissions</h2>
            </div>
            <a className="commerce-view-all" href="#collections">
              Browse collection <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="product-grid">
            {featuredWork.map((item, index) => (
              <article
                className={`product-card reveal delay-${(index % 4) + 1}`}
                key={item.title}
              >
                <a className="product-image" href="#contact" aria-label={item.title}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 25vw"
                  />
                  <span className="product-badge">Made to order</span>
                </a>

                <div className="product-copy">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                  <span className="product-price-label">Custom quotation</span>
                  <a className="product-link" href="/sign-up">
                    Request quote
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="collection-promo reveal" aria-label="Custom ceremonial work">
          <div className="collection-promo-image">
            <Image
              src="/images/gallery/ceremonial-gold-cords-and-tassels.png"
              alt="Ceremonial gold cords and tassels made by hand"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>

          <div className="collection-promo-copy">
            <p className="commerce-kicker">Custom ceremonial work</p>
            <h2>Details that carry identity, rank and tradition.</h2>
            <p>
              From institutional insignia to ceremonial accessories, each
              commission can be developed around your artwork, dimensions and
              required finish.
            </p>
            <a className="button button-gold" href="/sign-up">
              Discuss your project <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="commerce-section collection-section" id="collections">
          <div className="commerce-heading reveal">
            <div>
              <p className="commerce-kicker">Our collection</p>
              <h2>Browse by speciality</h2>
            </div>
            <a
              className="commerce-view-all"
              href={catalogue.published ? catalogue.path : "#contact"}
            >
              {catalogue.published ? "Open PDF catalogue" : "Request catalogue"}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="collection-grid">
            {collections.map((item, index) => (
              <a
                className={`collection-card reveal delay-${(index % 3) + 1}`}
                href="#contact"
                key={item.title}
              >
                <div className="collection-card-image">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 980px) 50vw, 33vw"
                  />
                </div>
                <div className="collection-card-title">
                  <h3>{item.title}</h3>
                  <span aria-hidden="true">↗</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="heritage-store" id="heritage">
          <div className="heritage-store-image reveal">
            <Image
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="Historic MM Rashid and Company embroidery workshop in Sialkot"
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          </div>

          <div className="heritage-store-copy reveal delay-one">
            <p className="commerce-kicker">Our heritage</p>
            <h2>A family craft established in 1922.</h2>
            <p>
              MM Rashid &amp; Co. grew from a Sialkot workshop where skilled
              hands transformed metal thread, purl, sequins and fine materials
              into ceremonial work made to carry meaning for generations.
            </p>
            <p>
              Today the same focus on hand craftsmanship continues across
              badges, crests, regalia, headwear and commissioned embroidery.
            </p>
            <a className="commerce-view-all heritage-link" href="#workshop">
              See inside the workshop <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="workshop-store commerce-section" id="workshop">
          <div className="commerce-heading reveal">
            <div>
              <p className="commerce-kicker">Inside our workshop</p>
              <h2>Made by skilled hands.</h2>
            </div>
            <p className="commerce-heading-copy">
              See the process behind the bullion work, raised detail and
              ceremonial finishing.
            </p>
          </div>

          <div className="workshop-store-video reveal delay-one">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/images/workshop/stitching-video-poster.jpg"
            >
              <source
                src="/videos/stitching/stitching-process.mp4"
                type="video/mp4"
              />
              Your browser does not support HTML video.
            </video>
          </div>
        </section>

        <section className="commerce-section reasons-section">
          <div className="commerce-heading reveal">
            <div>
              <p className="commerce-kicker">Why MM Rashid &amp; Co.</p>
              <h2>Built around the brief.</h2>
            </div>
          </div>

          <div className="reason-grid">
            {reasons.map((item, index) => (
              <article
                className={`reason-card reveal delay-${(index % 4) + 1}`}
                key={item.number}
              >
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="commerce-section faq-section">
          <div className="faq-intro reveal">
            <p className="commerce-kicker">FAQ</p>
            <h2>Frequently asked questions</h2>
            <p>
              For specifications, artwork review or a quotation, send a custom
              enquiry and include as much detail as possible.
            </p>
          </div>

          <div className="faq-list reveal delay-one">
            {faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact-store" id="contact">
          <div className="contact-store-copy reveal">
            <p className="commerce-kicker commerce-kicker-light">
              Custom orders &amp; commissions
            </p>
            <h2>Send us your design. We&apos;ll build the detail.</h2>
            <p>
              Include artwork, dimensions, quantity, finish and delivery
              country for a clearer quotation.
            </p>
          </div>

          <div className="contact-store-actions reveal delay-one">
            <a className="button button-gold" href="/sign-up">
              Start an enquiry <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-outline-light" href="tel:+923343342223">
              Call +92 334 334 2223
            </a>
            <small>Commissioner Road · Sialkot 51310 · Pakistan</small>
          </div>
        </section>
      </main>

      <footer className="store-footer">
        <div className="store-footer-brand">
          <Brand footer />
          <p>
            Goldwork, bullion embroidery and ceremonial regalia made by hand
            in Sialkot.
          </p>
        </div>

        <div className="store-footer-column">
          <strong>Explore</strong>
          <a href="#craft">Categories</a>
          <a href="#gallery">Featured work</a>
          <a href="#collections">Collections</a>
          <a href="#heritage">Heritage</a>
        </div>

        <div className="store-footer-column">
          <strong>Customer</strong>
          <a href="/sign-in">Account</a>
          <a href="/sign-up">Start an enquiry</a>
          <a href={catalogue.published ? catalogue.path : "#contact"}>
            Catalogue
          </a>
        </div>

        <div className="store-footer-bottom">
          <span>© {new Date().getFullYear()} MM Rashid &amp; Co.</span>
          <span>Handcrafted in Sialkot, Pakistan</span>
        </div>
      </footer>
    </div>
  );
}
