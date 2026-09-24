"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { sendCustomerEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

type IncomingItem = {
  productId?: string;
  variantId?: string | null;
  quantity?: number;
};

export async function submitCartEnquiry(formData: FormData) {
  const user = await requireUser();
  const deliveryCountry = String(formData.get("deliveryCountry") ?? "").trim();
  const requiredBy = String(formData.get("requiredBy") ?? "").trim();
  const customerNote = String(formData.get("customerNote") ?? "").trim();

  if (!deliveryCountry) redirect("/cart?error=" + encodeURIComponent("Delivery country is required"));

  let incoming: IncomingItem[] = [];
  try {
    incoming = JSON.parse(String(formData.get("cartJson") ?? "[]"));
  } catch {
    redirect("/cart?error=" + encodeURIComponent("Your quotation basket could not be read"));
  }

  if (!Array.isArray(incoming) || !incoming.length || incoming.length > 50) {
    redirect("/cart?error=" + encodeURIComponent("Add at least one product to the quotation basket"));
  }

  const productIds = Array.from(new Set(incoming.map((item) => item.productId).filter(Boolean))) as string[];
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price_pkr, price_usd, active")
    .in("id", productIds)
    .eq("active", true);

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const variantIds = Array.from(new Set(incoming.map((item) => item.variantId).filter(Boolean))) as string[];
  const { data: variants } = variantIds.length
    ? await supabase.from("product_variants").select("id, product_id, label, price_pkr, price_usd, active").in("id", variantIds).eq("active", true)
    : { data: [] as Array<{ id: string; product_id: string; label: string; price_pkr: number | null; price_usd: number | null; active: boolean }> };

  const variantMap = new Map((variants ?? []).map((variant) => [variant.id, variant]));

  const lines = incoming
    .map((item) => {
      if (!item.productId) return null;
      const product = productMap.get(item.productId);
      if (!product) return null;
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      if (variant && variant.product_id !== product.id) return null;
      return {
        product,
        variant,
        quantity: Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1))),
      };
    })
    .filter(Boolean) as Array<{
      product: { id: string; name: string; price_pkr: number | null; price_usd: number | null };
      variant: { id: string; label: string; price_pkr: number | null; price_usd: number | null } | null | undefined;
      quantity: number;
    }>;

  if (!lines.length) redirect("/cart?error=" + encodeURIComponent("The selected products are no longer available"));

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const description = [
    "Quotation requested from website product basket.",
    ...lines.map((line) => "- " + line.product.name + (line.variant?.label ? " (" + line.variant.label + ")" : "") + " × " + line.quantity),
    customerNote ? "Customer note: " + customerNote : "",
  ].filter(Boolean).join("\n");

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .insert({
      customer_id: user.id,
      title: "Website product quotation",
      category: "other",
      description,
      quantity: totalQuantity,
      delivery_country: deliveryCountry,
      required_by: requiredBy || null,
    })
    .select("id, enquiry_number")
    .single();

  if (error || !enquiry) {
    redirect("/cart?error=" + encodeURIComponent(error?.message ?? "Unable to create quotation request"));
  }

  const itemRows = lines.map((line) => ({
    enquiry_id: enquiry.id,
    product_id: line.product.id,
    variant_id: line.variant?.id ?? null,
    product_name: line.product.name,
    variant_label: line.variant?.label ?? null,
    quantity: line.quantity,
    unit_price_pkr: line.variant?.price_pkr ?? line.product.price_pkr,
    unit_price_usd: line.variant?.price_usd ?? line.product.price_usd,
  }));

  await supabase.from("enquiry_items").insert(itemRows);
  await supabase.from("notifications").insert({
    customer_id: user.id,
    kind: "enquiry",
    title: "Quotation request received",
    message: enquiry.enquiry_number + " has been submitted from your product basket.",
    link: "/customer/enquiries/" + enquiry.id,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, company_name")
    .eq("id", user.id)
    .single();

  if (profile) {
    await sendCustomerEmail({
      to: profile.email,
      name: profile.full_name,
      subject: "Quotation request received — " + enquiry.enquiry_number,
      heading: "We have received your product quotation request",
      message: "Your request " + enquiry.enquiry_number + " contains " + lines.length + " product line(s). We will review the specifications and send pricing through your customer account.",
      actionLabel: "View enquiry",
      actionPath: "/customer/enquiries/" + enquiry.id,
      idempotencyKey: "cart-enquiry-customer-" + enquiry.id,
    });

    if (process.env.ADMIN_EMAIL) {
      await sendCustomerEmail({
        to: process.env.ADMIN_EMAIL,
        name: "MM Rashid Admin",
        subject: "New website quotation request — " + enquiry.enquiry_number,
        heading: "A new product quotation needs review",
        message: (profile.company_name || profile.full_name) + " requested pricing for " + lines.length + " product line(s).",
        actionLabel: "Review enquiry",
        actionPath: "/admin/enquiries/" + enquiry.id,
        idempotencyKey: "cart-enquiry-admin-" + enquiry.id,
      });
    }
  }

  revalidatePath("/customer");
  redirect("/customer/enquiries/" + enquiry.id + "?message=" + encodeURIComponent("Quotation request submitted"));
}
