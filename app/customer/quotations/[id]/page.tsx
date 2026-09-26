import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isMatchingGateway, payableQuote } from "@/lib/payment-rules";
export const metadata = {
  title: "Your private quotation",
  robots: { index: false, follow: false },
};
export default async function Quotation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const db = await createClient();
  const { data: q } = await db
    .from("quotations")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .in("status", ["sent", "accepted", "expired", "rejected"])
    .maybeSingle();
  if (!q) notFound();
  const { data: enquiry } = await db
    .from("enquiries")
    .select("title,quantity,delivery_country")
    .eq("id", q.enquiry_id)
    .eq("customer_id", user.id)
    .single();
  const canPay = payableQuote(q) && q.payment_status !== "paid";
  const { data: method } =
    canPay && q.payment_method_id
      ? await db
          .from("payment_methods")
          .select("*")
          .eq("id", q.payment_method_id)
          .eq("enabled", true)
          .maybeSingle()
      : { data: null };
  const money = (value: unknown) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: q.currency,
    }).format(Number(value));
  return (
    <main className="portal-main notranslate" translate="no">
      <Link className="text-link" href="/customer">
        ← My account
      </Link>
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">
            Private quotation · {q.quotation_number}
          </p>
          <h1>{enquiry?.title.replace("Rate request — ", "")}</h1>
          <p>
            {enquiry?.quantity} pieces · Delivery to {enquiry?.delivery_country}
          </p>
        </div>
      </div>
      <section className="portal-section">
        <h2>Your quotation</h2>
        <dl className="account-detail-grid">
          <div>
            <dt>Subtotal</dt>
            <dd>{money(q.subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{money(q.shipping)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{money(q.tax)}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>{money(q.discount)}</dd>
          </div>
          <div>
            <dt>Total · {q.currency}</dt>
            <dd>
              <strong>{money(q.total)}</strong>
            </dd>
          </div>
          <div>
            <dt>Valid until</dt>
            <dd>{q.valid_until}</dd>
          </div>
        </dl>
        {q.notes && <p style={{ whiteSpace: "pre-line" }}>{q.notes}</p>}
      </section>
      {q.payment_status === "paid" ? (
        <section className="portal-section">
          <h2>Payment received</h2>
          <p>Your payment has been verified by MM Rashid &amp; Co.</p>
          <p>Reference: {q.payment_reference}</p>
        </section>
      ) : !canPay ? (
        <section className="portal-section">
          <h2>This quotation is not available for payment.</h2>
          <p>Contact our team for a current quotation.</p>
          <Link href="/contact" className="portal-button">
            Contact the workshop
          </Link>
        </section>
      ) : (
        <section className="portal-section">
          <h2>Payment arrangements</h2>
          {method ? (
            <div className="payment-method-card">
              <h3>{method.name}</h3>
              {method.kind === "bank_transfer" && (
                <dl className="account-detail-grid">
                  <div>
                    <dt>Bank</dt>
                    <dd>{method.bank_name}</dd>
                  </div>
                  <div>
                    <dt>Account holder</dt>
                    <dd>{method.account_name}</dd>
                  </div>
                  <div>
                    <dt>IBAN / account</dt>
                    <dd style={{ overflowWrap: "anywhere" }}>
                      {method.account_number}
                    </dd>
                  </div>
                  <div>
                    <dt>Payment reference</dt>
                    <dd>{q.quotation_number}</dd>
                  </div>
                </dl>
              )}
              <p>{method.instructions}</p>
              {method.kind === "hosted_gateway" &&
                (q.payment_url &&
                isMatchingGateway(q.payment_url, method.gateway_host) ? (
                  <>
                    <p>
                      Pay {money(q.total)} through {method.gateway_host}. Check
                      that the provider shows this amount and currency before
                      paying.
                    </p>
                    <a
                      className="portal-button"
                      href={q.payment_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open secure payment page ↗
                    </a>
                  </>
                ) : (
                  <p>
                    Your secure payment link is being prepared. Please contact
                    us before paying.
                  </p>
                ))}
            </div>
          ) : (
            <p>
              Our team will provide payment details for this quotation.{" "}
              <Link className="text-link" href="/contact">
                Contact the workshop
              </Link>
              .
            </p>
          )}
          <p>
            Only pay the amount and currency shown in this quotation. Your
            account will show payment received after our team verifies receipt.
          </p>
          <Link className="text-link" href="/terms">
            Review order terms ↗
          </Link>
        </section>
      )}
    </main>
  );
}
