"use server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function acceptQuotation(form: FormData) {
  await requireUser();
  const id = String(form.get("id") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || form.get("terms") !== "on")
    redirect("/customer");
  const db = await createClient();
  const { error } = await db.rpc("accept_quotation", { p_quotation_id: id });
  revalidatePath("/customer", "layout");
  revalidatePath("/admin/enquiries", "layout");
  redirect("/customer/quotations/" + id + (error ? "?error=accept" : ""));
}
