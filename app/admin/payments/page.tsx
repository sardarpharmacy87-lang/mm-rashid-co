import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { savePaymentMethod } from "./actions";
export default async function Payments({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const db = await createClient();
  const { data: methods, error } = await db
    .from("payment_methods")
    .select("*")
    .order("id");
  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Your payment arrangements</p>
          <h1>Payment methods</h1>
          <p>
            Configure up to three ways to pay. Customers see payment details
            only after you issue their quotation.
          </p>
        </div>
        <Link className="portal-button" href="/admin/settings">
          Social &amp; language settings
        </Link>
      </div>
      {error && (
        <p className="form-alert form-alert-error">
          Payment storage is not installed yet. Apply
          supabase/storefront-upgrade.sql before saving these settings.
        </p>
      )}
      {saved && (
        <p
          role="status"
          className={
            "form-alert " +
            (saved === "1" ? "form-alert-success" : "form-alert-error")
          }
        >
          {saved === "1"
            ? "Payment method saved."
            : saved === "invalid"
              ? "Check the method name, account details and gateway domain before enabling it."
              : "Could not save. Check the database setup and try again."}
        </p>
      )}
      <section className="portal-section">
        <h2>How payments work</h2>
        <p>
          For bank transfers, enter the receiving account details. For a payment
          gateway, enter its exact checkout domain, then attach a
          customer-specific payment link when you send a quotation. Create that
          link in your payment provider with the quotation’s exact total and
          currency.
        </p>
        <p>
          Never enter passwords, secret API keys, PINs or card numbers here.
          These fields are for receiving account details and hosted payment
          links. Payment status is confirmed manually after you verify receipt
          with your provider; automatic gateway verification requires a
          provider-specific integration.
        </p>
      </section>
      {[1, 2, 3].map((id) => {
        const m = methods?.find((m) => m.id === id);
        return (
          <section className="portal-section" key={id}>
            <h2>Payment method {id}</h2>
            <form action={savePaymentMethod} className="portal-form">
              <input type="hidden" name="id" value={id} />
              <div className="form-grid">
                <label>
                  Display name
                  <input
                    name="name"
                    defaultValue={m?.name || ""}
                    placeholder="e.g. Bank transfer or your provider name"
                    maxLength={200}
                  />
                </label>
                <label>
                  Method type
                  <select name="kind" defaultValue={m?.kind || "bank_transfer"}>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="hosted_gateway">
                      Hosted payment gateway
                    </option>
                    <option value="manual">Other payment instructions</option>
                  </select>
                </label>
                <label>
                  Account holder
                  <input
                    name="account_name"
                    defaultValue={m?.account_name || ""}
                    maxLength={200}
                  />
                </label>
                <label>
                  IBAN / receiving account number
                  <input
                    name="account_number"
                    defaultValue={m?.account_number || ""}
                    maxLength={200}
                  />
                </label>
                <label>
                  Bank / institution
                  <input
                    name="bank_name"
                    defaultValue={m?.bank_name || ""}
                    maxLength={200}
                  />
                </label>
                <label>
                  Exact gateway checkout domain
                  <input
                    name="gateway_host"
                    defaultValue={m?.gateway_host || ""}
                    placeholder="checkout.your-provider.com"
                    maxLength={200}
                  />
                </label>
                <label className="form-span-two">
                  Customer instructions
                  <textarea
                    name="instructions"
                    defaultValue={m?.instructions || ""}
                    rows={4}
                    maxLength={3000}
                    placeholder="Receiving instructions, SWIFT code, supported currency or reference requirements"
                  />
                </label>
                <label className="form-span-two">
                  <span>
                    <input
                      type="checkbox"
                      name="enabled"
                      defaultChecked={m?.enabled || false}
                    />{" "}
                    Enable this payment method
                  </span>
                </label>
              </div>
              <button className="portal-button" disabled={Boolean(error)}>
                Save method {id}
              </button>
            </form>
          </section>
        );
      })}
    </main>
  );
}
