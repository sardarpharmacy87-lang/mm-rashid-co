# MM Rashid & Co. website update

## Open this version

1. Extract this ZIP to a new folder. Keep your existing project as a backup.
2. Copy your existing `.env.local` into the new folder beside `package.json`. The download intentionally contains no private configuration.
3. Open the new folder in Visual Studio Code, then open Terminal > New Terminal.
4. Run `npm ci`, then `npm run dev`.
5. Open `http://localhost:3000` for the public website. `/customer` is the separate customer dashboard; `/admin` is the admin portal.

Do not overwrite your existing `.env.local`, reset Supabase, or rerun the database schema just to apply this website update. Keep your current Supabase and email configuration.

## What changed

- Renamed `public/images/Gallery` to lowercase `gallery` so image URLs also work on case-sensitive hosting.
- Corrected `media-showcase.module.css.tsx` to `media-showcase.module.css` and `media-showcase.tsx.tsx` to `media-showcase.tsx`. Fixed the spare component's video path too.
- Restored the missing Craft section and its six existing product categories.
- Removed the extra CSS ring around the small brand logo and adjusted the hero image mask to hide stray pixels outside the emblem.
- Preserved the full heritage photograph, moved its caption underneath, and corrected its responsive image sizing.
- Kept content readable before JavaScript loads and respected reduced-motion preferences for the interactive emblem.
- Made the scroll cue available on mobile and adjusted navigation spacing and the menu label.
- Limited authentication middleware to account and private routes so the public homepage and static catalogue files do not depend on an authentication refresh.
- Added the Catalogue section and a blank `.env.example`.

The website text uses **MM Rashid & Co.** The supplied logo bitmap still spells **M.M** inside the emblem. Its lettering has not been redrawn or regenerated; a corrected original logo file is needed to change that artwork precisely.

## Add the finished catalogue

The button currently says **Request our catalogue** and goes to the contact section.

1. Create `public/catalogue` and add the finished PDF as `mm-rashid-catalogue.pdf`.
2. Open `lib/catalogue.ts` and change `published: false` to `published: true`.
3. The button will become **View catalogue (PDF)**.
4. Test the PDF link, then run `npm run build` and deploy the updated project.

The existing colour-studies PDF is retained as supplied. It is not linked as the finished catalogue.

## Verification

- TypeScript validation and ESLint passed.
- Next.js production compilation succeeded, but the complete production build could not finish because this environment refused a worker process with `spawn EPERM`. Run `npm run build` locally before deployment.
- The actual Next.js preview loaded on desktop and mobile without browser console errors.
- All ten gallery images loaded; local asset references were checked with exact filename casing.
- The workshop video loaded with its poster and played; playback time advanced past five seconds.
- Mobile navigation opened, followed a section link, and closed. No horizontal page overflow was detected at the mobile test size.
- All homepage section links resolved to existing sections. The sign-in page rendered correctly.
- Authenticated customer/admin flows, enquiry uploads, quotation emails, and live deployment were not exercised. No emails or account submissions were sent.

The ZIP contains source and media. Dependencies, build caches, and `.env.local` are excluded.
