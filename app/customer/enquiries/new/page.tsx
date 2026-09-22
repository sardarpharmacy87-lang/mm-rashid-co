import { EnquiryForm } from "@/app/customer/enquiries/new/enquiry-form";

export default function NewEnquiryPage() {
  return (
    <main className="portal-main portal-narrow">
      <p className="portal-kicker">Custom commission</p>
      <h1>Submit a new enquiry</h1>
      <p>Describe the required product clearly. Our team will review it and add a quotation to your account.</p>
      <EnquiryForm />
    </main>
  );
}
