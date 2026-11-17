import { safeReturnPath } from "@/lib/shop-rules";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/customer";
  const next =
    safeReturnPath(requestedNext) ||
    (requestedNext === "/update-password" ? "/update-password" : "/customer");

  // Implicit recovery tokens are in the URL fragment, visible only to the browser.
  // A redirect without a fragment preserves it for the recovery page.
  if (!code && requestedNext === "/update-password") {
    const recovery = new URL("/update-password", requestUrl.origin);
    if (requestUrl.searchParams.has("error")) recovery.searchParams.set("recovery_error", "1");
    const response = NextResponse.redirect(recovery);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const failedUrl = new URL(requestedNext === "/update-password" ? "/forgot-password" : "/sign-in", requestUrl.origin);
  failedUrl.searchParams.set(
    "error",
    requestedNext === "/update-password"
      ? "This reset link could not be verified. Request a new reset email below."
      : "The email link is invalid or has expired. Please try again.",
  );
  return NextResponse.redirect(failedUrl);
}
