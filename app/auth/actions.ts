"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstError, signInSchema, signUpSchema } from "@/lib/validation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function destination(path: string, key: "error" | "message", message: string) {
  return `${path}?${key}=${encodeURIComponent(message)}`;
}

async function siteOrigin() {
  const requestHeaders = await headers();
  return requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: value(formData, "fullName"),
    companyName: value(formData, "companyName"),
    customerType: value(formData, "customerType"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    whatsapp: value(formData, "whatsapp"),
    country: value(formData, "country"),
    city: value(formData, "city"),
    address: value(formData, "address"),
    postalCode: value(formData, "postalCode"),
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
    terms: value(formData, "terms"),
  });

  if (!parsed.success) redirect(destination("/sign-up", "error", firstError(parsed.error)));

  const data = parsed.data;
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/customer`,
      data: {
        full_name: data.fullName,
        company_name: data.companyName,
        customer_type: data.customerType,
        phone: data.phone,
        whatsapp: data.whatsapp,
        country: data.country,
        city: data.city,
        address: data.address,
        postal_code: data.postalCode,
      },
    },
  });

  if (error) redirect(destination("/sign-up", "error", error.message));

  redirect(
    destination(
      "/sign-in",
      "message",
      "Account created. Check your email and click the verification link before signing in.",
    ),
  );
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: value(formData, "email"),
    password: value(formData, "password"),
  });

  if (!parsed.success) redirect(destination("/sign-in", "error", firstError(parsed.error)));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect(destination("/sign-in", "error", "Email or password is incorrect, or the email is not verified."));

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.role === "admin" ? "/admin" : "/customer");
}

export async function requestPasswordReset(formData: FormData) {
  const email = value(formData, "email").trim();
  if (!email) redirect(destination("/forgot-password", "error", "Email address is required"));

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) redirect(destination("/forgot-password", "error", error.message));
  redirect(destination("/forgot-password", "message", "Password reset instructions have been emailed to you."));
}

export async function updatePassword(formData: FormData) {
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirmPassword");

  if (password.length < 8) {
    redirect(destination("/update-password", "error", "Password must contain at least 8 characters"));
  }
  if (password !== confirmPassword) {
    redirect(destination("/update-password", "error", "Passwords do not match"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(destination("/update-password", "error", error.message));

  redirect(destination("/sign-in", "message", "Password updated successfully. You can now sign in."));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
