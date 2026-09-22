# MM Rashid & Co. — Start Here

This final project uses the homepage, history image, workshop video and product gallery from the tested project supplied on 14 September 2026. It also contains the customer account, enquiry, quotation, order, email and private attachment system.

## 1. Extract and open the correct folder

1. Right-click the ZIP and select **Extract All**.
2. Move the extracted project to a simple location such as `C:\Projects\MM-Rashid-Co`.
3. Open Visual Studio Code.
4. Select **File > Open Folder**.
5. Open the folder that directly contains `package.json`, `app`, `components`, `public` and `supabase`.

In **Terminal > New Terminal**, confirm the project is correct:

```powershell
Get-ChildItem package.json
```

Install the packages:

```powershell
npm install
```

## 2. Create and configure Supabase

1. Sign in at `https://supabase.com/dashboard`.
2. Create a project named `MM Rashid Co`. Free is suitable for development; use Pro before production launch.
3. Open **SQL Editor > New query**.
4. Open `supabase/schema.sql` in Visual Studio Code.
5. Copy the complete file, paste it into the SQL Editor and click **Run**.

The SQL creates customer profiles, enquiries, private image/video files, quotations, orders, notifications and all security policies.

## 3. Add local environment variables

1. Copy `.env.example`.
2. Rename the copy to `.env.local`.
3. Open **Supabase > Project Settings > API**.
4. Copy the Project URL and Publishable key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=
EMAIL_FROM="MM Rashid & Co. <enquiries@yourdomain.com>"
ADMIN_EMAIL=your-email@example.com
```

Never add a service-role key to a variable beginning with `NEXT_PUBLIC_`, and never upload `.env.local` to GitHub.

## 4. Configure local authentication

In **Supabase > Authentication > URL Configuration**, enter:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

Keep email confirmation enabled.

## 5. Start and test locally

Run:

```powershell
npm run dev
```

Open `http://localhost:3000` and check:

1. Homepage, logo, history image, workshop video and all ten gallery images.
2. **Account > Create account**.
3. Email confirmation and sign-in.
4. New enquiry with multiple images and videos.
5. Customer dashboard and private attachment display.

## 6. Make the first account an administrator

After creating your own account, run this in Supabase SQL Editor after replacing the email:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

Sign out and sign in again. The Admin link should appear.

## 7. Test the complete business flow

1. Create a second account using a customer email.
2. Submit an enquiry with multiple reference images and at least one MP4 video.
3. Sign in as administrator and open the enquiry.
4. Confirm every private attachment opens.
5. Create and email a quotation.
6. Sign in as the customer and accept the quotation.
7. Confirm the order is created.
8. Update the order status from the admin dashboard.

## 8. Production setup

After local testing succeeds:

1. Put the repository in the client's GitHub organization.
2. Import it into the client's Vercel team.
3. Add all environment variables in Vercel.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
5. Add the Vercel and final-domain callback URLs in Supabase.
6. Upgrade the client's Supabase organization to Pro.
7. Configure the client's Resend account and Supabase custom SMTP.
8. Connect the client's Cloudflare-managed domain to Vercel.
9. Follow every item in `CLIENT-HANDOVER.md` before delivery.

More detailed email and portal configuration is in `CUSTOMER-PORTAL-SETUP.md`.
