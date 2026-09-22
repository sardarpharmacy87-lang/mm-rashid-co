import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="portal-layout admin-layout">
      <header className="portal-header">
        <Link className="portal-logo" href="/">MM RASHID &amp; CO.</Link>
        <nav aria-label="Administration">
          <Link href="/admin">Admin dashboard</Link>
          <Link href="/customer">Customer view</Link>
          <Link href="/">Website</Link>
          <form action={signOut}><button type="submit">Sign out</button></form>
        </nav>
      </header>
      {children}
    </div>
  );
}
