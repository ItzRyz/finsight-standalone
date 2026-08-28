const LOCALE_MAP: Record<string, string> = {
  id: "id-ID",
  en: "en-US",
};

export function formatDate(
  value: Date | string,
  locale: string = "id",
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const d = new Date(value);
  const intlLocale = LOCALE_MAP[locale] ?? "id-ID";
  return d.toLocaleDateString(intlLocale, opts);
}

export function formatDateTime(
  value: Date | string,
  locale: string = "id",
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  const d = new Date(value);
  const intlLocale = LOCALE_MAP[locale] ?? "id-ID";
  return new Intl.DateTimeFormat(intlLocale, opts).format(d);
}
