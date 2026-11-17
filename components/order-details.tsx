import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/shop-rules";
export async function OrderDetails({ enquiryId }: { enquiryId: string }) {
  const db = await createClient();
  const { data: e } = await db
    .from("enquiries")
    .select("requirements")
    .eq("id", enquiryId)
    .single();
  const { data: o } = await db
    .from("orders")
    .select("order_number,status,tracking_number,currency")
    .eq("enquiry_id", enquiryId)
    .maybeSingle();
  const details = e?.requirements || {};
  const items = Array.isArray(details.items) ? details.items : [];
  const delivery = details.delivery;
  return (
    <>
      {o && (
        <section className="portal-section">
          <h2>Order {o.order_number}</h2>
          <p>
            Status: <strong>{o.status.replaceAll("_", " ")}</strong>
          </p>
          {o.tracking_number && <p>Tracking reference: {o.tracking_number}</p>}
        </section>
      )}
      {items.length > 0 && (
        <section className="portal-section">
          <h2>Product selections</h2>
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Quantity</th>
                  {o && <th>Line total</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((i: Record<string, unknown>, index: number) => (
                  <tr key={index}>
                    <td>{String(i.name || "Selected product")}</td>
                    <td>{String(i.size || "To discuss")}</td>
                    <td>{String(i.color || "As shown")}</td>
                    <td>{String(i.quantity || "")}</td>
                    {o && (
                      <td>
                        {formatMoney(Number(i.line_total || 0), o.currency)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {delivery && (
        <section className="portal-section">
          <h2>Delivery details</h2>
          <p>
            {delivery.name} · {delivery.phone}
          </p>
          <p>
            {delivery.address}, {delivery.city}, {delivery.postal_code},{" "}
            {delivery.country}
          </p>
          {delivery.notes && <p>{delivery.notes}</p>}
        </section>
      )}
    </>
  );
}
