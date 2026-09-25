"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function sendQuotation(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const enquiryId = String(formData.get("enquiry_id") ?? "");
  const currency = String(formData.get("currency") ?? "USD");
  const unitRate = Number(formData.get("unit_rate") ?? 0);
  const shipping = Number(formData.get("shipping") ?? 0);
  const tax = Number(formData.get("tax") ?? 0);
  const discount = Number(formData.get("discount") ?? 0);
  const validUntil = String(formData.get("valid_until") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const { data: enquiry } = await supabase
    .from("enquiries")
    .select("id, customer_id, quantity, enquiry_number, title")
    .eq("id", enquiryId)
    .single();

  if (!enquiry || unitRate < 0 || !validUntil) {
    redirect("/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=invalid");
  }

  const subtotal = Number((unitRate * enquiry.quantity).toFixed(2));
  const quoteNotes = [
    "Rate per unit: " + currency + " " + unitRate.toFixed(2),
    notes || null,
  ].filter(Boolean).join("\n");

  const { error } = await supabase
    .from("quotations")
    .upsert({
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
    }, { onConflict: "enquiry_id" });

  if (error) {
    redirect("/admin/enquiries/" + encodeURIComponent(enquiryId) + "?quote=error");
  }

  await Promise.all([
    supabase.from("enquiries").update({ status: "quoted" }).eq("id", enquiry.id),
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
