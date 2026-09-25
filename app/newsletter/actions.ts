"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function subscribeNewsletter(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/?newsletter=invalid#newsletter");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error && error.code !== "23505") {
    redirect("/?newsletter=error#newsletter");
  }

  redirect("/?newsletter=ok#newsletter");
}
