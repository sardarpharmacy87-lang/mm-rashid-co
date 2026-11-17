import { RecoveryPasswordForm } from "@/components/recovery-password-form";

export const metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <span className="auth-brand">MM RASHID &amp; CO.</span>
        <p className="portal-kicker">Secure account</p>
        <h1>Choose a new password</h1>
        <RecoveryPasswordForm initialError={error} />
      </section>
    </main>
  );
}
