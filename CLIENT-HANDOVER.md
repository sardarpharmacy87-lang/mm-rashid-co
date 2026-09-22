# MM Rashid & Co. Client Handover

Use this checklist before the website is delivered to the client. The client must own or control every production account.

## Accounts and ownership

- GitHub: transfer the repository to the client's organization or invite the client as an owner.
- Vercel: place the production project in the client's team and confirm that the client is an owner.
- Cloudflare: keep the domain and DNS zone in the client's account; give the developer only the minimum temporary role required.
- Supabase: transfer the project to the client's organization and add at least two trusted client owners.
- Resend/email: verify the client's domain in the client's Resend account and configure billing there.
- Domain registrar: confirm the registrant email, recovery email, billing method and two-factor authentication belong to the client.

## Secrets and billing

- Add production environment variables directly in the client's Vercel project.
- Never place `.env.local`, API keys, database passwords or recovery codes in GitHub or the handover ZIP.
- Replace temporary developer keys before launch.
- Confirm the client's payment method is attached to every paid production service.
- Record plan names, renewal dates, usage limits and support contacts for the client.

## Production checks

- Confirm the custom domain uses HTTPS and redirects consistently to one hostname.
- Test registration, email confirmation, sign-in and password reset.
- Test a customer enquiry with multiple images and videos.
- Confirm another customer cannot open those private attachment URLs.
- Test admin quotation email, customer acceptance and order-status updates.
- Confirm backups, Supabase point-in-time recovery options and account recovery methods.
- Enable two-factor authentication for GitHub, Vercel, Cloudflare, Supabase, Resend and the registrar.

## Deliverables

- Complete source repository and a final source ZIP.
- Database schema in `supabase/schema.sql`.
- Environment-variable names in `.env.example` without secret values.
- Setup instructions in `CUSTOMER-PORTAL-SETUP.md`.
- Logo, product images, videos and proof that the client has permission to use them.
- A short list of all production URLs and account owners.
- Written sign-off confirming access, ownership and recovery details were received.

The deployed website does not need an AI service or AI API to operate. Its runtime stack is Next.js, Supabase, Resend, Vercel and Cloudflare/domain DNS.
