import type { Currency } from "@/stores/locale-store";

const FRACTION_DIGITS: Record<Currency, number> = {
  IDR: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
  SGD: 2,
};

const LOCALE_MAP: Record<string, string> = {
  id: "id-ID",
  en: "en-US",
};

export function formatCurrency(
  value: number | string,
  currency: Currency = "IDR",
  locale: string = "id",
): string {
  const numeric = Number(value);
  const digits = FRACTION_DIGITS[currency] ?? 2;
  const intlLocale = LOCALE_MAP[locale] ?? "id-ID";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(numeric);
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<string, Record<string, number>>,
): number {
  if (from === to) return amount;
  const rate = rates[from]?.[to];
  if (rate == null) return amount;
  return amount * rate;
}
