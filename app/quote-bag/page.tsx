import { cookies } from "next/headers";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { QuoteBag } from "@/components/quote-bag";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Your quotation bag" };
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const jar = await cookies();
  const code = jar.get("mmr-country")?.value || "PK";
  let country = "Pakistan";
  try {
    country =
      new Intl.DisplayNames(["en"], { type: "region" }).of(code) || country;
  } catch {}
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="editorial-page" id="main-content">
        <p className="eyebrow">Made to your specification</p>
        <h1 className="editorial-title">Your quotation bag.</h1>
        <p className="editorial-intro">
          A considered collection. A price prepared just for you.
        </p>
        <QuoteBag signedIn={Boolean(user)} country={country} />
      </main>
      <StoreFooter />
    </div>
  );
}
