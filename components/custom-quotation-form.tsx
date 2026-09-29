"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCart, saveCart } from "@/lib/cart-store";
import {
  createCustomRequest,
  finishCustomRequest,
} from "@/app/quotation/actions";
import {
  uploadEnquiryFiles,
  validateEnquiryFiles,
  type UploadProgress,
} from "@/lib/upload-enquiry-files";
import { countries } from "@/lib/regions";
export function CustomQuotationForm({
  product,
  country,
  fromCart,
}: {
  product?: { id: string; name: string; sizes: string[]; colors: string[] };
  country: string;
  fromCart: boolean;
}) {
  const cart = useCart();
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [requestId, setRequestId] = useState("");
  const uploaded = useRef(new Set<File>());
  if (sent)
    return (
      <section className="portal-section" role="status">
        <h2>Your quotation request has been sent.</h2>
        <p>
          Your reference files and specifications are private. Our workshop will
          review them and prepare your quotation.
        </p>
        <Link className="portal-button" href="/customer">
          View my requests
        </Link>
      </section>
    );
  return (
    <form
      className="portal-form custom-quotation-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending) return;
        const form = new FormData(e.currentTarget);
        const invalid = validateEnquiryFiles(files);
        if (invalid) {
          setMessage(invalid);
          return;
        }
        setPending(true);
        setMessage("");
        try {
          let activeRequest = requestId;
          if (!activeRequest) {
            form.set("file_count", String(files.length));
            form.set(
              "items",
              JSON.stringify(
                fromCart
                  ? cart.map(({ id, quantity, size, color }) => ({
                      id,
                      quantity,
                      size,
                      color,
                    }))
                  : [],
              ),
            );
            const result = await createCustomRequest(form);
            if (result.error) throw Error(result.error);
            activeRequest = result.id;
            setRequestId(activeRequest);
          }
          for (const file of files) {
            if (uploaded.current.has(file)) continue;
            await uploadEnquiryFiles([file], activeRequest, (p) =>
              setProgress({
                ...p,
                current: uploaded.current.size + 1,
                total: files.length,
              }),
            );
            uploaded.current.add(file);
          }
          const result = await finishCustomRequest(activeRequest, files.length);
          if (result.error) throw Error(result.error);
          if (fromCart) saveCart([]);
          setSent(true);
        } catch (error) {
          setMessage(
            (error instanceof Error
              ? error.message
              : "Unable to send your request.") +
              (requestId
                ? " Your request is saved; retry to finish the remaining uploads."
                : ""),
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <input name="product_id" type="hidden" value={product?.id || ""} />
      <fieldset
        disabled={pending || Boolean(requestId)}
        className="commerce-options"
      >
        <legend>1. Tell us about your product</legend>
        {fromCart && (
          <div className="quote-selected-products">
            {cart.length ? (
              cart.map((i, index) => (
                <p key={index}>
                  <strong>{i.name}</strong> · {i.quantity} pieces ·{" "}
                  {i.size || "Size to discuss"} ·{" "}
                  {i.color || "Color to discuss"}
                </p>
              ))
            ) : (
              <p>
                Your cart is empty. You can still describe a custom product
                below.
              </p>
            )}
          </div>
        )}
        <div className="form-grid">
          <label>
            Product / project name
            <input
              name="title"
              required
              minLength={3}
              maxLength={200}
              defaultValue={
                product?.name ||
                (fromCart && cart.length
                  ? "Quotation for selected products"
                  : "")
              }
              placeholder="For example: embroidered lodge caps"
            />
          </label>
          <label>
            Product category
            <select name="category" defaultValue="other">
              <option value="other">Custom product / other</option>
              <option value="cap-visor">Caps &amp; visors</option>
              <option value="fez">Fez</option>
              <option value="regalia">Regalia</option>
              <option value="military">Military &amp; ceremonial</option>
              <option value="crest">Badges &amp; insignia</option>
              <option value="goldwork">Bullion embroidery</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min="1"
              max="100000"
              step="1"
              required
              defaultValue={
                fromCart && cart.length
                  ? cart.reduce((n, i) => n + i.quantity, 0)
                  : 1
              }
              readOnly={fromCart && cart.length > 0}
            />
          </label>
          <label>
            Size / size breakdown
            <input
              name="size"
              maxLength={200}
              list="quotation-sizes"
              placeholder="M, or S: 10 / M: 20 / L: 10"
            />
            <datalist id="quotation-sizes">
              {product?.sizes.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </label>
          <label>
            Product &amp; embroidery colors
            <input
              name="color"
              maxLength={200}
              list="quotation-colors"
              placeholder="Navy fabric, white lettering; Pantone if known"
            />
            <datalist id="quotation-colors">
              {product?.colors.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </label>
          <label>
            Material / fabric
            <input
              name="material"
              maxLength={200}
              placeholder="Cotton, velvet, leather, or ask us to advise"
            />
          </label>
          <label>
            Finish / construction
            <input
              name="finish"
              maxLength={200}
              placeholder="Hand embroidery, machine embroidery, lining…"
            />
          </label>
          <label>
            Measurement unit
            <select name="units" defaultValue="cm">
              <option>cm</option>
              <option>inches</option>
              <option>mm</option>
            </select>
          </label>
          <label className="form-span-two">
            Measurements
            <textarea
              name="measurements"
              rows={2}
              maxLength={1000}
              placeholder="Height, width, head circumference or other dimensions"
            />
          </label>
          <label className="form-span-two">
            Logo, lettering &amp; placement
            <textarea
              name="branding"
              rows={2}
              maxLength={500}
              placeholder="Exact text, emblem placement and embroidery details"
            />
          </label>
          <label className="form-span-two">
            Describe your requirements
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={4000}
              rows={5}
              placeholder="Tell us what you want made. Include packaging, sample requirements and any other details."
            />
          </label>
        </div>
      </fieldset>
      <fieldset
        disabled={pending || Boolean(requestId)}
        className="commerce-options"
      >
        <legend>2. Upload your reference product</legend>
        <label>
          Product photos, artwork images or video
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              setFiles(selected);
              setMessage(validateEnquiryFiles(selected) || "");
            }}
          />
        </label>
        <p>
          Up to 10 files. Images: 15 MB each. Videos: 250 MB each. Only you and
          our team can access these files.
        </p>
        {files.map((f, i) => (
          <p key={i}>
            {f.name} · {(f.size / 1024 / 1024).toFixed(1)} MB
          </p>
        ))}
      </fieldset>
      <fieldset
        disabled={pending || Boolean(requestId)}
        className="commerce-options"
      >
        <legend>3. Delivery &amp; timing</legend>
        <div className="form-grid">
          <label>
            Delivery country
            <select
              name="country"
              required
              defaultValue={country || "Pakistan"}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Required by (optional)
            <input
              name="required_by"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
            />
          </label>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" name="terms" required />I agree to the
          quotation <Link href="/terms">terms</Link> and{" "}
          <Link href="/privacy">privacy policy</Link>.
        </label>
      </fieldset>
      {progress && pending && (
        <div className="upload-progress" role="status">
          <span>
            Uploading {progress.current} of {progress.total}:{" "}
            {progress.fileName}
          </span>
          <progress value={progress.percent} max="100" />
        </div>
      )}
      {message && (
        <p className="form-alert form-alert-error" role="alert">
          {message}
        </p>
      )}
      <button className="portal-button" disabled={pending}>
        {pending
          ? "Sending your request…"
          : requestId
            ? "Retry remaining uploads & send"
            : "Send quotation request"}
      </button>
      <p>
        No payment is required to request a quotation. Your quote will appear in
        your customer account.
      </p>
    </form>
  );
}
