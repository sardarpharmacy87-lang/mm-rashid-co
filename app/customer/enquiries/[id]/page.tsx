import Link from "next/link";
import { notFound } from "next/navigation";
import { acceptQuotation, rejectQuotation } from "@/app/customer/actions";
import { EnquiryAttachments } from "@/components/enquiry-attachments";
import { EnquiryFileUploader } from "@/components/enquiry-file-uploader";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function EnquiryDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const feedback = await searchParams;
  const supabase = await createClient();
  const [{ data: enquiry }, { data: quotation }, { data: files }, { data: items }] = await Promise.all([
    supabase.from("enquiries").select("*").eq("id", id).single(),
    supabase.from("quotations").select("*").eq("enquiry_id", id).maybeSingle(),
    supabase.from("enquiry_files").select("id, file_name, file_type, mime_type, size_bytes").eq("enquiry_id", id).order("created_at"),
  ]);

  if (!enquiry) notFound();

  return (
    <main className="portal-main portal-narrow">
      <Link className="back-link" href="/customer">← Dashboard</Link>
      <div className="portal-title-row">
        <div><p className="portal-kicker">{enquiry.enquiry_number}</p><h1>{enquiry.title}</h1><p>Submitted {formatDate(enquiry.created_at)}</p></div>
        <span className={`status status-${enquiry.status}`}>{statusLabel(enquiry.status)}</span>
      </div>
      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="portal-card detail-grid">
        <div><small>Category</small><strong>{statusLabel(enquiry.category)}</strong></div>
        <div><small>Quantity</small><strong>{enquiry.quantity}</strong></div>
        <div><small>Delivery country</small><strong>{enquiry.delivery_country}</strong></div>
        <div><small>Required by</small><strong>{enquiry.required_by ? formatDate(enquiry.required_by) : "Flexible"}</strong></div>
        <div className="detail-full"><small>Requirements</small><p>{enquiry.description}</p></div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><div><h2>Reference files</h2><p>Images and videos supplied for this enquiry.</p></div></div>
        <EnquiryAttachments files={files ?? []} />
        {enquiry.status === "submitted" || enquiry.status === "under_review" ? (
          <div className="attachment-add"><h3>Add more files</h3><p>You can add up to 10 files in one upload.</p><EnquiryFileUploader enquiryId={enquiry.id} /></div>
        ) : null}
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Quotation</h2></div>
        {quotation ? (
          <div className="quote-card">
            <div className="quote-heading"><div><small>{quotation.quotation_number}</small><h3>{formatMoney(quotation.total, quotation.currency)}</h3></div><span className={`status status-${quotation.status}`}>{statusLabel(quotation.status)}</span></div>
            <dl className="quote-breakdown"><div><dt>Work subtotal</dt><dd>{formatMoney(quotation.subtotal, quotation.currency)}</dd></div><div><dt>Shipping</dt><dd>{formatMoney(quotation.shipping, quotation.currency)}</dd></div><div><dt>Tax</dt><dd>{formatMoney(quotation.tax, quotation.currency)}</dd></div><div><dt>Discount</dt><dd>-{formatMoney(quotation.discount, quotation.currency)}</dd></div><div className="quote-total"><dt>Total</dt><dd>{formatMoney(quotation.total, quotation.currency)}</dd></div></dl>
            {quotation.notes ? <p className="quote-notes">{quotation.notes}</p> : null}
            <p className="quote-valid">Valid until {formatDate(quotation.valid_until)}</p>
            {quotation.status === "sent" ? <div className="form-actions"><form action={acceptQuotation}><input type="hidden" name="quotationId" value={quotation.id} /><button className="portal-button" type="submit">Accept quotation</button></form><form action={rejectQuotation}><input type="hidden" name="quotationId" value={quotation.id} /><button className="portal-button portal-button-secondary" type="submit">Decline</button></form></div> : null}
          </div>
        ) : <div className="portal-empty"><p>Your requirements are being reviewed. The price will appear here and will also be sent to your registered email.</p></div>}
      </section>
    </main>
  );
}
