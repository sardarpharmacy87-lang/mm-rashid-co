import Image from "next/image";
import { Brand } from "@/components/brand";
import { RevealController } from "@/components/reveal-controller";
import { SiteHeader } from "@/components/site-header";

const craftItems = [
  {
    mark: "G",
    title: "Goldwork & Bullion",
    description:
      "Dimensional motifs shaped in gold and silver wire, purl and decorative cord.",
  },
  {
    mark: "M",
    title: "Military & Ceremonial",
    description:
      "Rank badges, shoulder boards, cap peaks and uniform insignia made to specification.",
  },
  {
    mark: "R",
    title: "Regalia Embroidery",
    description:
      "Masonic and fraternal aprons, banners, fez details, badges and emblems.",
  },
  {
    mark: "C",
    title: "Custom Crests",
    description:
      "Hand-built coats of arms, institutional crests and premium embroidered patches.",
  },
  {
    mark: "V",
    title: "Caps & Visors",
    description:
      "Precision bullion embroidery for peaked caps, visors and ceremonial headwear.",
  },
  {
    mark: "F",
    title: "Custom Fez Work",
    description:
      "Lettering, symbols, beads, sequins and bullion details for distinctive fez designs.",
  },
];

const galleryItems = [
  {
    src: "/images/gallery/ceremonial-embroidered-banner.webp",
    title: "Ceremonial Banner",
    category: "Military & Ceremonial",
    alt: "Handcrafted ceremonial embroidered banner with gold bullion details",
  },
  {
    src: "/images/gallery/gold-bullion-naval-badge.webp",
    title: "Naval Bullion Badge",
    category: "Goldwork Embroidery",
    alt: "Handcrafted gold bullion naval badge",
  },
  {
    src: "/images/gallery/gold-bullion-shoulder-boards.webp",
    title: "Bullion Shoulder Boards",
    category: "Uniform Insignia",
    alt: "Pair of handcrafted gold bullion shoulder boards",
  },
  {
    src: "/images/gallery/silver-bullion-cap-visor.webp",
    title: "Silver Bullion Visor",
    category: "Ceremonial Headwear",
    alt: "Black ceremonial cap with silver bullion visor embroidery",
  },
  {
    src: "/images/gallery/custom-maroon-fez.webp",
    title: "Custom Maroon Fez",
    category: "Fraternal Regalia",
    alt: "Custom maroon ceremonial fez with pearl and gold embroidery",
  },
  {
    src: "/images/gallery/custom-purple-fez-set.webp",
    title: "Custom Purple Fez Set",
    category: "Fraternal Regalia",
    alt: "Set of five custom purple embroidered fez hats",
  },
  {
    src: "/images/gallery/silver-bullion-ceremonial-emblem.webp",
    title: "Silver Ceremonial Emblem",
    category: "Custom Crests",
    alt: "Handcrafted silver bullion ceremonial emblem",
  },
  {
    src: "/images/gallery/medical-corps-embroidered-badge.webp",
    title: "Medical Corps Badge",
    category: "Hand Embroidered Badge",
    alt: "Hand embroidered medical corps badge",
  },
  {
    src: "/images/gallery/goldwork-leaf-detail.webp",
    title: "Goldwork Leaf Detail",
    category: "Craftsmanship Detail",
    alt: "Close-up of handmade gold bullion leaf embroidery",
  },
  {
    src: "/images/gallery/ceremonial-gold-cords-and-tassels.png",
    title: "Ceremonial Cords & Tassels",
    category: "Military Accessories",
    alt: "Handcrafted ceremonial gold cords and uniform tassels",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share the brief",
    description:
      "Send your artwork, measurements, quantity and required finish.",
  },
  {
    number: "02",
    title: "Material and detail review",
    description:
      "We confirm colours, bullion style, construction and production details.",
  },
  {
    number: "03",
    title: "Hand production",
    description:
      "Our artisans build each piece with disciplined and exacting handwork.",
  },
  {
    number: "04",
    title: "Inspection and dispatch",
    description:
      "Finished work is checked carefully before secure packing and dispatch.",
  },
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <RevealController />
      <SiteHeader />

      <main>
        {/* =====================================================
            HERO SECTION
        ===================================================== */}

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid-lines" aria-hidden="true" />

          <div className="hero-copy reveal">
            <p className="eyebrow hero-kicker">
              <span />
              Sialkot · Pakistan · Since generations
            </p>

            <h1 id="hero-title">
              Symbols of
              <br /> distinction,
              <br />
              <strong>made by hand.</strong>
            </h1>

            <p className="hero-intro">
              Goldwork, bullion embroidery and ceremonial regalia for
              institutions, uniform makers and private commissions worldwide.
            </p>

            <div className="hero-actions">
              <a className="button button-gold" href="#gallery">
                View selected work
                <span aria-hidden="true">↗</span>
              </a>

              <a className="text-link" href="/sign-up">
                Discuss a custom order
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <dl
              className="hero-facts"
              aria-label="Company highlights"
            >
              <div>
                <dt>Handmade</dt>
                <dd>Every detail</dd>
              </div>

              <div>
                <dt>Sialkot</dt>
                <dd>Pakistan</dd>
              </div>

              <div>
                <dt>Worldwide</dt>
                <dd>Enquiries</dd>
              </div>
            </dl>
          </div>

          <div className="hero-art reveal delay-one">
            <div className="hero-art-frame">
              <Image
                src="/images/gallery/goldwork-leaf-detail.webp"
                alt="Close-up of hand formed gold bullion embroidery"
                fill
                priority
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
            <div className="hero-art-caption">
              <span>01 / The artisan&apos;s hand</span>
              <strong>Goldwork in close detail</strong>
            </div>
            <div className="hero-seal" aria-label="Made by hand in Sialkot">
              <span>MMR</span>
              <small>Made in Sialkot</small>
            </div>
          </div>

          <a
            className="scroll-cue"
            href="#heritage"
            aria-label="Scroll to our heritage"
          >
            <span>Scroll to discover</span>
            <i aria-hidden="true" />
          </a>
        </section>

        <div className="atelier-ribbon" aria-label="Our specialities">
          <span>Goldwork</span><i />
          <span>Bullion embroidery</span><i />
          <span>Ceremonial regalia</span><i />
          <span>Custom insignia</span><i />
          <span>Handmade in Sialkot</span>
        </div>

        {/* =====================================================
            HERITAGE SECTION
        ===================================================== */}

        <section
          className="heritage section"
          id="heritage"
          aria-labelledby="heritage-title"
        >
          <div className="heritage-heading reveal">
            <p className="eyebrow">
              <span />
              The house of MM Rashid &amp; Co.
            </p>

            <h2 id="heritage-title">
              Where skilled hands
              <br />
              give metal <strong>a soul.</strong>
            </h2>
          </div>

          <div className="heritage-body reveal delay-one">
            <p className="dropcap">
              From Commissioner Road in Sialkot, our artisans transform
              bullion wire, purl, sequins and fine threads into work
              designed to carry meaning for generations.
            </p>

            <p>
              Each commission begins with proportion and symbolism.
              Every raised line, polished edge and stitch is considered
              because ceremonial work is not decoration alone. It
              represents identity, history and honour made visible.
            </p>

            <a className="text-link" href="#process">
              See how we work
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <figure className="heritage-image reveal delay-two">
            <Image
              src="/images/heritage/mm-rashid-history.jpeg"
              alt="Historic MM Rashid and Company embroidery workshop in Sialkot"
              width={1200}
              height={900}
              sizes="(max-width: 900px) 100vw, 50vw"
            />

            <figcaption>
              A tradition of skilled embroidery from Sialkot
            </figcaption>
          </figure>

          <div className="gold-rule" aria-hidden="true" />
        </section>

        {/* =====================================================
            CRAFT SECTION
        ===================================================== */}

        <section
          className="craft section"
          id="craft"
          aria-labelledby="craft-title"
        >
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">
                <span />
                Our specialities
              </p>

              <h2 id="craft-title">
                Made for moments
                <br />
                that <strong>matter.</strong>
              </h2>
            </div>

            <p>
              Bespoke hand embroidery for ceremonial, military,
              fraternal and institutional use.
            </p>
          </div>

          <div className="craft-grid">
            {craftItems.map((item, index) => (
              <article
                className={`craft-card reveal delay-${
                  (index % 3) + 1
                }`}
                tabIndex={0}
                key={item.title}
              >
                <div
                  className="card-medallion"
                  aria-hidden="true"
                >
                  {item.mark}
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span
                  className="card-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            WORKSHOP VIDEO
        ===================================================== */}

        <section
          className="workshop section"
          id="workshop"
          aria-labelledby="workshop-title"
        >
          <div className="workshop-copy reveal">
            <p className="eyebrow">
              <span />
              Inside our workshop
            </p>

            <h2 id="workshop-title">
              Every detail is
              <br />
              <strong>formed by hand.</strong>
            </h2>

            <p>
              Watch our artisans guide bullion wire and fine
              materials into precise ceremonial embroidery.
            </p>
          </div>

          <div className="workshop-video reveal delay-one">
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

            <div className="video-label">
              <span>Workshop film</span>
              <strong>Hand stitching in Sialkot</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCT GALLERY
        ===================================================== */}

        <section
          className="gallery section"
          id="gallery"
          aria-labelledby="gallery-title"
        >
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">
                <span />
                Selected commissions
              </p>

              <h2 id="gallery-title">
                Craftsmanship in
                <br />
                <strong>every detail.</strong>
              </h2>
            </div>

            <p>
              A selection of ceremonial embroidery, bullion badges,
              regalia, headwear and custom commissioned pieces.
            </p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <article
                className={`gallery-card reveal delay-${
                  (index % 3) + 1
                }`}
                key={item.src}
              >
                <div className="gallery-image">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                </div>

                <div className="gallery-card-copy">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            PROCESS SECTION
        ===================================================== */}

        <section
          className="process section"
          id="process"
          aria-labelledby="process-title"
        >
          <div className="process-copy reveal">
            <p className="eyebrow">
              <span />
              Our process
            </p>

            <h2 id="process-title">
              From emblem
              <br />
              to <strong>heirloom.</strong>
            </h2>

            <p>
              A clear and collaborative process keeps every custom
              detail faithful to your brief.
            </p>
          </div>

          <ol className="process-list">
            {processSteps.map((step, index) => (
              <li
                className={`reveal delay-${index + 1}`}
                key={step.number}
              >
                <span className="process-number">
                  {step.number}
                </span>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* =====================================================
            CONTACT SECTION
        ===================================================== */}

        <section
          className="contact section"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div
            className="contact-glow"
            aria-hidden="true"
          />

          <div className="contact-copy reveal">
            <p className="eyebrow light">
              <span />
              Commission enquiries
            </p>

            <h2 id="contact-title">
              Let&apos;s create something
              <br />
              <strong>worthy of the occasion.</strong>
            </h2>
          </div>

          <div className="contact-actions reveal delay-one">
            <p>
              Tell us what you need, the required quantity and your
              delivery country.
            </p>

            <a
              className="button button-gold"
              href="tel:+923343342223"
            >
              Call +92 334 334 2223
              <span aria-hidden="true">↗</span>
            </a>

            <p className="address">
              Commissioner Road · Sialkot 51310 · Pakistan
            </p>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="site-footer">
        <Brand footer />

        <p>
          Goldwork · Bullion Embroidery · Ceremonial Regalia
        </p>

        <p>
          © {new Date().getFullYear()} MM Rashid &amp; Co.
        </p>
      </footer>
    </div>
  );
}
