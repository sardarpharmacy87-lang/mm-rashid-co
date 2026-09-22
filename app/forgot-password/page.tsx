import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";

type PageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { error, message } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="auth-brand" href="/">MM RASHID &amp; CO.</Link>
        <p className="portal-kicker">Account recovery</p>
        <h1>Reset password</h1>
        <p className="auth-intro">We will send a secure password-reset link to your registered email.</p>
        {error ? <p className="form-alert form-alert-error">{error}</p> : null}
        {message ? <p className="form-alert form-alert-success">{message}</p> : null}
        <form action={requestPasswordReset} className="portal-form">
          <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
          <button className="portal-button" type="submit">Email reset link</button>
        </form>
        <p className="auth-switch"><Link href="/sign-in">Return to sign in</Link></p>
      </section>
    </main>
  );
}
