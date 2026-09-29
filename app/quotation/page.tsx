import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { CustomQuotationForm } from "@/components/custom-quotation-form";
export const metadata = {
  title: "Request a custom quotation",
  robots: { index: false, follow: false },
};
export default async function QuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; from?: string }>;
}) {
  const query = await searchParams;
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const params = new URLSearchParams();
  if (query.product && /^[0-9a-f-]{36}$/i.test(query.product))
    params.set("product", query.product);
  if (query.from === "cart") params.set("from", "cart");
  if (!user)
    redirect(
      "/sign-in?next=" +
        encodeURIComponent(
          "/quotation" + (params.size ? "?" + params.toString() : ""),
        ) +
        "&message=" +
        encodeURIComponent(
          "Sign in to upload your product and request a private quotation.",
        ),
    );
  const { data: profile } = await db
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();
  const { data: product } = params.has("product")
    ? await db
        .from("products")
        .select("id,name,sizes,colors")
        .eq("id", params.get("product"))
        .eq("active", true)
        .maybeSingle()
    : { data: null };
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main id="main-content" className="editorial-page quotation-page">
        <p className="eyebrow">Made to your specification</p>
        <h1 className="editorial-title">Request a quotation.</h1>
        <p className="editorial-intro">
          Share your design, measurements and reference images. Our workshop
          will prepare a quotation for your exact requirements.
        </p>
        <CustomQuotationForm
          product={product || undefined}
          country={profile?.country || "Pakistan"}
          fromCart={query.from === "cart"}
        />
      </main>
      <StoreFooter />
    </div>
  );
}
