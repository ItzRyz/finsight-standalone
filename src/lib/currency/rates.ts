import type { Currency } from "@/stores/locale-store";
import { FALLBACK_RATES } from "./fallback-rates";

const API_BASE = "https://api.exchangerate-api.com/v4/latest";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

type RateCache = {
  rates: Record<Currency, Record<Currency, number>>;
  fetchedAt: number;
};

let memoryCache: RateCache | null = null;

async function fetchFromApi(base: Currency): Promise<Record<Currency, number> | null> {
  const key = process.env.EXCHANGERATE_API_KEY;
  // exchangerate-api.com v4 works without key for limited pairs; if key present use v6
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`
    : `${API_BASE}/${base}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const rates = data.rates ?? data.conversion_rates;
    if (!rates) return null;
    // Normalize to our 5 currencies
    const out: Partial<Record<Currency, number>> = {};
    (["IDR", "USD", "EUR", "JPY", "SGD"] as Currency[]).forEach((c) => {
      if (typeof rates[c] === "number") out[c] = rates[c];
    });
    return out as Record<Currency, number>;
  } catch {
    return null;
  }
}

export async function getRates(base: Currency = "IDR"): Promise<Record<Currency, Record<Currency, number>>> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return memoryCache.rates;
  }

  const currencies: Currency[] = ["IDR", "USD", "EUR", "JPY", "SGD"];
  const result: Record<Currency, Record<Currency, number>> = { ...FALLBACK_RATES };

  // Try to fetch IDR base first (most used)
  const fetched = await fetchFromApi(base);
  if (fetched) {
    result[base] = { ...result[base], ...fetched };
    // Derive cross rates via base
    currencies.forEach((from) => {
      currencies.forEach((to) => {
        if (from === to) result[from][to] = 1;
        else if (from === base && fetched[to]) result[from][to] = fetched[to]!;
        else if (from !== base && to === base && fetched[from]) {
          // inverse: from -> base via 1 / (base -> from)
          const baseToFrom = fetched[from];
          if (baseToFrom && baseToFrom !== 0) result[from][to] = 1 / baseToFrom;
        } else if (from !== base && to !== base && fetched[from] && fetched[to]) {
          // via base: from -> base -> to
          const baseToFrom = fetched[from];
          const baseToTo = fetched[to];
          if (baseToFrom && baseToFrom !== 0 && baseToTo) result[from][to] = baseToTo / baseToFrom;
        } else if (result[from]?.[base] && result[base]?.[to]) {
          result[from][to] = result[from][base]! * result[base][to]!;
        }
      });
    });
  }

  memoryCache = { rates: result, fetchedAt: now };
  return result;
}

// Convenience for converting without fetching if caller already has rates
export function getFallbackRates() {
  return FALLBACK_RATES;
}
