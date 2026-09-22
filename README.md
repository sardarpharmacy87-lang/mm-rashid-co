# MM Rashid & Co. — Next.js Website

Complete Visual Studio Code project for the MM Rashid & Co. embroidery website and customer portal.

## Project structure

- `app/page.tsx` — home page content
- `app/layout.tsx` — page metadata and root layout
- `app/globals.css` — complete blue-and-gold design
- `components/` — navigation, branding, animations and 3D logo interaction
- `public/` — original logo and favicon
- `package.json` — project commands and dependencies
- `next.config.ts` — Next.js configuration
- `tsconfig.json` — TypeScript configuration
- `vercel.json` — Vercel settings
- `supabase/schema.sql` — database, private file storage and security rules
- `CUSTOMER-PORTAL-SETUP.md` — Supabase, email and portal setup
- `CLIENT-HANDOVER.md` — ownership-transfer checklist
- `START-HERE.md` — exact setup and testing order for this final project
- `.vscode/` — recommended Visual Studio Code extensions and formatting settings

## Run in Visual Studio Code

1. Extract the project ZIP.
2. Open the extracted folder in Visual Studio Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`.
5. Follow `START-HERE.md` to connect Supabase.
6. Run `npm run dev`.
7. Open `http://localhost:3000` in your browser.

## Deploy to Vercel

Upload this folder to GitHub and import the repository into Vercel. Vercel will automatically recognise the Next.js project and use `npm run build`.
