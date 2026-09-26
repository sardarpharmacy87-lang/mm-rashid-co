export const paymentKinds = [
  "bank_transfer",
  "hosted_gateway",
  "manual",
] as const;
export function safeHttpsUrl(value: string) {
  if (!value.trim()) return null;
  try {
    const u = new URL(value);
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      u.port ||
      u.hostname === "localhost" ||
      !u.hostname.includes(".") ||
      /^\d+(\.\d+){3}$/.test(u.hostname)
    )
      return null;
    return u.href;
  } catch {
    return null;
  }
}
export function isMatchingGateway(url: string, host: string) {
  const safe = safeHttpsUrl(url);
  if (!safe || !host) return false;
  return new URL(safe).hostname === host.toLowerCase().trim();
}
export function payableQuote(
  quote: { status: string; valid_until: string; total: number | string },
  today = new Date().toISOString().slice(0, 10),
) {
  return (
    ["sent", "accepted"].includes(quote.status) &&
    quote.valid_until >= today &&
    Number.isFinite(Number(quote.total)) &&
    Number(quote.total) > 0
  );
}
