# Commerce release — 29 September 2026

## Admin setup
1. Products: enter sizes and colors (commas or new lines). Enable Show price and enter a unit price to offer checkout. Hidden prices remain quotation-only.
2. Cart settings: choose store currency before entering prices, shipping fee, optional free-shipping threshold, tax percentage, minimum order and quantity limit.
3. Payments: configure and enable your receiving methods. Enable checkout only when ready to accept orders.
4. Orders & quotes: read customer specifications and private reference files, send the product subtotal plus shipping/tax, arrange payment, verify receipt and update order/tracking status.

## Customer flow
Discuss a custom order opens /quotation, requires sign-in and returns there after sign-in. Customers can describe colors, sizes, measurements, material, embroidery, quantity, country and required date, with up to 10 private reference images/videos.
Priced products use /cart. Hidden-price or mixed carts use a quotation for the entire selection. Accepted quotes and catalogue orders appear in the existing customer portal.

## Payment scope
Three configurable bank transfer, manual-instruction or hosted-gateway slots are supported. Hosted gateway links must be created in your provider dashboard for the exact order amount/currency, then attached in admin. Payment receipt is verified manually. Automatic card settlement/webhooks are not integrated: provider names and account setup have not yet been supplied. Never enter secret API keys in the receiving-account fields.
Checkout remains disabled until the owner configures payment details and enables it. Existing products retain hidden prices until explicitly changed.

## Database setup
For an existing storefront, apply supabase/commerce-options.sql followed by supabase/commerce-quote-locks.sql once. These have already been applied to the connected project. For a new installation, follow the earlier database setup files first. No credentials, database contents or private customer uploads are included in the source ZIP.

## Validation
Production build and TypeScript pass. Database transaction tests passed for computed totals, duplicate retries, forged totals, invalid sizes, hidden-price rejection, customer isolation, payment write protection, missing-upload rejection, request finalization, quote acceptance retries and agreed-price locking. Test fixtures were rolled back.
Signed-in browser upload and actual payment-provider transactions still require owner acceptance testing with configured accounts. Existing Supabase advisory warnings outside this upgrade remain, including leaked-password protection and legacy helper functions.
