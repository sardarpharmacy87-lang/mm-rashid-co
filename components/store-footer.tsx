import Link from "next/link";
import { Brand } from "@/components/brand";

export function StoreFooter() {
  return (
    <footer className="commerce-footer">
      <div className="commerce-footer-main commerce-footer-simple">
        <div className="commerce-footer-brand">
          <Brand footer />
          <p>
            Specialist goldwork, bullion embroidery, ceremonial regalia and custom
            insignia handcrafted in Sialkot since 1922.
          </p>
        </div>

        <div>
          <strong>Customer</strong>
          <Link href="/products">Products</Link>
          <Link href="/sign-in">My account</Link>
          <Link href="/cart">Quotation basket</Link>
          <Link href="/customer/enquiries/new">Custom enquiry</Link>
        </div>

        <div>
          <strong>Company</strong>
          <Link href="/#heritage">Our history</Link>
          <Link href="/#workshop">Workshop</Link>
          <Link href="/#process">How we work</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; conditions</Link>
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
