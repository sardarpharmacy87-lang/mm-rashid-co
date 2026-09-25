import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendQuotation } from "../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quote?: string }>;
};

export default async function AdminEnquiryDetail({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { quote } = await searchParams;
  const supabase = await createClient();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (!enquiry) notFound();

  const [{ data: customer }, { data: quotation }] = await Promise.all([
    supabase.from("profiles").select("full_name, company_name, email, phone, country, city").eq("id", enquiry.customer_id).single(),
    supabase.from("quotations").select("*").eq("enquiry_id", enquiry.id).maybeSingle(),
  ]);

  const currentUnitRate = quotation && enquiry.quantity
    ? Number(quotation.subtotal) / enquiry.quantity
    : 0;

  const defaultValidUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">{enquiry.enquiry_number}</p>
          <h1>{enquiry.title.replace("Rate request — ", "")}</h1>
          <p>Quantity requested: <strong>{enquiry.quantity}</strong></p>
        </div>
        <Link className="portal-button portal-button-secondary" href="/admin/enquiries">Back to enquiries</Link>
      </div>

      {quote === "sent" ? <p className="form-alert form-alert-success">Quotation sent to the customer.</p> : null}
      {quote === "error" ? <p className="form-alert form-alert-error">Quotation could not be saved.</p> : null}

      <section className="portal-section">
        <div className="portal-section-head"><h2>Enquiry details</h2></div>
        <div className="detail-grid">
          <div><small>Customer</small><strong>{customer?.company_name || customer?.full_name || "Customer"}</strong></div>
          <div><small>Email</small><strong>{customer?.email || "—"}</strong></div>
          <div><small>Phone</small><strong>{customer?.phone || "—"}</strong></div>
          <div><small>Delivery country</small><strong>{enquiry.delivery_country}</strong></div>
          <div><small>Quantity</small><strong>{enquiry.quantity}</strong></div>
          <div><small>Required by</small><strong>{enquiry.required_by || "Not specified"}</strong></div>
        </div>
        <p style={{ whiteSpace: "pre-line" }}>{enquiry.description}</p>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div><h2>{quotation ? "Update quotation" : "Send quotation"}</h2><p>Set the rate per unit for this requested quantity.</p></div>
        </div>

        <form action={sendQuotation} className="portal-form">
          <input type="hidden" name="enquiry_id" value={enquiry.id} />
          <div className="form-grid">
            <label>
              Currency
              <select name="currency" defaultValue={quotation?.currency ?? "USD"}>
                <option>USD</option><option>GBP</option><option>EUR</option><option>PKR</option><option>AED</option>
              </select>
            </label>
            <label>
              Rate per unit
              <input name="unit_rate" type="number" min="0" step="0.01" defaultValue={currentUnitRate || ""} required />
            </label>
            <label>
              Shipping
              <input name="shipping" type="number" min="0" step="0.01" defaultValue={quotation?.shipping ?? 0} />
            </label>
            <label>
              Tax
              <input name="tax" type="number" min="0" step="0.01" defaultValue={quotation?.tax ?? 0} />
            </label>
            <label>
              Discount
              <input name="discount" type="number" min="0" step="0.01" defaultValue={quotation?.discount ?? 0} />
            </label>
            <label>
              Valid until
              <input name="valid_until" type="date" defaultValue={quotation?.valid_until ?? defaultValidUntil} required />
            </label>
            <label className="form-span-two">
              Notes
              <textarea name="notes" rows={5} defaultValue={quotation?.notes?.replace(/^Rate per unit:.*\n?/, "") ?? ""} placeholder="Material, finish, production time, packing or other terms" />
            </label>
          </div>
          <button className="portal-button" type="submit">{quotation ? "Update & send rate" : "Send rate to customer"}</button>
        </form>
      </section>
    </main>
  );
}
