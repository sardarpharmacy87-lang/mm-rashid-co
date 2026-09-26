import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendQuotation, confirmPayment } from "../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ quote?: string }>;
};

export default async function AdminEnquiryDetail({
  params,
  searchParams,
}: PageProps) {
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
    supabase
      .from("profiles")
      .select("full_name, company_name, email, phone, country, city")
      .eq("id", enquiry.customer_id)
      .single(),
    supabase
      .from("quotations")
      .select("*")
      .eq("enquiry_id", enquiry.id)
      .maybeSingle(),
  ]);

  const currentUnitRate =
    quotation && enquiry.quantity
      ? Number(quotation.subtotal) / enquiry.quantity
      : 0;
  const { data: paymentMethods, error: paymentSetupError } = await supabase
    .from("payment_methods")
    .select("id,name,kind")
    .eq("enabled", true)
    .order("id");
  const locked =
    quotation?.payment_status === "paid" || quotation?.status === "accepted";

  const expiryDate = new Date();
  expiryDate.setUTCDate(expiryDate.getUTCDate() + 14);
  const defaultValidUntil = expiryDate.toISOString().slice(0, 10);

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">{enquiry.enquiry_number}</p>
          <h1>{enquiry.title.replace("Rate request — ", "")}</h1>
          <p>
            Quantity requested: <strong>{enquiry.quantity}</strong>
          </p>
        </div>
        <Link
          className="portal-button portal-button-secondary"
          href="/admin/enquiries"
        >
          Back to enquiries
        </Link>
      </div>

      {quote === "sent" ? (
        <p className="form-alert form-alert-success">
          Quotation sent to the customer.
        </p>
      ) : null}
      {quote === "error" ? (
        <p className="form-alert form-alert-error">
          Quotation could not be saved.
        </p>
      ) : null}
      {quote === "invalid" && (
        <p className="form-alert form-alert-error">
          Check the amounts and expiry date. The total must be positive.
        </p>
      )}
      {quote === "payment-invalid" && (
        <p className="form-alert form-alert-error">
          Choose an enabled method. Hosted checkout links must match that
          method’s exact gateway domain.
        </p>
      )}
      {quote === "paid" && (
        <p className="form-alert form-alert-success">
          Payment receipt recorded.
        </p>
      )}
      {(quote === "locked" || locked) && (
        <p className="form-alert">
          This accepted or paid quotation is locked to preserve its agreed
          amount.
        </p>
      )}

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Enquiry details</h2>
        </div>
        <div className="detail-grid">
          <div>
            <small>Customer</small>
            <strong>
              {customer?.company_name || customer?.full_name || "Customer"}
            </strong>
          </div>
          <div>
            <small>Email</small>
            <strong>{customer?.email || "—"}</strong>
          </div>
          <div>
            <small>Phone</small>
            <strong>{customer?.phone || "—"}</strong>
          </div>
          <div>
            <small>Delivery country</small>
            <strong>{enquiry.delivery_country}</strong>
          </div>
          <div>
            <small>Quantity</small>
            <strong>{enquiry.quantity}</strong>
          </div>
          <div>
            <small>Required by</small>
            <strong>{enquiry.required_by || "Not specified"}</strong>
          </div>
        </div>
        <p style={{ whiteSpace: "pre-line" }}>{enquiry.description}</p>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>{quotation ? "Update quotation" : "Send quotation"}</h2>
            <p>Set the rate per unit for this requested quantity.</p>
          </div>
        </div>

        <form action={sendQuotation} className="portal-form">
          <input type="hidden" name="enquiry_id" value={enquiry.id} />
          <fieldset
            disabled={locked}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            <div className="form-grid">
              <label>
                Currency
                <select
                  name="currency"
                  defaultValue={quotation?.currency ?? "USD"}
                >
                  <option>USD</option>
                  <option>GBP</option>
                  <option>EUR</option>
                  <option>PKR</option>
                  <option>AED</option>
                </select>
              </label>
              <label>
                Rate per unit
                <input
                  name="unit_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={currentUnitRate || ""}
                  required
                />
              </label>
              <label>
                Shipping
                <input
                  name="shipping"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={quotation?.shipping ?? 0}
                />
              </label>
              <label>
                Tax
                <input
                  name="tax"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={quotation?.tax ?? 0}
                />
              </label>
              <label>
                Discount
                <input
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={quotation?.discount ?? 0}
                />
              </label>
              <label>
                Valid until
                <input
                  name="valid_until"
                  type="date"
                  defaultValue={quotation?.valid_until ?? defaultValidUntil}
                  required
                />
              </label>
              <label className="form-span-two">
                Notes
                <textarea
                  name="notes"
                  rows={5}
                  defaultValue={
                    quotation?.notes?.replace(/^Rate per unit:.*\n?/, "") ?? ""
                  }
                  placeholder="Material, finish, production time, packing or other terms"
                />
              </label>
              {!paymentSetupError && (
                <>
                  <label>
                    Payment method
                    <select
                      name="payment_method_id"
                      defaultValue={quotation?.payment_method_id || ""}
                    >
                      <option value="">Arrange payment separately</option>
                      {(paymentMethods ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Customer-specific hosted payment link
                    <input
                      name="payment_url"
                      type="url"
                      defaultValue={quotation?.payment_url || ""}
                      placeholder="https://your-gateway/this-quotation"
                    />
                  </label>
                  <p className="form-span-two">
                    Create the payment link for this quotation’s exact total and
                    currency in your gateway dashboard. For bank transfers,
                    leave the link empty.
                  </p>
                </>
              )}
            </div>
            <button className="portal-button" type="submit">
              {quotation ? "Update & send rate" : "Send rate to customer"}
            </button>
          </fieldset>
        </form>
      </section>
      {quotation && !paymentSetupError && (
        <section className="portal-section">
          <h2>Payment confirmation</h2>
          {quotation.payment_status === "paid" ? (
            <p>
              Paid · Reference: {quotation.payment_reference} ·{" "}
              {quotation.paid_at}
            </p>
          ) : (
            <form action={confirmPayment} className="portal-form">
              <input type="hidden" name="quotation_id" value={quotation.id} />
              <label>
                Bank or gateway transaction reference
                <input name="reference" required maxLength={200} />
              </label>
              <label>
                <span>
                  <input type="checkbox" name="verified" required /> I have
                  verified receipt of the full quotation total in the receiving
                  account.
                </span>
              </label>
              <button className="portal-button">Record verified payment</button>
              <p>
                A redirect from a payment page is not proof of payment. Verify
                the transaction with your provider before recording receipt.
              </p>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
