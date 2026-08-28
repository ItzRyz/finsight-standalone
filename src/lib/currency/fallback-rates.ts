import type { Currency } from "@/stores/locale-store";

// Static fallback when exchangerate-api is unreachable. Values relative to 1 unit of base.
// Update periodically; used for offline cache.
export const FALLBACK_RATES: Record<Currency, Record<Currency, number>> = {
  IDR: { IDR: 1, USD: 0.000061, EUR: 0.000056, JPY: 0.0091, SGD: 0.000082 },
  USD: { USD: 1, IDR: 16350, EUR: 0.92, JPY: 149, SGD: 1.34 },
  EUR: { EUR: 1, IDR: 17800, USD: 1.09, JPY: 162, SGD: 1.46 },
  JPY: { JPY: 1, IDR: 110, USD: 0.0067, EUR: 0.0062, SGD: 0.009 },
  SGD: { SGD: 1, IDR: 12200, USD: 0.75, EUR: 0.68, JPY: 111 },
};
