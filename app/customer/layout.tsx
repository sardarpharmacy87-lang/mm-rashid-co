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

  if (profile?.role === "admin") {
    return (
      <div className="portal-layout">
        <header className="portal-header">
          <Link className="portal-logo" href="/">MM RASHID &amp; CO.</Link>
          <nav aria-label="Customer portal">
            <Link href="/admin">Admin portal</Link>
            <Link href="/">Website</Link>
            <form action={signOut}><button type="submit">Sign out</button></form>
          </nav>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <Link className="portal-logo" href="/">MM RASHID &amp; CO.</Link>
        <nav aria-label="Customer portal">
          <Link href="/customer">My account</Link>
          <Link href="/products">Products</Link>
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/#heritage">Our history</Link>
          <Link href="/#workshop">Workshop</Link>
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
