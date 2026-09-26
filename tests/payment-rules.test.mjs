import test from "node:test";
import assert from "node:assert/strict";
import {
  safeHttpsUrl,
  isMatchingGateway,
  payableQuote,
} from "../lib/payment-rules.ts";

test("payment destinations must be public HTTPS addresses without credentials", () => {
  for (const url of [
    "",
    "javascript:alert(1)",
    "http://checkout.example.com",
    "https://user:password@checkout.example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://checkout.example.com:8443",
  ]) {
    assert.equal(safeHttpsUrl(url), null, url);
  }
  assert.equal(
    safeHttpsUrl("https://checkout.example.com/invoice/123?ref=abc"),
    "https://checkout.example.com/invoice/123?ref=abc",
  );
});

test("a hosted payment link must match the configured provider host exactly", () => {
  assert.equal(
    isMatchingGateway("https://pay.example.com/invoice/123", "pay.example.com"),
    true,
  );
  for (const url of [
    "https://pay.example.com.attacker.com/123",
    "https://attacker.com/?next=pay.example.com",
    "https://other.example.com/123",
  ]) {
    assert.equal(isMatchingGateway(url, "pay.example.com"), false);
  }
});

test("customers can pay only issued, unexpired, positive-value quotations", () => {
  const quote = { status: "sent", valid_until: "2026-10-01", total: "125.50" };
  assert.equal(payableQuote(quote, "2026-10-01"), true);
  assert.equal(
    payableQuote({ ...quote, status: "accepted" }, "2026-09-30"),
    true,
  );
  assert.equal(payableQuote(quote, "2026-10-02"), false);
  for (const status of ["draft", "rejected", "expired"])
    assert.equal(payableQuote({ ...quote, status }, "2026-09-30"), false);
  for (const total of [0, -1, "NaN", "Infinity"])
    assert.equal(payableQuote({ ...quote, total }, "2026-09-30"), false);
});
