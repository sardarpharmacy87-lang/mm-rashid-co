# Storefront review — 28 September 2026

The white product hero reveals the owner's supplied logo, with an optional product selection in admin. It includes a one-way curtain reveal, a single logo rotation that finishes upright, keyboard controls and reduced-motion styles. A new tab starts closed. It does not use a 3D product model or persistent reveal storage.

Verified during this update:

- Next.js production build and TypeScript compilation pass; targeted ESLint passes.
- Desktop, 768px tablet, 390px phone and 320px narrow-phone layouts have no page-level horizontal overflow. Mobile curtain, logo and controls fit the viewport.
- Reveal button and keyboard slider work. Attempting to move backward leaves progress unchanged. Full reveal disables both controls, with no reset action. A second tab starts at zero.
- Logo animation runs once and finishes at an upright identity transform. It waits for the image to load and the curtain to finish opening; reduced-motion CSS disables rotation and curtain transitions.
- Product search for “cap” returns RED Cap with a singular result count. The Caps category opens its filtered catalogue. A cap can be added to the quotation bag; the bag displays its quantity and sign-in requirement without public prices.
- The support contact popup opens and closes with Escape, returning focus to its toggle.
- The admin settings route redirects unauthenticated visitors to sign-in. Featured-product changes require `requireAdmin()` in the server action and the existing admin-only database write policy.
- The new nullable product reference was applied to the connected Supabase project. A transaction selected RED Cap and resolved its product image/name/link data, then rolled back. An unauthorized authenticated-role update changed zero rows. The final saved preference remains the company logo (null product selection).

The signed-in admin form submission was not exercised because no administrator browser session was available. Full payment settlement and translation coverage still depend on provider setup. No real quotation, payment, email or newsletter subscription was submitted during this review.

Existing Supabase advisor findings outside this change remain for a separate security review: [mutable function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [extension in public](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [public security-definer function grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) and [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). This change adds no functions or new public write policies.
