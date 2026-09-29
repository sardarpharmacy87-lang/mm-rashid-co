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

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const failedUrl = new URL("/sign-in", requestUrl.origin);
  failedUrl.searchParams.set(
    "error",
    "The email link is invalid or has expired. Please try again.",
  );
  return NextResponse.redirect(failedUrl);
}
