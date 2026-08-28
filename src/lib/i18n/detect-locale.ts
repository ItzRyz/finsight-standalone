import { mapCountryToLocale } from "./country-map";
import type { Currency, Locale } from "@/stores/locale-store";

export function detectFromHeaders(headers: Headers): { locale: Locale; currency: Currency } | null {
  // Vercel / Cloudflare geo
  const vercelCountry = headers.get("x-vercel-ip-country");
  const cfCountry = headers.get("cf-ipcountry");
  const country = vercelCountry || cfCountry;
  if (country) {
    const mapped = mapCountryToLocale(country);
    if (mapped) return mapped;
  }

  // Accept-Language fallback
  const accept = headers.get("accept-language");
  if (accept) {
    const primary = accept.split(",")[0]?.split(";")[0]?.trim().toLowerCase();
    if (primary?.startsWith("id")) return { locale: "id", currency: "IDR" };
    if (primary?.startsWith("ja")) return { locale: "en", currency: "JPY" };
    if (primary?.startsWith("en")) return { locale: "en", currency: "USD" };
  }

  return null;
}

export function detectFromIp(ip: string | null): { locale: Locale; currency: Currency } | null {
  // Very coarse IP-based fallback — for local dev ::1 returns null
  if (!ip || ip === "::1" || ip === "127.0.0.1") return null;
  // Real implementation would call geo IP; here we return null and let caller fallback to id/IDR
  return null;
}
