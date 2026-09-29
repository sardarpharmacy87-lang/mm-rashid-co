import { safeReturnPath } from "@/lib/shop-rules";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { error, message, next: requestedNext } = await searchParams;
  const next = safeReturnPath(requestedNext);

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="auth-brand" href="/">
          MM RASHID &amp; CO.
        </Link>
        <p className="portal-kicker">Secure account access</p>
        <h1>Sign in</h1>
        <p className="auth-intro">
          Sign in to your customer account or administration portal.
        </p>

        {error ? <p className="form-alert form-alert-error">{error}</p> : null}
        {message ? (
          <p className="form-alert form-alert-success">{message}</p>
        ) : null}

        <form action={signIn} className="portal-form">
          <input type="hidden" name="next" value={next} />
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="portal-button" type="submit">
            Sign in
          </button>
        </form>

        <div className="auth-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link
            href={
              "/sign-up" + (next ? "?next=" + encodeURIComponent(next) : "")
            }
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}
