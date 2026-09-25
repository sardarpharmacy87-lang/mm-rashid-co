import { CommerceHeaderClient } from "@/components/commerce-header-client";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function CommerceHeader() {
  const user = await getCurrentUser();
  let role: "admin" | "customer" | null = null;

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    role = profile?.role === "admin" ? "admin" : "customer";
  }

  return <CommerceHeaderClient signedIn={Boolean(user)} role={role} />;
}
