import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ShopSettings } from "./shop-rules";
export const getShopSettings = cache(async (): Promise<ShopSettings> => {
  const db = await createClient();
  const { data, error } = await db
    .from("shop_settings")
    .select("*")
    .eq("id", "main")
    .single();
  if (error || !data)
    return {
      currency: "USD",
      checkout_enabled: false,
      shipping_fee: 0,
      free_shipping_threshold: null,
      tax_percent: 0,
      minimum_order: 0,
      max_quantity: 1000,
      checkout_note:
        "Checkout is being configured. You can request a quotation.",
    };
  return data;
});
