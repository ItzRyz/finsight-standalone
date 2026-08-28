"use client";

import { useEffect } from "react";
import { useLocaleStore, type Locale, type Currency } from "@/stores/locale-store";

type Props = {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialCurrency?: Currency;
};

export function LocaleProvider({ children, initialLocale, initialCurrency }: Props) {
  const { locale, currency, setBoth } = useLocaleStore();

  useEffect(() => {
    // Sync from server-provided DB values on mount
    if (initialLocale && initialCurrency) {
      if (initialLocale !== locale || initialCurrency !== currency) {
        setBoth(initialLocale, initialCurrency);
      }
    }
  }, [initialLocale, initialCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
