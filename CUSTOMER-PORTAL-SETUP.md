# MM Rashid & Co. Customer Portal Setup

This project includes:

- Required customer registration details
- Email verification and password recovery
- Protected customer dashboard
- Customer enquiries
- Multiple private reference images and videos with upload progress
- Admin quotations with price breakdown
- Quotation acceptance/rejection
- Automatic order creation
- Order status and tracking updates
- Transactional customer and administrator emails
- Supabase Row Level Security

## 1. Install packages

Run inside the project folder:

```powershell
npm install
```

## 2. Create the Supabase project

1. Open `https://supabase.com/dashboard`.
2. Create a new project named `MM Rashid Co`.
3. Select the available region closest to your customers.
4. Save the database password securely.
5. Open **SQL Editor**.
6. Open `supabase/schema.sql` from this project. If you ran an earlier version, run this complete updated file again; it is written to safely create the new attachment table, storage bucket and policies.
7. Copy the complete SQL file into the editor and click **Run**.

## 3. Configure Supabase authentication

In **Authentication > URL Configuration** set:

- Site URL for local testing: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

After Vercel deployment, also add:

- `https://YOUR-DOMAIN.com/auth/callback`
- `https://YOUR-VERCEL-PROJECT.vercel.app/auth/callback`

Keep email confirmation enabled.

## 4. Add local environment variables

Copy `.env.example` and rename the copy to `.env.local`.

In Supabase open **Project Settings > API** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=YOUR-RESEND-API-KEY
EMAIL_FROM="MM Rashid & Co. <enquiries@YOUR-DOMAIN.com>"
ADMIN_EMAIL=YOUR-ADMIN-EMAIL@example.com
```

Never place a Supabase service-role key in a `NEXT_PUBLIC_` variable.

## 5. Configure reliable email delivery

For production accounts, Supabase requires custom SMTP so it can send verification and password-reset emails to every customer.

1. Create a Resend account at `https://resend.com`.
2. Add and verify a domain you own.
3. Create a Resend API key.
4. Add that API key to `.env.local` as `RESEND_API_KEY`.
5. In Supabase open **Authentication > Email > SMTP Settings**.
6. Enable custom SMTP and enter:

```text
Sender name: MM Rashid & Co.
Sender email: accounts@YOUR-DOMAIN.com
Host: smtp.resend.com
Port: 465
Username: resend
Password: YOUR-RESEND-API-KEY
```

Use your verified domain in both `Sender email` and `EMAIL_FROM`.

## 6. Create the administrator

1. Start the website.
2. Open `http://localhost:3000/sign-up`.
3. Register your own company administrator account.
4. Verify the email.
5. In Supabase **SQL Editor**, run this after replacing the email:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR-ADMIN-EMAIL@example.com';
```

Sign out and sign in again. The **Admin** link will appear in the customer portal.

## 7. Start and test

```powershell
npm run dev
```

Test in this order:

1. Create a second account using a customer email.
2. Verify the customer email.
3. Submit a customer enquiry with several images and at least one MP4 video.
4. Open the enquiry again and confirm that its private files display and a second batch can be added.
5. Sign in as administrator and open `/admin`.
6. Open the enquiry, confirm its attachments display, enter prices and send the quotation.
7. Confirm that the customer receives the quotation email.
8. Sign in as customer and accept the quotation.
9. Sign in as administrator and update the order status.
10. Confirm that the customer receives the order-status email.

## 8. Add variables to Vercel

Before production deployment, add every `.env.local` variable to:

**Vercel Project > Settings > Environment Variables**

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS website address and redeploy.

## Security notes

- Customers can only read their own profiles, enquiries, quotations, orders and notifications.
- Enquiry media is stored in a private `enquiry-files` bucket, not in `public/`.
- Upload paths and database rows are protected by Supabase Row Level Security.
- Images are limited to 15 MB each; videos are limited to 250 MB each; each selection is limited to 10 files.
- Only a profile with `role = 'admin'` can price enquiries or update orders.
- Every Server Action authenticates the caller again before changing data.
- Do not publish `.env.local`, database passwords or API keys.
- Enable CAPTCHA in Supabase before advertising the registration page publicly.
