import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MM Rashid & Co. handles customer account, enquiry and order information.",
};

export default function PrivacyPage() {
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="legal-page">
        <div className="legal-hero">
          <p className="store-kicker">Customer information</p>
          <h1>Privacy Policy</h1>
          <p>
            This policy explains the information used by the MM Rashid &amp; Co.
            website when you create an account, send an enquiry, request a quotation
            or manage an order.
          </p>
        </div>

        <article className="legal-content">
          <section>
            <h2>Information we receive</h2>
            <p>
              We may receive your name, email address, company name, delivery country,
              enquiry details, product selections, quantities, artwork, measurements,
              reference images or videos, quotation decisions and order information.
            </p>
          </section>

          <section>
            <h2>How the information is used</h2>
            <p>
              Information is used to operate your customer account, answer enquiries,
              prepare quotations, produce custom work, provide order updates, support
              customers and protect the website from misuse.
            </p>
          </section>

          <section>
            <h2>Files and account security</h2>
            <p>
              Customer enquiry attachments are stored separately from the public
              website. Account and enquiry access is controlled through authenticated
              customer accounts and database access rules.
            </p>
          </section>

          <section>
            <h2>Service providers</h2>
            <p>
              The website uses infrastructure and services such as Vercel for hosting
              and Supabase for authentication, database and file storage. Transactional
              email services may also be used for account, quotation and order messages.
            </p>
          </section>

          <section>
            <h2>Retention</h2>
            <p>
              Business records may be retained for as long as reasonably required to
              manage customer relationships, quotations, orders, legal obligations and
              legitimate business records. Unneeded information may be deleted when it
              is no longer required.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              You can contact MM Rashid &amp; Co. if you need help with information
              associated with your account or if account details need to be corrected.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              MM Rashid &amp; Co., Commissioner Road, Sialkot 51310, Pakistan.
              Telephone: <a href="tel:+923343342223">+92 334 334 2223</a>.
            </p>
          </section>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
