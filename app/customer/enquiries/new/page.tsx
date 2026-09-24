import { EnquiryForm } from "@/app/customer/enquiries/new/enquiry-form";

const checklist = [
  ["01", "Artwork or reference", "Upload artwork, photographs or a reference sample if available."],
  ["02", "Quantity and size", "Include quantity, dimensions and any measurement requirements."],
  ["03", "Colours and finish", "Tell us the colours, materials and finish you need."],
  ["04", "Delivery details", "Add the destination country and required date if there is one."],
];

export default function NewEnquiryPage() {
  return (
    <main className="portal-main commission-enquiry-page">
      <section className="commission-enquiry-intro">
        <div>
          <p className="portal-kicker">Made to order</p>
          <h1>Send your requirements.</h1>
          <p>
            Give us enough detail to understand the piece before we prepare a quotation.
            You can attach artwork, photographs and video references with the form below.
          </p>
        </div>

        <div className="commission-enquiry-note">
          <span>MM RASHID &amp; CO.</span>
          <strong>Commissioner Road · Sialkot</strong>
          <p>Enquiries are saved to your account so you can return to the quotation and order record later.</p>
        </div>
      </section>

      <section className="commission-checklist" aria-label="What to include with your enquiry">
        {checklist.map(([number, title, text]) => (
          <article key={number}>
            <span>{number}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <EnquiryForm />
    </main>
  );
}
