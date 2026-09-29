"use client";
import { countries } from "@/lib/regions";
import { useLocale } from "@/components/locale-provider";
export function LocaleControls({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const names = new Intl.DisplayNames(["en"], { type: "language" });
  return (
    <div
      className={"locale-controls notranslate " + (compact ? "is-compact" : "")}
      translate="no"
    >
      <label>
        {!compact && <span>Country / region</span>}
        <select
          aria-label="Country or region"
          value={locale.country}
          onChange={(e) => locale.setCountry(e.target.value)}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {!compact && <span>Language</span>}
        <select
          aria-label="Language"
          value={locale.language}
          onChange={(e) => locale.setLanguage(e.target.value)}
          disabled={!locale.ready && locale.languages.length > 1}
        >
          {locale.languages.map((code) => (
            <option key={code} value={code}>
              {names.of(code) || code}
            </option>
          ))}
        </select>
      </label>
      {locale.notice && (
        <span className="locale-status" role="status">
          {locale.notice}
        </span>
      )}
    </div>
  );
}
