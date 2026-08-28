"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "id" | "en";
export type Currency = "IDR" | "USD" | "EUR" | "JPY" | "SGD";

type LocaleState = {
  locale: Locale;
  currency: Currency;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  setBoth: (locale: Locale, currency: Currency) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "id",
      currency: "IDR",
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setBoth: (locale, currency) => set({ locale, currency }),
    }),
    {
      name: "finsight-locale",
      partialize: (state) => ({ locale: state.locale, currency: state.currency }),
    },
  ),
);
