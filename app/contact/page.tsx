import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

export const metadata = {
  title: "Contact the workshop",
  description:
    "Discuss a custom commission, trade order or ceremonial piece with MM Rashid & Co. in Sialkot, Pakistan.",
};

export default function ContactPage() {
  return (
    <div className="store-shell atelier">
      <CommerceHeader />
      <main className="editorial-page" id="main-content">
        <p className="eyebrow">MM Rashid &amp; Co.</p>
        <h1 className="editorial-title">Contact the workshop.</h1>
        <p className="editorial-intro">
          Send your design, quantity and delivery country, or ask us about an
          existing order. You can reach our team by phone or email.
        </p>
        <div className="workshop-contact-details">
            <div>
              <p className="eyebrow">Write to us</p>
              <a href="mailto:mmrashidco@hotmail.com">
                mmrashidco@hotmail.com ↗
              </a>
            </div>
            <div>
              <p className="eyebrow">Call the workshop</p>
              <a href="tel:+923343342223">+92 334 334 2223</a>
              <p>
                Monday–Sunday · 24 hours
                <br />
                Pakistan time (UTC+5)
              </p>
            </div>
            <div>
              <p className="eyebrow">Find us in Sialkot</p>
              <p>
                Commissioner Road
                <br />
                Sialkot 51310, Pakistan
              </p>
              <p>Please contact us before visiting.</p>
            </div>
            <div>
              <p className="eyebrow">Preparing your brief</p>
              <p>
                Include your artwork or reference, dimensions, quantity,
                delivery country and preferred date. We will agree the details
                before preparing a quotation.
              </p>
              <Link className="text-link" href="/products">
                Choose pieces for your quotation ↗
              </Link>
            </div>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
