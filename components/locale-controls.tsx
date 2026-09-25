"use client";

import { useEffect, useState } from "react";

const countries = [
  ["PK","Pakistan","PKR Rs"],
  ["GB","United Kingdom","GBP £"],
  ["US","United States","USD $"],
  ["DE","Germany","EUR €"],
  ["FR","France","EUR €"],
  ["ES","Spain","EUR €"],
  ["AE","United Arab Emirates","AED د.إ"],
  ["SA","Saudi Arabia","SAR ر.س"],
] as const;

const countryLanguage: Record<string,string> = {
  PK: "en",
  GB: "en",
  US: "en",
  DE: "de",
  FR: "fr",
  ES: "es",
  AE: "ar",
  SA: "ar",
};

const languages = [
  ["en","English"],
  ["fr","Français"],
  ["de","Deutsch"],
  ["es","Español"],
  ["ar","العربية"],
  ["ur","اردو"],
] as const;

export function LocaleControls({ compact = false }: { compact?: boolean }) {
  const [country,setCountry] = useState("PK");
  const [language,setLanguage] = useState("en");

  useEffect(() => {
    const savedCountry = window.localStorage.getItem("mmr-country");
    const savedLanguage = window.localStorage.getItem("mmr-language");
    if (savedCountry) setCountry(savedCountry);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  function updateCountry(value: string) {
    setCountry(value);
    window.localStorage.setItem("mmr-country", value);
    const suggested = countryLanguage[value] ?? "en";
    setLanguage(suggested);
    window.localStorage.setItem("mmr-language", suggested);
    document.documentElement.lang = suggested;
  }

  function updateLanguage(value: string) {
    setLanguage(value);
    window.localStorage.setItem("mmr-language", value);
    document.documentElement.lang = value;
  }

  const selectedCountry = countries.find(([code]) => code === country) ?? countries[0];

  return (
    <div className={compact ? "locale-controls is-compact" : "locale-controls"}>
      <label>
        {!compact ? <span>Country/region</span> : null}
        <select value={country} onChange={(event) => updateCountry(event.target.value)} aria-label="Country or region">
          {countries.map(([code,name,currency]) => (
            <option key={code} value={code}>{name} | {currency}</option>
          ))}
        </select>
      </label>

      <label>
        {!compact ? <span>Language</span> : null}
        <select value={language} onChange={(event) => updateLanguage(event.target.value)} aria-label="Language">
          {languages.map(([code,name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>

      {!compact ? (
        <p className="locale-note">
          Country and language preferences are saved on this device. Full catalogue translation will use these preferences when the translation service is enabled.
        </p>
      ) : null}
    </div>
  );
}
