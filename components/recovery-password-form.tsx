"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/config";
import { updatePassword } from "@/app/auth/actions";
import { useFormStatus } from "react-dom";

function SavePasswordButton() {
  const { pending } = useFormStatus();
  return <button className="portal-button" type="submit" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>;
}

export function RecoveryPasswordForm({ initialError }: { initialError?: string }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const initialization = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let active = true;
    if (!initialization.current) {
      initialization.current = (async () => {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const query = new URLSearchParams(window.location.search);
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const recoveryError = hash.has("error") || query.has("recovery_error");
        // Remove credentials immediately; never send or log the fragment.
        if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
        if (recoveryError) throw new Error("This reset link has expired or was already used. Request a new email.");
        const client = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          isSingleton: false,
          auth: { detectSessionInUrl: false },
        });
        if (accessToken || refreshToken) {
          if (!accessToken || !refreshToken || hash.get("type") !== "recovery")
            throw new Error("This is not a valid password-reset link. Request a new email.");
          const { error: sessionError } = await client.auth.setSession({
            access_token: accessToken, refresh_token: refreshToken,
          });
          if (sessionError) throw new Error("Unable to verify this reset link. Request a new email.");
        }
        const { data, error: userError } = await client.auth.getUser();
        if (userError || !data.user) throw new Error("Open the newest password-reset link from your email to continue.");
      })();
    }
    initialization.current.then(() => { if (active) setReady(true); }).catch(failure => {
      if (active) setError(failure instanceof Error ? failure.message : "Unable to verify the reset link.");
    });
    return () => { active = false; };
  }, []);

  if (error) return <div><p role="alert" className="form-alert form-alert-error">{error}</p><Link href="/forgot-password">Request a new reset email</Link></div>;
  if (!ready) return <p role="status">Verifying your reset link…</p>;
  return (
    <>
      {initialError && <p role="alert" className="form-alert form-alert-error">{initialError}</p>}
      <form action={updatePassword} className="portal-form">
        <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
        <label>Confirm password<input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label>
        <SavePasswordButton />
      </form>
    </>
  );
}
