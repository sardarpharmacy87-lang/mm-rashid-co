import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

export const metadata = {
  title: "Contact information",
  description: "Contact MM Rashid & Co. for ceremonial embroidery, regalia, quotations and workshop enquiries.",
};

export default function ContactPage() {
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="contact-info-page">
        <div className="contact-info-card">
          <p className="store-kicker">MM Rashid &amp; Co.</p>
          <h1>Contact information</h1>
          <h2>Contact Information</h2>
          <p>
            We’re here to help. If you have questions, need assistance with a quotation,
            or want to know more about our products and custom work, feel free to get in touch.
          </p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:mmrashidco@hotmail.com">mmrashidco@hotmail.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+923343342223">+92 334 334 2223</a></li>
            <li><strong>Address:</strong> Commissioner Road, Sialkot 51310, Pakistan</li>
            <li><strong>Business hours:</strong> Monday to Saturday, 9 AM to 6 PM (Pakistan time)</li>
          </ul>
          <p>
            You can also contact us through the social platforms shown in the footer when those accounts are connected.
          </p>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
}
