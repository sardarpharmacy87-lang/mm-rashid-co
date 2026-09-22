"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendCustomerEmail } from "@/lib/email";
import { formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { firstError, orderStatusSchema, quotationSchema } from "@/lib/validation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function sendQuotation(formData: FormData) {
  await requireAdmin();
  const parsed = quotationSchema.safeParse({
    enquiryId: value(formData, "enquiryId"),
    currency: value(formData, "currency"),
    subtotal: value(formData, "subtotal"),
    shipping: value(formData, "shipping") || "0",
    tax: value(formData, "tax") || "0",
    discount: value(formData, "discount") || "0",
    validUntil: value(formData, "validUntil"),
    notes: value(formData, "notes"),
  });

  const enquiryId = value(formData, "enquiryId");
  if (!parsed.success) {
    redirect(`/admin/enquiries/${enquiryId}?error=${encodeURIComponent(firstError(parsed.error))}`);
  }

  const supabase = await createClient();
  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("id, enquiry_number, title, customer_id")
    .eq("id", parsed.data.enquiryId)
    .single();
  if (!enquiry) redirect("/admin?error=Enquiry not found");

  const { data: quotation, error } = await supabase
    .from("quotations")
    .upsert(
      {
        enquiry_id: enquiry.id,
        customer_id: enquiry.customer_id,
        currency: parsed.data.currency,
        subtotal: parsed.data.subtotal,
        shipping: parsed.data.shipping,
        tax: parsed.data.tax,
        discount: parsed.data.discount,
        valid_until: parsed.data.validUntil,
        notes: parsed.data.notes || null,
        status: "sent",
        sent_at: new Date().toISOString(),
      },
      { onConflict: "enquiry_id" },
    )
    .select("id, quotation_number, total, currency")
    .single();

  if (error || !quotation) {
    redirect(`/admin/enquiries/${enquiry.id}?error=${encodeURIComponent(error?.message ?? "Unable to save quotation")}`);
  }

  await supabase.from("enquiries").update({ status: "quoted" }).eq("id", enquiry.id);
  const { data: notification } = await supabase
    .from("notifications")
    .insert({
      customer_id: enquiry.customer_id,
      kind: "quotation",
      title: "Your quotation is ready",
      message: `${quotation.quotation_number} is ready for your review and decision.`,
      link: `/customer/enquiries/${enquiry.id}`,
    })
    .select("id")
    .single();

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", enquiry.customer_id)
    .single();

  if (customer) {
    const emailResult = await sendCustomerEmail({
      to: customer.email,
      name: customer.full_name,
      subject: `Quotation ready — ${quotation.quotation_number}`,
      heading: "Your quotation is ready",
      message: `We have reviewed ${enquiry.enquiry_number}. Your quoted total is ${formatMoney(quotation.total, quotation.currency)}. Sign in to see the full breakdown and accept or decline the quotation.`,
      actionLabel: "Review quotation",
      actionPath: `/customer/enquiries/${enquiry.id}`,
      idempotencyKey: `quotation-${quotation.id}-${quotation.total}-${parsed.data.validUntil}`,
    });
    if (emailResult.sent && notification) {
      await supabase
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", notification.id);
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/enquiries/${enquiry.id}`);
  revalidatePath("/customer");
  redirect(`/admin/enquiries/${enquiry.id}?message=Quotation saved and emailed to customer`);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse({
    orderId: value(formData, "orderId"),
    status: value(formData, "status"),
    trackingNumber: value(formData, "trackingNumber"),
    note: value(formData, "note"),
  });

  if (!parsed.success) redirect(`/admin?error=${encodeURIComponent(firstError(parsed.error))}`);

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, customer_id")
    .eq("id", parsed.data.orderId)
    .single();
  if (!order) redirect("/admin?error=Order not found");

  const { error } = await supabase
    .from("orders")
    .update({
      status: parsed.data.status,
      tracking_number: parsed.data.trackingNumber || null,
      admin_note: parsed.data.note || null,
    })
    .eq("id", order.id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  const friendlyStatus = statusLabel(parsed.data.status);
  const { data: notification } = await supabase
    .from("notifications")
    .insert({
      customer_id: order.customer_id,
      kind: "order",
      title: `Order ${friendlyStatus}`,
      message: `${order.order_number} is now ${friendlyStatus.toLowerCase()}.${parsed.data.trackingNumber ? ` Tracking: ${parsed.data.trackingNumber}.` : ""}`,
      link: "/customer",
    })
    .select("id")
    .single();

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", order.customer_id)
    .single();

  if (customer) {
    const emailResult = await sendCustomerEmail({
      to: customer.email,
      name: customer.full_name,
      subject: `Order update — ${order.order_number}`,
      heading: `Your order is ${friendlyStatus.toLowerCase()}`,
      message: `${order.order_number} has been updated to ${friendlyStatus}.${parsed.data.trackingNumber ? ` Your tracking reference is ${parsed.data.trackingNumber}.` : ""}${parsed.data.note ? ` ${parsed.data.note}` : ""}`,
      actionLabel: "View order dashboard",
      actionPath: "/customer",
      idempotencyKey: `order-status-${order.id}-${parsed.data.status}`,
    });
    if (emailResult.sent && notification) {
      await supabase
        .from("notifications")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", notification.id);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/customer");
  redirect("/admin?message=Order status updated and customer notified");
}
