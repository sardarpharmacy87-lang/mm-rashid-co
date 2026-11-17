"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requestItemSchema } from "@/lib/quotation-rules";
const checkoutSchema = z.object({
  token: z.string().uuid(),
  items: z.array(requestItemSchema).min(1).max(30),
  method: z.coerce.number().int().min(1).max(3),
  currency: z.enum(["USD", "GBP", "EUR", "PKR", "AED"]),
  expected_total: z.coerce.number().positive().max(300000000),
  name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(5).max(100),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(5).max(500),
  postal_code: z.string().trim().min(1).max(30),
  notes: z.string().trim().max(2000),
  terms: z.literal("on"),
});
export async function placeOrder(form: FormData) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "Please sign in before checkout.", url: "" };
  let items: unknown;
  try {
    items = JSON.parse(String(form.get("items") || "[]"));
  } catch {
    return { error: "Your cart could not be read.", url: "" };
  }
  const parsed = checkoutSchema.safeParse({
    ...Object.fromEntries(form),
    items,
  });
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message ||
        "Check your delivery and payment details.",
      url: "",
    };
  const d = parsed.data;
  const { data, error } = await db.rpc("place_cart_order", {
    p_token: d.token,
    p_items: d.items,
    p_method: d.method,
    p_currency: d.currency,
    p_expected_total: d.expected_total,
    p_address: {
      name: d.name,
      phone: d.phone,
      country: d.country,
      city: d.city,
      address: d.address,
      postal_code: d.postal_code,
      notes: d.notes,
    },
  });
  if (error)
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "We could not place your order. Your cart is saved; please try again.",
      url: "",
    };
  revalidatePath("/customer");
  revalidatePath("/admin/enquiries");
  return { error: "", url: "/customer/quotations/" + data };
}
