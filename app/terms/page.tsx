import type { Metadata } from "next";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Website, enquiry and custom-order terms for MM Rashid & Co.",
};

export default function TermsPage() {
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="legal-page">
        <div className="legal-hero">
          <p className="store-kicker">Website and custom orders</p>
          <h1>Terms &amp; Conditions</h1>
          <p>
            These terms describe the general use of the MM Rashid &amp; Co. website
            and the enquiry, quotation and custom-order process.
          </p>
        </div>

        <article className="legal-content">
          <section>
            <h2>Website use</h2>
            <p>
              You may use this website to review our work, create an account, submit
              enquiries and request quotations. You must not misuse the website,
              attempt unauthorized access or interfere with its operation.
            </p>
          </section>

          <section>
            <h2>Quotations</h2>
            <p>
              Public product pages do not constitute a fixed-price offer. Commercial
              terms for custom work are provided through a quotation after we review
              specifications, quantities, artwork, materials and delivery requirements.
            </p>
          </section>

          <section>
            <h2>Custom specifications</h2>
            <p>
              Customers are responsible for checking the details supplied for a custom
              order, including artwork, spelling, dimensions, colours, quantities and
              delivery information. Production is based on the approved information.
            </p>
          </section>

          <section>
            <h2>Customer-supplied artwork</h2>
            <p>
              By sending artwork, logos, insignia or other material, you confirm that
              you are authorized to ask us to reproduce it for the requested work.
            </p>
          </section>

          <section>
            <h2>Production and delivery</h2>
            <p>
              Production and delivery timing can vary according to the complexity,
              quantity, materials, approval process and destination. Any specific timing
              agreed for an order should be confirmed in the quotation or order record.
            </p>
          </section>

          <section>
            <h2>Accounts</h2>
            <p>
              You are responsible for keeping your account credentials secure and for
              information submitted through your account. Contact us promptly if you
              believe an account has been accessed without authorization.
            </p>
          </section>

          <section>
            <h2>Website content</h2>
            <p>
              Unless otherwise stated, website branding, text, layout and original
              company materials belong to MM Rashid &amp; Co. Customer-owned artwork
              remains subject to the rights of its respective owner.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about a quotation, order or these website terms can be sent
              through the customer portal or discussed by telephone at
              <a href="tel:+923343342223"> +92 334 334 2223</a>.
            </p>
          </section>
        </article>
      </main>
      <StoreFooter />
    </div>
  );
}
