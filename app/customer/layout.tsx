import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <Link className="portal-logo" href="/">MM RASHID &amp; CO.</Link>
        <nav aria-label="Customer portal">
          <Link href="/customer">Dashboard</Link>
          <Link href="/customer/enquiries/new">New enquiry</Link>
          {profile?.role === "admin" ? <Link href="/admin">Admin</Link> : null}
          <Link href="/">Website</Link>
          <form action={signOut}><button type="submit">Sign out</button></form>
        </nav>
      </header>
      <div className="portal-userbar">
        <span>{profile?.full_name ?? user.email}</span>
        <small>{profile?.company_name}</small>
      </div>
      {children}
    </div>
  );
}
