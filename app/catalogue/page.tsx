import type { Metadata } from "next";
import Link from "next/link";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { catalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Browse the MM Rashid & Co. ceremonial embroidery and insignia catalogue.",
};

export default function CataloguePage() {
  return (
    <div className="store-shell bloom-site">
      <CommerceHeader />
      <main className="catalogue-page">
        <section className="catalogue-hero">
          <div><p className="bloom-eyebrow">MM Rashid &amp; Co.</p><h1>Catalogue</h1></div>
          <div>
            <p>Browse the 17-page archive catalogue of embroidered badges, insignia, ceremonial emblems and specialist handwork.</p>
            <div className="catalogue-actions">
              <a href={catalogue.path} target="_blank" rel="noreferrer">Open full catalogue ↗</a>
              <a href={catalogue.path} download>Download PDF</a>
              <Link href="/">Back to website</Link>
            </div>
          </div>
        </section>
        <div className="catalogue-frame"><iframe src={catalogue.path + "#view=FitH"} title="MM Rashid & Co. catalogue" /></div>
      </main>
      <StoreFooter />
    </div>
  );
}
