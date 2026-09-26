# Storefront upgrade

## What is included

An original navy, ivory and brass design using the existing MM Rashid logo, product photographs, archive and workshop videos. The storefront includes collections, search and filters, product options and image enlargement, a persistent quotation bag, journal, care guides, FAQ, newsletter feedback, account links and contact information. No product prices are public.

Country selection covers 249 countries and territories. Initial country comes from the saved preference or Vercel country header. A manually chosen language is independent of country. Until a translation provider is connected, the storefront is English. This release does not claim to contain completed translations for every world language.

## Admin setup

- `/admin/settings`: save the six supported social profile links. Blank platforms remain hidden. Configure the public Weglot website key and the same enabled language codes as the Weglot project. Translation subscription, supported languages and limits are managed with that provider. Private account, quotation and authentication routes are excluded from translation.
- `/admin/payments`: fill any of the three slots and enable it when ready. Choose bank transfer, a hosted gateway or other payment instructions. These fields must never contain secret API keys, passwords or card credentials.
- `/admin/enquiries`: set a customer-specific unit rate, shipping, tax, discount, currency and expiry. Assign an enabled payment method. For hosted payment, create the exact amount/currency link in the provider's dashboard and attach it to that quotation. Its host must exactly match the configured provider domain.
- The customer opens the private quotation from their account. Bank instructions or the hosted payment link appear only for a payable quotation. A payment return URL does not mark a quotation paid. The administrator records receipt after checking the receiving account. Automated settlement/webhooks require a later integration with the named provider.

The additive SQL in `supabase/storefront-upgrade.sql` was applied to the connected `MM Rashid co` project on 2026-09-26. It creates three disabled payment slots and an empty translation configuration. Row-level security protects payment settings and quotations; draft quotations are admin-only. It does not change existing products or quoted amounts.

## Verification

- Next.js production build, including TypeScript, passes. On Windows environments that restrict child processes, set `MMR_LOCAL_BUILD=1` for the build. This enables the TypeScript API and worker threads only for that build; hosted builds keep Next.js defaults.
- ESLint: no errors; two existing image optimization warnings in admin thumbnail lists.
- `node --experimental-strip-types --test --test-isolation=none tests/payment-rules.test.mjs`: three payment destination and quotation eligibility tests pass.
- Verified the database has three disabled payment slots, row-level security on both new tables and quotations, and no anonymous access to payment methods.
- Full real payment and translated-page tests require the owner's provider accounts. No payment was taken and no provider subscription was created.

## Existing database advisories

Supabase reports existing advisories unrelated to the new tables: a mutable search path on `set_updated_at`, `pg_trgm` in the public schema, externally executable security-definer functions, and disabled leaked-password protection. Review these in the Supabase security advisor; the upgrade does not silently alter existing authentication or RPC behavior.

- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public
- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
