import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  footer?: boolean;
};

export function Brand({ footer = false }: BrandProps) {
  return (
    <Link
      href="/"
      className={`brand ${footer ? "brand-footer" : ""}`}
      aria-label="MM Rashid and Company homepage"
    >
      <span className="brand-logo">
        <Image
          src="/mm-rashid-logo.jpg"
          alt="MM Rashid and Company logo"
          width={58}
          height={58}
          priority={!footer}
        />
      </span>

      <span className="brand-copy">
        <strong>MM RASHID &amp; CO.</strong>
        <small>HANDCRAFTED IN SIALKOT</small>
      </span>
    </Link>
  );
}