import type { Currency, Locale } from "@/stores/locale-store";

// ISO 3166-1 alpha-2 → locale/currency. Expand as needed.
export const COUNTRY_MAP: Record<string, { locale: Locale; currency: Currency }> = {
  ID: { locale: "id", currency: "IDR" },
  MY: { locale: "en", currency: "SGD" },
  SG: { locale: "en", currency: "SGD" },
  US: { locale: "en", currency: "USD" },
  GB: { locale: "en", currency: "USD" }, // map GBP→USD for now (no GBP in enum) — fallback via EUR later
  DE: { locale: "en", currency: "EUR" },
  FR: { locale: "en", currency: "EUR" },
  IT: { locale: "en", currency: "EUR" },
  ES: { locale: "en", currency: "EUR" },
  NL: { locale: "en", currency: "EUR" },
  JP: { locale: "en", currency: "JPY" },
  AU: { locale: "en", currency: "USD" },
  IN: { locale: "en", currency: "USD" },
  CN: { locale: "en", currency: "USD" },
  KR: { locale: "en", currency: "JPY" },
};

export function mapCountryToLocale(country: string | null | undefined): { locale: Locale; currency: Currency } | null {
  if (!country) return null;
  const key = country.trim().toUpperCase();
  return COUNTRY_MAP[key] ?? null;
}
