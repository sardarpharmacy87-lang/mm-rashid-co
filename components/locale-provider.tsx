"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { countryLanguages } from "@/lib/regions";
type Translator = {
  initialize: (options: Record<string, unknown>) => void;
  switchTo: (code: string) => void;
  getCurrentLang: () => string;
  on: (event: string, callback: (code: string) => void) => void;
  initialized?: boolean;
};
declare global {
  interface Window {
    Weglot?: Translator;
  }
}
type LocaleState = {
  country: string;
  language: string;
  languages: string[];
  ready: boolean;
  notice: string;
  setCountry: (code: string) => void;
  setLanguage: (code: string) => void;
};
const LocaleContext = createContext<LocaleState>({
  country: "PK",
  language: "en",
  languages: ["en"],
  ready: false,
  notice: "",
  setCountry: () => {},
  setLanguage: () => {},
});
export function useLocale() {
  return useContext(LocaleContext);
}
export function LocaleProvider({
  children,
  translationKey,
  languages: configured,
  initialCountry,
}: {
  children: React.ReactNode;
  translationKey: string;
  languages: string[];
  initialCountry: string;
}) {
  const path = usePathname();
  const privatePage =
    /^\/(admin|customer|sign-in|sign-up|forgot-password|update-password|quote-bag|auth)(\/|$)/.test(
      path,
    );
  const [country, setCountryState] = useState(initialCountry);
  const [language, setLanguageState] = useState("en");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const languages = translationKey
    ? Array.from(new Set(["en", ...configured]))
    : ["en"];
  function rememberCountry(code: string) {
    setCountryState(code);
    try {
      localStorage.setItem("mmr-country", code);
    } catch {}
    document.cookie =
      "mmr-country=" +
      encodeURIComponent(code) +
      "; Path=/; Max-Age=31536000; SameSite=Lax";
  }
  function switchLanguage(code: string, manual = false) {
    if (code !== "en" && (!ready || !window.Weglot)) {
      setNotice("Translation is not available yet. Please try again shortly.");
      return;
    }
    if (!languages.includes(code)) return;
    if (window.Weglot?.initialized) window.Weglot.switchTo(code);
    if (code === "en") {
      setLanguageState("en");
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
    try {
      localStorage.setItem("mmr-language", code);
      if (manual) localStorage.setItem("mmr-language-manual", "1");
    } catch {}
    setNotice("");
  }
  function initialize() {
    const api = window.Weglot;
    if (!api) return;
    api.on("languageChanged", (code) => {
      setLanguageState(code);
      document.documentElement.lang = code;
      document.documentElement.dir = ["ar", "ur", "he", "fa", "ps"].includes(
        code,
      )
        ? "rtl"
        : "ltr";
      setNotice("");
    });
    api.on("initialized", () => {
      setReady(true);
      let selected = "en";
      try {
        selected =
          localStorage.getItem("mmr-language") ||
          countryLanguages[
            localStorage.getItem("mmr-country") || initialCountry
          ] ||
          "en";
      } catch {}
      if (languages.includes(selected)) api.switchTo(selected);
    });
    api.initialize({
      api_key: translationKey,
      hide_switcher: true,
      auto_switch: false,
      cache: true,
      excluded_blocks: [
        { value: ".notranslate" },
        { value: ".portal-layout" },
        { value: ".bag-form" },
        { value: ".product-rate-form" },
        { value: ".support-chat-panel" },
      ],
      excluded_paths: [
        { value: "/admin", type: "START_WITH" },
        { value: "/customer", type: "START_WITH" },
        { value: "/sign-", type: "START_WITH" },
        { value: "/quote-bag", type: "START_WITH" },
        { value: "/forgot-password", type: "START_WITH" },
        { value: "/update-password", type: "START_WITH" },
        { value: "/auth", type: "START_WITH" },
      ],
      translate_search: true,
      search_forms: ".atelier-search, .catalogue-toolbar",
      search_parameter: "q",
    });
  }
  function chooseCountry(code: string) {
    rememberCountry(code);
    let manual = false;
    try {
      manual = localStorage.getItem("mmr-language-manual") === "1";
    } catch {}
    const suggested = countryLanguages[code] || "en";
    if (!manual && languages.includes(suggested)) switchLanguage(suggested);
  }
  return (
    <LocaleContext.Provider
      value={{
        country,
        language,
        languages,
        ready: ready && !privatePage,
        notice,
        setCountry: chooseCountry,
        setLanguage: (code) => switchLanguage(code, true),
      }}
    >
      {translationKey && !privatePage && (
        <Script
          src="https://cdn.weglot.com/weglot.min.js"
          strategy="afterInteractive"
          onReady={() => {
            if (window.Weglot?.initialized) setReady(true);
            else initialize();
          }}
          onError={() => setNotice("Translation is temporarily unavailable.")}
        />
      )}
      {children}
    </LocaleContext.Provider>
  );
}
