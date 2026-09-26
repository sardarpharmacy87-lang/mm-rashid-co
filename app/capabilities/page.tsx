import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CommerceHeader } from "@/components/commerce-header";
import { RevealController } from "@/components/reveal-controller";
import { StoreFooter } from "@/components/store-footer";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "MM Rashid & Co. capabilities in bullion embroidery, ceremonial work, badges, headwear and made-to-order regalia.",
};

const capabilities = [
  {
    number: "01",
    title: "Goldwork & bullion",
    image: "/images/gallery/goldwork-leaf-detail.webp",
    text: "Metallic thread and bullion work produced from supplied artwork, reference samples and agreed dimensions.",
  },
  {
    number: "02",
    title: "Military & ceremonial",
    image: "/images/gallery/gold-bullion-shoulder-boards.webp",
    text: "Shoulder pieces, ceremonial details and related embroidered work made to the specification provided.",
  },
  {
    number: "03",
    title: "Badges & insignia",
    image: "/images/gallery/medical-corps-embroidered-badge.webp",
    text: "Embroidered badges and insignia developed from artwork, colour references and size requirements.",
  },
  {
    number: "04",
    title: "Caps & visors",
    image: "/images/gallery/silver-bullion-cap-visor.webp",
    text: "Embroidered cap and visor details produced to suit the supplied design and construction requirements.",
  },
  {
    number: "05",
    title: "Fez work",
    image: "/images/gallery/custom-purple-fez-set.webp",
    text: "Fez embroidery and decorative work made to the requested artwork, colours, dimensions and finish.",
  },
  {
    number: "06",
    title: "Cords, tassels & display pieces",
    image: "/images/gallery/ceremonial-gold-cords-and-tassels.png",
    text: "Ceremonial cords, tassels and display pieces prepared to customer reference and quantity requirements.",
  },
];

const requirements = [
  [
    "Artwork",
    "Vector artwork, clear photographs or a physical reference can be used to begin the discussion.",
  ],
  [
    "Dimensions",
    "Provide finished size, measurements and any placement requirements.",
  ],
  [
    "Materials",
    "Specify metallic thread, fabric, colours or finish where these are already known.",
  ],
  [
    "Quantity",
    "Include the quantity and delivery destination so the quotation can be prepared correctly.",
  ],
];

export default function CapabilitiesPage() {
  return (
    <div className="store-shell atelier craft-page">
      <RevealController />
      <CommerceHeader />

      <main className="capabilities-page" id="main-content">
        <section className="capabilities-hero">
          <div className="capabilities-hero-copy reveal">
            <p className="bloom-eyebrow">Capabilities</p>
            <h1>
              Made in Sialkot.
              <span> Built to specification.</span>
            </h1>
            <p>
              MM Rashid &amp; Co. produces ceremonial embroidery, bullion work,
              insignia and regalia from customer artwork, reference samples and
              agreed specifications.
            </p>
            <div className="capabilities-actions">
              <Link className="store-primary-button" href="/contact">
                Send requirements <span>↗</span>
              </Link>
              <Link className="bloom-text-link" href="/catalogue">
                Open catalogue
              </Link>
            </div>
          </div>

          <div
            className="capabilities-hero-media reveal delay-one"
            aria-hidden="true"
          >
            <figure className="capability-hero-main">
              <Image
                src="/images/gallery/gold-bullion-naval-badge.webp"
                alt=""
                width={720}
                height={900}
                priority
              />
            </figure>
            <figure className="capability-hero-small">
              <Image
                src="/images/gallery/ceremonial-embroidered-banner.webp"
                alt=""
                width={400}
                height={500}
              />
            </figure>
            <span className="capability-hero-mark">MMR · SIALKOT · 1922</span>
          </div>
        </section>

        <section className="capabilities-intro reveal">
          <p className="bloom-eyebrow">What we make</p>
          <div>
            <h2>Six areas of work.</h2>
            <p>
              These are the main types of work currently represented in our
              archive and enquiry system. Final construction depends on the
              artwork, dimensions, materials and quantity supplied with the
              enquiry.
            </p>
          </div>
        </section>

        <section className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability-card reveal" key={item.number}>
              <div className="capability-card-media">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={600}
                />
                <span>{item.number}</span>
              </div>
              <div className="capability-card-copy">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="capability-spec reveal">
          <div className="capability-spec-heading">
            <p className="bloom-eyebrow bloom-eyebrow-light">Before we quote</p>
            <h2>What to send with your enquiry.</h2>
          </div>
          <div className="capability-spec-list">
            {requirements.map(([title, text], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities-closing reveal">
          <div>
            <p className="bloom-eyebrow">Made to order</p>
            <h2>Have artwork or a reference sample?</h2>
          </div>
          <div>
            <p>
              Send the quantity, dimensions, delivery country and any files you
              already have. We will discuss the details and prepare your
              personal quotation.
            </p>
            <Link className="store-primary-button" href="/contact">
              Start enquiry <span>↗</span>
            </Link>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
