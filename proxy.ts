import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/customer/:path*", "/admin/:path*", "/api/enquiry-files/:path*", "/auth/:path*", "/sign-in", "/sign-up", "/forgot-password", "/update-password"],
};
