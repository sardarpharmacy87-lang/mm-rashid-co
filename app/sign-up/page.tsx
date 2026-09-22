import Link from "next/link";
import { signUp } from "@/app/auth/actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel-wide">
        <Link className="auth-brand" href="/">MM RASHID &amp; CO.</Link>
        <p className="portal-kicker">Customer registration</p>
        <h1>Create your account</h1>
        <p className="auth-intro">
          Register once to submit enquiries, receive prices and follow every order.
        </p>

        {error ? <p className="form-alert form-alert-error">{error}</p> : null}

        <form action={signUp} className="portal-form">
          <div className="form-grid">
            <label>
              Full name
              <input name="fullName" autoComplete="name" required />
            </label>
            <label>
              Company or organisation
              <input name="companyName" autoComplete="organization" required />
            </label>
            <label>
              Customer type
              <select name="customerType" defaultValue="company" required>
                <option value="individual">Individual</option>
                <option value="company">Company</option>
                <option value="institution">Institution</option>
                <option value="military">Military / ceremonial organisation</option>
                <option value="fraternal">Fraternal organisation</option>
              </select>
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Phone number
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>
            <label>
              WhatsApp number
              <input name="whatsapp" type="tel" required />
            </label>
            <label>
              Country
              <input name="country" autoComplete="country-name" required />
            </label>
            <label>
              City
              <input name="city" autoComplete="address-level2" required />
            </label>
            <label className="form-span-two">
              Full billing/delivery address
              <textarea name="address" rows={3} autoComplete="street-address" required />
            </label>
            <label>
              Postal or ZIP code
              <input name="postalCode" autoComplete="postal-code" required />
            </label>
            <label>
              Password
              <input name="password" type="password" minLength={8} autoComplete="new-password" required />
            </label>
            <label>
              Confirm password
              <input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required />
            </label>
          </div>

          <label className="checkbox-label">
            <input name="terms" type="checkbox" required />
            <span>I confirm that these details are correct and agree to receive account, quotation and order emails.</span>
          </label>

          <button className="portal-button" type="submit">Create account</button>
        </form>

        <p className="auth-switch">Already registered? <Link href="/sign-in">Sign in</Link></p>
      </section>
    </main>
  );
}
