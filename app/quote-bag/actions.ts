"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const itemsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      quantity: z.number().int().min(1).max(100000),
    }),
  )
  .min(1)
  .max(30);
export async function submitQuoteBag(
  _previous: { message: string; success: boolean },
  form: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      success: false,
      message: "Please sign in before sending your request.",
    };
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("items") || "[]"));
  } catch {
    return {
      success: false,
      message: "Your bag could not be read. Please reload and try again.",
    };
  }
  const parsed = itemsSchema.safeParse(raw);
  const country = String(form.get("country") || "").trim();
  const notes = String(form.get("notes") || "").trim();
  const date = String(form.get("required_by") || "");
  if (
    !parsed.success ||
    !country ||
    country.length > 100 ||
    !notes ||
    notes.length > 4000 ||
    (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))))
  )
    return {
      success: false,
      message:
        "Check your quantity, delivery country, date and specifications.",
    };
  const items = parsed.data;
  if (new Set(items.map((i) => i.id)).size !== items.length)
    return {
      success: false,
      message: "Please remove duplicate products from your bag.",
    };
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,stock_status")
    .eq("active", true)
    .in(
      "id",
      items.map((i) => i.id),
    );
  if (error || products?.length !== items.length)
    return {
      success: false,
      message:
        "A saved product is no longer available. Remove it or contact our team.",
    };
  if (products.some((p) => p.stock_status === "out_of_stock"))
    return {
      success: false,
      message:
        "A piece in your bag is unavailable. Please contact us to discuss alternatives.",
    };
  const { error: insertError } = await supabase
    .from("enquiries")
    .insert(
      items.map((item) => ({
        customer_id: user.id,
        title: "Rate request — " + products.find((p) => p.id === item.id)!.name,
        category: "other",
        quantity: item.quantity,
        delivery_country: country,
        required_by: date || null,
        description: "Product ID: " + item.id + "\n" + notes,
        status: "submitted",
      })),
    );
  if (insertError)
    return {
      success: false,
      message: "We could not save your request. Please try again.",
    };
  revalidatePath("/customer");
  revalidatePath("/admin/enquiries");
  return { success: true, message: "Request sent." };
}
