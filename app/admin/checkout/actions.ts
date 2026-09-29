"use server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { shopCurrencies } from "@/lib/shop-rules";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
const amount = z.coerce
  .number()
  .min(0)
  .max(100000000)
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.000001);
const schema = z.object({
  currency: z.enum(shopCurrencies),
  shipping_fee: amount.max(1000000),
  free_shipping_threshold: amount.positive().nullable(),
  tax_percent: amount.max(100),
  minimum_order: amount,
  max_quantity: z.coerce.number().int().min(1).max(100000),
  checkout_note: z.string().trim().max(2000),
});
export async function saveCheckout(form: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse({
    ...Object.fromEntries(form),
    free_shipping_threshold: form.get("free_shipping_threshold") || null,
  });
  if (!parsed.success) redirect("/admin/checkout?saved=invalid");
  const db = await createClient();
  const enabled = form.get("checkout_enabled") === "on";
  if (enabled) {
    const { count } = await db
      .from("payment_methods")
      .select("id", { count: "exact", head: true })
      .eq("enabled", true);
    if (!count) redirect("/admin/checkout?saved=payment");
  }
  const { error } = await db
    .from("shop_settings")
    .update({ ...parsed.data, checkout_enabled: enabled })
    .eq("id", "main");
  revalidatePath("/", "layout");
  redirect(
    "/admin/checkout?saved=" +
      (error ? (error.code === "P0001" ? "currency" : "error") : "1"),
  );
}
