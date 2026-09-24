import Link from "next/link";
import { Brand } from "@/components/brand";

export function StoreFooter() {
  return (
    <footer className="commerce-footer bloom-footer">
      <div className="bloom-footer-top">
        <div className="bloom-footer-statement">
          <Brand footer />
          <h2>MM Rashid &amp; Co.</h2>
          <p>
            Ceremonial embroidery, bullion work and regalia made in Sialkot
            since 1922.
          </p>
        </div>

        <div className="bloom-footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/products">Products</Link>
            <Link href="/#heritage">Our history</Link>
            <Link href="/#workshop">Workshop</Link>
            <Link href="/#process">How we work</Link>
          </div>

          <div>
            <strong>Customer</strong>
            <Link href="/sign-in">My account</Link>
            <Link href="/cart">Enquiry list</Link>
            <Link href="/customer/enquiries/new">Send enquiry</Link>
          </div>

          <div>
            <strong>Company</strong>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms &amp; conditions</Link>
            <a href="tel:+923343342223">+92 334 334 2223</a>
            <span>Commissioner Road, Sialkot 51310, Pakistan</span>
          </div>
        </div>
      </div>

      <div className="bloom-footer-bottom">
        <span>© {new Date().getFullYear()} MM Rashid &amp; Co.</span>
        <span>Commissioner Road · Sialkot · Pakistan</span>
      </div>
    </footer>
  );
}
