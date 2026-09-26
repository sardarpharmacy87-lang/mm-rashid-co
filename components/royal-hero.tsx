import Image from "next/image";
import Link from "next/link";

const qualities = [
  {
    name: "Premium craftsmanship",
    detail: "Care in every stitch",
    icon: "shield",
  },
  {
    name: "Custom designs",
    detail: "Made to your specification",
    icon: "design",
  },
  {
    name: "Worldwide enquiries",
    detail: "From our Sialkot workshop",
    icon: "globe",
  },
  {
    name: "Personal quotations",
    detail: "Prepared just for you",
    icon: "people",
  },
];

function CraftIcon({ type }: { type: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      {type === "shield" && (
        <>
          <path d="M24 5c6 5 11 6 15 7v13c0 9-9 15-15 18C18 40 9 34 9 25V12c4-1 9-2 15-7Z" />
          <path d="m16 24 6 6 12-13" />
        </>
      )}
      {type === "design" && (
        <>
          <path d="m10 36 24-24 4 4-24 24-7 2 3-6ZM29 17l4 4M10 9l29 29-5 5L5 14l5-5Z" />
          <path d="m13 17 3-3m3 9 3-3m3 9 3-3" />
        </>
      )}
      {type === "globe" && (
        <>
          <circle cx="24" cy="24" r="19" />
          <ellipse cx="24" cy="24" rx="9" ry="19" />
          <path d="M5 24h38M9 13h30M9 35h30" />
        </>
      )}
      {type === "people" && (
        <>
          <circle cx="24" cy="16" r="7" />
          <path d="M10 41V35a14 14 0 0 1 28 0v6H10ZM10 12a6 6 0 0 0 0 12M38 12a6 6 0 0 1 0 12M3 37v-5a9 9 0 0 1 6-8M45 37v-5a9 9 0 0 0-6-8" />
        </>
      )}
    </svg>
  );
}

export function RoyalHero() {
  return (
    <>
      <section className="royal-hero" aria-labelledby="royal-hero-title">
        <div className="royal-hero-art">
          <Image
            src="/images/royal/hero-regalia.webp"
            alt="Royal blue and gold embroidered Masonic regalia, a ceremonial apron, collar, cuffs and white gloves on black marble"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="royal-hero-copy">
          <p className="royal-eyebrow">Premium craftsmanship</p>
          <h1 id="royal-hero-title">
            MM RASHID <span>&amp; CO.</span>
          </h1>
          <p className="royal-hero-description">
            Manufacturers &amp; exporters of Masonic regalia.
            <br className="royal-desktop-break" /> Aprons, collars, cuffs,
            sashes, gloves and more.
          </p>
          <div className="royal-ornament" aria-hidden="true">
            <span />
            <b>◇</b>
            <span />
          </div>
          <p className="royal-values">
            Tradition <span>·</span> Craftsmanship <span>·</span> Excellence
          </p>
          <Link className="royal-cta" href="/collections">
            Explore our collection <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <div className="royal-qualities" aria-label="The MM Rashid approach">
        {qualities.map((quality) => (
          <div className="royal-quality" key={quality.name}>
            <span className="royal-quality-icon">
              <CraftIcon type={quality.icon} />
            </span>
            <div>
              <strong>{quality.name}</strong>
              <span>{quality.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
