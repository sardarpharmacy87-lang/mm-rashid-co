import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Sign in required", { status: 401 });

  const { data: file } = await supabase
    .from("enquiry_files")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (!file) return new NextResponse("File not found", { status: 404 });

  const { data, error } = await supabase.storage
    .from("enquiry-files")
    .createSignedUrl(file.storage_path, 60);
  if (error || !data) return new NextResponse("File unavailable", { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
