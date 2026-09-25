import Link from "next/link";
import { Brand } from "@/components/brand";

export function StoreFooter() {
  return (
    <footer className="commerce-footer bloom-footer clean-store-footer" id="contact">
      <div className="clean-footer-main">
        <div className="clean-footer-brand">
          <Brand footer />
          <p>
            Ceremonial embroidery, bullion work and regalia handcrafted in Sialkot since 1922.
          </p>
        </div>

        <div className="clean-footer-column">
          <strong>Shop</strong>
          <Link href="/products">All products</Link>
          <Link href="/capabilities">Capabilities</Link>
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/#heritage">Our history</Link>
          <Link href="/#workshop">Workshop</Link>
        </div>

        <div className="clean-footer-column">
          <strong>Customer service</strong>
          <Link href="/customer">Customer account</Link>
          <Link href="/sign-up">Request a quote</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; conditions</Link>
        </div>

        <div className="clean-footer-column clean-footer-contact">
          <strong>Contact us</strong>
          <span>Commissioner Road, Sialkot 51310, Pakistan</span>
          <a href="tel:+923343342223">+92 334 334 2223</a>
          <a href="mailto:mmrashidco@hotmail.com">mmrashidco@hotmail.com</a>
          <span>Please contact us before visiting.</span>
        </div>
      </div>

      <div className="clean-footer-bottom">
        <span>© {new Date().getFullYear()} MM Rashid &amp; Co. All rights reserved.</span>
        <span>Handcrafted in Sialkot · Since 1922</span>
      </div>
    </footer>
  );
}
