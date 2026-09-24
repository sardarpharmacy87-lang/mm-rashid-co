import Link from "next/link";
import { Brand } from "@/components/brand";

export function StoreFooter() {
  return (
    <footer className="commerce-footer">
      <div className="commerce-footer-main">
        <div className="commerce-footer-brand">
          <Brand footer />
          <p>
            Specialist goldwork, bullion embroidery, ceremonial regalia and custom
            insignia handcrafted in Sialkot since 1922.
          </p>
        </div>

        <div>
          <strong>Shop</strong>
          <Link href="/products">All products</Link>
          <Link href="/products?category=aprons-sashes">Aprons &amp; sashes</Link>
          <Link href="/products?category=caps-fez-visors">Caps &amp; fez</Link>
          <Link href="/products?category=badges-emblems">Badges &amp; emblems</Link>
        </div>

        <div>
          <strong>Customer</strong>
          <Link href="/sign-in">My account</Link>
          <Link href="/cart">Quotation basket</Link>
          <Link href="/customer/enquiries/new">Custom enquiry</Link>
        </div>

        <div>
          <strong>Company</strong>
          <Link href="/#heritage">Our history</Link>
          <Link href="/#workshop">Workshop</Link>
          <a href="tel:+923343342223">+92 334 334 2223</a>
          <span>Commissioner Road, Sialkot 51310, Pakistan</span>
        </div>
      </div>
      <div className="commerce-footer-bottom">
        <span>© {new Date().getFullYear()} MM Rashid &amp; Co.</span>
        <span>Handcrafted in Sialkot · Worldwide enquiries</span>
      </div>
    </footer>
  );
}
