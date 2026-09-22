import { updatePassword } from "@/app/auth/actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <span className="auth-brand">MM RASHID &amp; CO.</span>
        <p className="portal-kicker">Secure account</p>
        <h1>Choose a new password</h1>
        {error ? <p className="form-alert form-alert-error">{error}</p> : null}
        <form action={updatePassword} className="portal-form">
          <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
          <label>Confirm password<input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label>
          <button className="portal-button" type="submit">Update password</button>
        </form>
      </section>
    </main>
  );
}
