"use client";
import Link from "next/link";
import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { submitQuoteBag } from "@/app/quote-bag/actions";
type Item = { id: string; name: string; slug: string; quantity: number };
const key = "mmr-quotation-bag";
function subscribe(callback: () => void) {
  window.addEventListener("mmr-bag", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("mmr-bag", callback);
    window.removeEventListener("storage", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(key) || "[]";
  } catch {
    return "[]";
  }
}
function read(raw: string): Item[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data)
      ? data
          .filter(
            (x: Item) =>
              x &&
              typeof x.id === "string" &&
              typeof x.name === "string" &&
              typeof x.slug === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          )
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
function save(items: Item[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event("mmr-bag"));
    return true;
  } catch {
    return false;
  }
}
function useBag() {
  return read(useSyncExternalStore(subscribe, snapshot, () => "[]"));
}
export function BagLink() {
  const items = useBag();
  return (
    <Link
      href="/quote-bag"
      aria-label={"Quotation bag, " + items.length + " products"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M8 9V6a4 4 0 0 1 8 0v3" />
      </svg>
      {items.length > 0 && <span className="bag-count">{items.length}</span>}
    </Link>
  );
}
export function AddToBag({
  product,
}: {
  product: { id: string; name: string; slug: string };
}) {
  const items = useBag();
  const added = items.some((i) => i.id === product.id);
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="bag-add"
        type="button"
        aria-pressed={added}
        onClick={() => {
          if (!added) {
            if (items.length >= 30) {
              setError("Your bag holds up to 30 pieces.");
              return;
            }
            if (!save([...items, { ...product, quantity: 1 }]))
              setError("Please enable browser storage to save pieces.");
          }
        }}
      >
        {added ? "Added to bag ✓" : "Add to quote +"}
      </button>
      {error && <span role="status">{error}</span>}
    </>
  );
}
export function QuoteBag({
  signedIn,
  country,
}: {
  signedIn: boolean;
  country: string;
}) {
  const items = useBag();
  const [state, action, pending] = useActionState(submitQuoteBag, {
    message: "",
    success: false,
  });
  useEffect(() => {
    if (state.success) save([]);
  }, [state.success]);
  if (state.success)
    return (
      <div className="bag-status" role="status">
        <h2>Your quotation request is with us.</h2>
        <p>We will prepare a private quotation for each piece.</p>
        <Link className="text-link" href="/customer">
          View my requests ↗
        </Link>
      </div>
    );
  if (!items.length)
    return (
      <div>
        <h2>Your quotation bag is empty.</h2>
        <p>
          Save pieces from the collection, then send your requirements together.
        </p>
        <Link className="atelier-button" href="/products">
          Explore products ↗
        </Link>
      </div>
    );
  return (
    <div className="bag-layout">
      <div>
        {items.map((item) => (
          <div className="bag-item" key={item.id}>
            <Link href={"/products/" + encodeURIComponent(item.slug)}>
              {item.name}
            </Link>
            <input
              aria-label={"Quantity for " + item.name}
              type="number"
              min="1"
              max="100000"
              value={item.quantity}
              onChange={(e) => {
                const quantity = Math.max(
                  1,
                  Math.min(100000, Number(e.target.value) || 1),
                );
                save(
                  items.map((i) => (i.id === item.id ? { ...i, quantity } : i)),
                );
              }}
            />
            <button
              type="button"
              onClick={() => save(items.filter((i) => i.id !== item.id))}
            >
              Remove
            </button>
          </div>
        ))}
        <p>
          Pricing is prepared individually for your quantities, materials and
          finish.
        </p>
        <Link className="text-link" href="/products">
          Continue exploring ↗
        </Link>
      </div>
      <form action={action} className="bag-form">
        <h2>Your commission</h2>
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(
            items.map(({ id, quantity }) => ({ id, quantity })),
          )}
        />
        <label>
          Delivery country
          <input
            name="country"
            defaultValue={country}
            required
            maxLength={100}
            autoComplete="country-name"
          />
        </label>
        <label>
          Required by (optional)
          <input name="required_by" type="date" />
        </label>
        <label>
          Specifications &amp; notes
          <textarea
            name="notes"
            rows={5}
            maxLength={4000}
            placeholder="Materials, dimensions, colours and any details for each piece"
            required
          />
        </label>
        {state.message && <p role="alert">{state.message}</p>}
        {signedIn ? (
          <button className="atelier-button" disabled={pending}>
            {pending ? "Sending your request…" : "Request my quotation ↗"}
          </button>
        ) : (
          <Link
            className="atelier-button"
            href="/sign-in?message=Sign%20in%20then%20return%20to%20your%20quotation%20bag%20to%20send%20your%20request."
          >
            Sign in to send request ↗
          </Link>
        )}
        <p>
          No payment is taken. Your quotation will be shared privately in your
          account.
        </p>
      </form>
    </div>
  );
}
