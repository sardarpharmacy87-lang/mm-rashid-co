"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function enquiryCategory(groupSlug?: string | null) {
  const slug = (groupSlug ?? "").toLowerCase();
  if (slug.includes("cap") || slug.includes("visor")) return "cap-visor";
  if (slug.includes("fez")) return "fez";
  if (slug.includes("crest") || slug.includes("badge")) return "crest";
  if (slug.includes("military")) return "military";
  if (slug.includes("regalia")) return "regalia";
  if (slug.includes("gold") || slug.includes("bullion")) return "goldwork";
  return "other";
}

export async function submitProductEnquiry(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?message=Please sign in to request a rate.");
  }

  const productId = String(formData.get("product_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const deliveryCountry = String(formData.get("delivery_country") ?? "").trim();
  const requiredByRaw = String(formData.get("required_by") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const selectedOptions = Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith("option__") && String(value).trim())
    .map(([key, value]) => key.replace("option__", "") + ": " + String(value).trim());

  if (!productId || !slug || !Number.isInteger(quantity) || quantity < 1 || !deliveryCountry) {
    redirect("/products/" + encodeURIComponent(slug) + "?enquiry=invalid");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, name, sku, product_group_id")
    .eq("id", productId)
    .eq("active", true)
    .single();

  if (!product) {
    redirect("/products");
  }

  let groupSlug: string | null = null;
  if (product.product_group_id) {
    const { data: group } = await supabase
      .from("product_groups")
      .select("slug")
      .eq("id", product.product_group_id)
      .maybeSingle();
    groupSlug = group?.slug ?? null;
  }

  const description = [
    product.sku ? "Product SKU: " + product.sku : null,
    ...selectedOptions,
    notes ? "Additional information: " + notes : null,
    "Customer requested a rate for quantity " + quantity + ".",
  ].filter(Boolean).join("\n");

  const { error } = await supabase.from("enquiries").insert({
    customer_id: user.id,
    title: "Rate request — " + product.name,
    category: enquiryCategory(groupSlug),
    description,
    quantity,
    delivery_country: deliveryCountry,
    required_by: requiredByRaw || null,
    status: "submitted",
  });

  if (error) {
    redirect("/products/" + encodeURIComponent(slug) + "?enquiry=error");
  }

  revalidatePath("/customer");
  revalidatePath("/admin/enquiries");
  redirect("/products/" + encodeURIComponent(slug) + "?enquiry=sent");
}
