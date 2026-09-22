import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <Brand />

      <div className="not-found-content">
        <p className="eyebrow">
          <span />
          Page not found
        </p>

        <h1>404</h1>

        <h2>This page could not be found.</h2>

        <p>
          The page may have been moved, renamed or is no longer available.
        </p>

        <Link className="button button-gold" href="/">
          Return to homepage <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}