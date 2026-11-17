"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { isMatchingGateway, safeHttpsUrl } from "@/lib/payment-rules";

export async function sendQuotation(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const enquiryId = String(formData.get("enquiry_id") ?? "");
  const currency = String(formData.get("currency") ?? "USD");
  const subtotal = Number(formData.get("subtotal") ?? 0);
  const shipping = Number(formData.get("shipping") ?? 0);
  const tax = Number(formData.get("tax") ?? 0);
  const discount = Number(formData.get("discount") ?? 0);
  const validUntil = String(formData.get("valid_until") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select(
      "id, customer_id, quantity, enquiry_number, title, uploads_complete",
    )
    .eq("id", enquiryId)
    .single();

  if (
    !enquiry ||
    !enquiry.uploads_complete ||
    !["USD", "GBP", "EUR", "PKR", "AED"].includes(currency) ||
    [subtotal, shipping, tax, discount].some(
      (n) => !Number.isFinite(n) || n < 0 || n > 100000000,
    ) ||
    subtotal === 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(validUntil) ||
    Number.isNaN(Date.parse(validUntil)) ||
    validUntil < new Date().toISOString().slice(0, 10) ||
    notes.length > 5000
  ) {
    redirect(
      "/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=invalid",
    );
  }

  if (subtotal + shipping + tax - discount <= 0)
    redirect(
      "/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=invalid",
    );
  const { data: existing } = await supabase
    .from("quotations")
    .select("*")
    .eq("enquiry_id", enquiry.id)
    .maybeSingle();
  if (existing?.payment_status === "paid" || existing?.status === "accepted")
    redirect(
      "/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=locked",
    );
  const paymentFields: Record<string, unknown> = {};
  if (formData.has("payment_method_id")) {
    const methodId = Number(formData.get("payment_method_id"));
    const url = String(formData.get("payment_url") || "").trim();
    paymentFields.payment_method_id = null;
    paymentFields.payment_url = null;
    if (methodId) {
      const { data: method } = await supabase
        .from("payment_methods")
        .select("id,enabled,kind,gateway_host")
        .eq("id", methodId)
        .eq("enabled", true)
        .maybeSingle();
      if (
        !method ||
        (method.kind === "hosted_gateway" &&
          !isMatchingGateway(url, method.gateway_host)) ||
        (method.kind !== "hosted_gateway" && url)
      )
        redirect(
          "/admin/enquiries/" +
            encodeURIComponent(enquiryId) +
            "?quote=payment-invalid",
        );
      paymentFields.payment_method_id = method.id;
      paymentFields.payment_url =
        method.kind === "hosted_gateway" ? safeHttpsUrl(url) : null;
    } else if (url)
      redirect(
        "/admin/enquiries/" +
          encodeURIComponent(enquiryId) +
          "?quote=payment-invalid",
      );
  }
  const quoteNotes = [
    "Product subtotal: " + currency + " " + subtotal.toFixed(2),
    notes || null,
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("quotations").upsert(
    {
      enquiry_id: enquiry.id,
      customer_id: enquiry.customer_id,
      currency,
      subtotal,
      shipping,
      tax,
      discount,
      notes: quoteNotes,
      valid_until: validUntil,
      status: "sent",
      sent_at: new Date().toISOString(),
      ...paymentFields,
    },
    { onConflict: "enquiry_id" },
  );

  if (error) {
    redirect(
      "/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=error",
    );
  }

  await Promise.all([
    supabase
      .from("enquiries")
      .update({ status: "quoted" })
      .eq("id", enquiry.id)
      .in("status", ["submitted", "under_review", "quoted"]),
    supabase.from("notifications").insert({
      customer_id: enquiry.customer_id,
      kind: "quotation",
      title: "Quotation ready",
      message: "A rate has been sent for " + enquiry.title + ".",
      link: "/customer",
    }),
  ]);

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/enquiries/" + enquiry.id);
  revalidatePath("/customer");
  redirect("/admin/enquiries/" + enquiry.id + "?quote=sent");
}

export async function confirmPayment(form: FormData) {
  await requireAdmin();
  const id = String(form.get("quotation_id") || "");
  const reference = String(form.get("reference") || "").trim();
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    !reference ||
    reference.length > 200 ||
    form.get("verified") !== "on"
  )
    redirect("/admin/enquiries?payment=invalid");
  const db = await createClient();
  const { data: q } = await db
    .from("quotations")
    .select("id,enquiry_id,status,payment_status,total")
    .eq("id", id)
    .single();
  if (!q || !["sent", "accepted"].includes(q.status) || Number(q.total) <= 0)
    redirect("/admin/enquiries?payment=invalid");
  const { error } = await db
    .from("quotations")
    .update({
      payment_status: "paid",
      payment_reference: reference,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("payment_status", "unpaid");
  revalidatePath("/customer");
  revalidatePath("/admin/enquiries/" + q.enquiry_id);
  redirect(
    "/admin/enquiries/" + q.enquiry_id + "?quote=" + (error ? "error" : "paid"),
  );
}

export async function updateOrder(form: FormData) {
  await requireAdmin();
  const db = await createClient();
  const id = String(form.get("enquiry_id") || "");
  const status = String(form.get("status") || "");
  const tracking = String(form.get("tracking_number") || "").trim();
  if (
    ![
      "pending",
      "confirmed",
      "in_production",
      "quality_check",
      "ready",
      "dispatched",
      "delivered",
      "cancelled",
    ].includes(status) ||
    tracking.length > 200
  )
    redirect("/admin/enquiries/" + encodeURIComponent(id) + "?quote=invalid");
  const { error } = await db
    .from("orders")
    .update({ status, tracking_number: tracking || null })
    .eq("enquiry_id", id);
  revalidatePath("/customer", "layout");
  revalidatePath("/admin/enquiries/" + id);
  redirect(
    "/admin/enquiries/" +
      encodeURIComponent(id) +
      "?quote=" +
      (error ? "error" : "updated"),
  );
}

export async function updatePaymentLink(form: FormData) {
  await requireAdmin();
  const db = await createClient();
  const id = String(form.get("quotation_id") || "");
  const url = String(form.get("payment_url") || "").trim();
  const methodId = Number(form.get("payment_method_id"));
  const { data: q } = await db
    .from("quotations")
    .select("id,enquiry_id,status,payment_status")
    .eq("id", id)
    .single();
  if (!q) redirect("/admin/enquiries");
  const path = "/admin/enquiries/" + q.enquiry_id;
  const { data: m } = await db
    .from("payment_methods")
    .select("id,kind,gateway_host")
    .eq("id", methodId)
    .eq("enabled", true)
    .maybeSingle();
  if (
    !m ||
    q.payment_status === "paid" ||
    !["sent", "accepted"].includes(q.status) ||
    (m.kind === "hosted_gateway"
      ? !isMatchingGateway(url, m.gateway_host)
      : Boolean(url))
  )
    redirect(path + "?quote=payment-invalid");
  const { error } = await db
    .from("quotations")
    .update({
      payment_method_id: m.id,
      payment_url: m.kind === "hosted_gateway" ? safeHttpsUrl(url) : null,
    })
    .eq("id", id)
    .eq("payment_status", "unpaid");
  revalidatePath("/customer", "layout");
  revalidatePath(path);
  redirect(path + "?quote=" + (error ? "error" : "updated"));
}
