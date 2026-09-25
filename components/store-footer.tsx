import Link from "next/link";
import { Brand } from "@/components/brand";

export function StoreFooter() {
  return (
    <footer className="commerce-footer bloom-footer">
      <div className="bloom-footer-top">
        <div className="bloom-footer-statement">
          <Brand footer />
          <p>
            Ceremonial embroidery, bullion work and regalia handcrafted in Sialkot since 1922.
          </p>
        </div>

        <div className="bloom-footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/products">Products</Link>
            <Link href="/capabilities">Capabilities</Link>
            <Link href="/catalogue">Catalogue</Link>
            <Link href="/#heritage">Our history</Link>
            <Link href="/#workshop">Workshop</Link>
          </div>
          <div>
            <strong>Company</strong>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms &amp; conditions</Link>
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
