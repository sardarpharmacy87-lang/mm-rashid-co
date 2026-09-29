import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EnquiryAttachments } from "@/components/enquiry-attachments";
import { OrderDetails } from "@/components/order-details";
export default async function Enquiry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const db = await createClient();
  const { data: e } = await db
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (!e) notFound();
  const { data: q } = await db
    .from("quotations")
    .select("id")
    .eq("enquiry_id", id)
    .neq("status", "draft")
    .maybeSingle();
  return (
    <main className="portal-main">
      <Link className="text-link" href="/customer">
        ← My account
      </Link>
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Request {e.enquiry_number}</p>
          <h1>{e.title}</h1>
          <p>
            {e.quantity} pieces · {e.delivery_country} ·{" "}
            {e.status.replaceAll("_", " ")}
          </p>
        </div>
        {q && (
          <Link className="portal-button" href={"/customer/quotations/" + q.id}>
            Quotation &amp; payment
          </Link>
        )}
      </div>
      {!e.uploads_complete && (
        <p className="form-alert">
          This request has unfinished uploads. Return to the open quotation form
          and retry, or contact the workshop with reference {e.enquiry_number}.
        </p>
      )}
      <section className="portal-section">
        <h2>Your requirements</h2>
        <p style={{ whiteSpace: "pre-line" }}>{e.description}</p>
        <p>Required by: {e.required_by || "To discuss"}</p>
      </section>
      <OrderDetails enquiryId={id} />
      <EnquiryAttachments id={id} customerId={user.id} />
    </main>
  );
}
