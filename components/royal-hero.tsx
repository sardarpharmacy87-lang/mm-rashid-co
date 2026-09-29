import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/components/product-card";
import { ProductReveal } from "@/components/product-reveal";

export function RoyalHero({ product }: { product?: ProductCardData }) {
  return (
    <>
      <section className="studio-hero" aria-labelledby="studio-hero-title">
        <div className="studio-hero-copy">
          <p className="studio-eyebrow">
            MM Rashid &amp; Co. · Sialkot, Pakistan
          </p>
          <h1 id="studio-hero-title">
            A tradition.
            <br />
            Made your own.
          </h1>
          <p className="studio-hero-description">
            Embroidered headwear, ceremonial clothing and insignia from our
            Sialkot workshop. Your design, your colours, your order.
          </p>
          <div className="studio-hero-actions">
            <Link className="studio-button" href="#collections">
              Explore products <span aria-hidden="true">→</span>
            </Link>
            <Link className="studio-text-link" href="/quotation">
              Discuss a custom order
            </Link>
          </div>
          <p className="studio-hero-note">
            Family-run since 1922. Quotations prepared for each order.
          </p>
        </div>
        <div className="studio-hero-feature">
          <p className="studio-feature-label">
            {product ? "From our collection" : "Our signature"}
          </p>
          <ProductReveal>
            {product ? (
              <Link
                className="studio-feature-image"
                href={product ? "/products/" + product.slug : "/capabilities"}
                aria-label={
                  product
                    ? "View " + product.name
                    : "Explore our embroidery work"
                }
              >
                <Image
                  src={
                    product?.primary_image ||
                    "/images/gallery/gold-bullion-naval-badge.webp"
                  }
                  alt={product?.name || "Gold bullion embroidered naval badge"}
                  fill
                  priority
                  sizes="(max-width:760px) 90vw, 48vw"
                />
              </Link>
            ) : null}
          </ProductReveal>
          <div className="studio-feature-caption">
            <span>{product?.name || "MM Rashid & Co."}</span>
            <Link href={product ? "/products/" + product.slug : "/#heritage"}>
              {product ? "View details" : "Our story"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      <div className="studio-service-strip">
        <p>
          <strong>Made to order</strong>
          <span>Your artwork and measurements</span>
        </p>
        <p>
          <strong>Private quotations</strong>
          <span>Pricing for your specification and quantity</span>
        </p>
        <p>
          <strong>International enquiries</strong>
          <span>Shipping agreed with your order</span>
        </p>
      </div>
    </>
  );
}
