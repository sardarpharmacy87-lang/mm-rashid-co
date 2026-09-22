import { Resend } from "resend";

type EmailOptions = {
  to: string;
  name: string;
  subject: string;
  heading: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  idempotencyKey?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendCustomerEmail(options: EmailOptions) {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is missing" };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const from = process.env.EMAIL_FROM ?? "MM Rashid & Co. <onboarding@resend.dev>";
  const actionUrl = options.actionPath ? `${siteUrl}${options.actionPath}` : null;

  const { data, error } = await resend.emails.send(
    {
      from,
      to: options.to,
      subject: options.subject,
      html: `
        <!doctype html>
        <html>
          <body style="margin:0;background:#f4f1e8;font-family:Arial,sans-serif;color:#071a47">
            <div style="max-width:620px;margin:0 auto;padding:36px 18px">
              <div style="background:#071a47;padding:26px 30px;border-top:4px solid #eab62c">
                <div style="color:#eab62c;font-size:12px;letter-spacing:2px;text-transform:uppercase">MM Rashid &amp; Co.</div>
                <h1 style="margin:12px 0 0;color:#fff;font-size:27px;line-height:1.25">${escapeHtml(options.heading)}</h1>
              </div>
              <div style="background:#fff;padding:30px;border:1px solid #e5dfcf">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Dear ${escapeHtml(options.name)},</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7">${escapeHtml(options.message)}</p>
                ${
                  actionUrl && options.actionLabel
                    ? `<a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#eab62c;color:#071a47;text-decoration:none;font-weight:700;padding:14px 20px">${escapeHtml(options.actionLabel)}</a>`
                    : ""
                }
                <p style="margin:28px 0 0;color:#687188;font-size:13px;line-height:1.6">Commissioner Road, Sialkot 51310, Pakistan<br>+92 334 334 2223</p>
              </div>
            </div>
          </body>
        </html>
      `,
    },
    options.idempotencyKey
      ? { headers: { "Idempotency-Key": options.idempotencyKey } }
      : undefined,
  );

  if (error) return { sent: false, reason: error.message };
  return { sent: true, id: data?.id };
}
