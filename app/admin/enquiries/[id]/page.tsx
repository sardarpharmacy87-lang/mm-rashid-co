import Link from "next/link";
import { notFound } from "next/navigation";
import { sendQuotation } from "@/app/admin/actions";
import { EnquiryAttachments } from "@/components/enquiry-attachments";
import { formatDate, formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function AdminEnquiryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const feedback = await searchParams;
  const supabase = await createClient();
  const { data: enquiry } = await supabase.from("enquiries").select("*").eq("id", id).single();
  if (!enquiry) notFound();

  const [{ data: customer }, { data: quotation }, { data: files }, { data: items }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", enquiry.customer_id).single(),
    supabase.from("quotations").select("*").eq("enquiry_id", id).maybeSingle(),
    supabase.from("enquiry_files").select("id, file_name, file_type, mime_type, size_bytes").eq("enquiry_id", id).order("created_at"),
    supabase.from("enquiry_items").select("id, product_name, variant_label, quantity, unit_price_pkr, unit_price_usd").eq("enquiry_id", id).order("created_at"),
  ]);

  return (
    <main className="portal-main portal-narrow">
      <Link className="back-link" href="/admin">← Admin dashboard</Link>
      <div className="portal-title-row"><div><p className="portal-kicker">{enquiry.enquiry_number}</p><h1>{enquiry.title}</h1><p>Submitted {formatDate(enquiry.created_at)}</p></div><span className={"status status-" + enquiry.status}>{statusLabel(enquiry.status)}</span></div>
      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="portal-card detail-grid">
        <div><small>Customer</small><strong>{customer?.full_name}</strong></div><div><small>Company</small><strong>{customer?.company_name}</strong></div><div><small>Email</small><strong>{customer?.email}</strong></div><div><small>WhatsApp</small><strong>{customer?.whatsapp}</strong></div><div><small>Location</small><strong>{customer?.city}, {customer?.country}</strong></div><div><small>Quantity</small><strong>{enquiry.quantity}</strong></div><div className="detail-full"><small>Delivery address</small><p>{customer?.address}, {customer?.postal_code}</p></div><div className="detail-full"><small>Requirements</small><p>{enquiry.description}</p></div>
      </section>

      {items?.length ? (
        <section className="portal-section">
          <div className="portal-section-head"><div><h2>Products in quotation basket</h2><p>These items were selected directly from the website catalogue.</p></div></div>
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead><tr><th>Product</th><th>Option</th><th>Qty</th><th>PKR rate</th><th>USD rate</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.variant_label ?? "—"}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price_pkr ?? "Quote"}</td>
                    <td>{item.unit_price_usd ?? "Quote"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="portal-section">
        <div className="portal-section-head"><div><h2>Customer reference files</h2><p>Private images and videos attached to this enquiry.</p></div></div>
        <EnquiryAttachments files={files ?? []} />
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>{quotation ? "Update quotation" : "Create quotation"}</h2>{quotation ? <span>{quotation.quotation_number} · {formatMoney(quotation.total, quotation.currency)}</span> : null}</div>
        <form action={sendQuotation} className="portal-form portal-card">
          <input name="enquiryId" type="hidden" value={enquiry.id} />
          <div className="form-grid">
            <label>Currency<select name="currency" defaultValue={quotation?.currency ?? "USD"}><option value="USD">USD</option><option value="GBP">GBP</option><option value="EUR">EUR</option><option value="PKR">PKR</option><option value="AED">AED</option></select></label>
            <label>Work subtotal<input name="subtotal" type="number" step="0.01" min="0" defaultValue={quotation?.subtotal ?? "0"} required /></label>
            <label>Shipping<input name="shipping" type="number" step="0.01" min="0" defaultValue={quotation?.shipping ?? "0"} /></label>
            <label>Tax<input name="tax" type="number" step="0.01" min="0" defaultValue={quotation?.tax ?? "0"} /></label>
            <label>Discount<input name="discount" type="number" step="0.01" min="0" defaultValue={quotation?.discount ?? "0"} /></label>
            <label>Valid until<input name="validUntil" type="date" defaultValue={quotation?.valid_until ?? ""} required /></label>
            <label className="form-span-two">Quotation notes<textarea name="notes" rows={5} defaultValue={quotation?.notes ?? ""} placeholder="Materials, production time, payment terms and shipping details" /></label>
          </div>
          <button className="portal-button" type="submit">Save and email quotation</button>
        </form>
      </section>
    </main>
  );
}
