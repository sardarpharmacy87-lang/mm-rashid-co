"use server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { paymentKinds } from "@/lib/payment-rules";
export async function savePaymentMethod(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  const kind = String(form.get("kind"));
  const name = String(form.get("name") || "").trim();
  const enabled = form.get("enabled") === "on";
  const account_name = String(form.get("account_name") || "").trim();
  const account_number = String(form.get("account_number") || "").trim();
  const bank_name = String(form.get("bank_name") || "").trim();
  const gateway_host = String(form.get("gateway_host") || "")
    .trim()
    .toLowerCase();
  const instructions = String(form.get("instructions") || "").trim();
  if (
    ![1, 2, 3].includes(id) ||
    !paymentKinds.includes(kind as (typeof paymentKinds)[number]) ||
    [name, account_name, account_number, bank_name, gateway_host].some(
      (v) => v.length > 200,
    ) ||
    instructions.length > 3000 ||
    (gateway_host &&
      !/^(?![\d.]+$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(gateway_host)) ||
    (enabled &&
      (!name ||
        (kind === "bank_transfer" &&
          (!account_name || !account_number || !bank_name)) ||
        (kind === "hosted_gateway" && !gateway_host) ||
        (kind === "manual" && !instructions)))
  )
    redirect("/admin/payments?saved=invalid");
  const db = await createClient();
  const { error } = await db
    .from("payment_methods")
    .upsert({
      id,
      name,
      kind,
      enabled,
      account_name,
      account_number,
      bank_name,
      gateway_host,
      instructions,
      updated_at: new Date().toISOString(),
    });
  revalidatePath("/admin/payments");
  revalidatePath("/customer");
  redirect("/admin/payments?saved=" + (error ? "error" : "1"));
}
