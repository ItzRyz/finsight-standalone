"use client";

import { useState, useTransition } from "react";
import { updateProfile, updatePreferences } from "@/actions/auth";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocaleStore } from "@/stores/locale-store";
import type { Locale, Currency } from "@/stores/locale-store";

export function SettingsForm({
  name,
  email,
  locale: initialLocale,
  currency: initialCurrency,
}: {
  name: string;
  email: string;
  locale: Locale;
  currency: Currency;
}) {
  const [value, setValue] = useState(name);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const setStore = useLocaleStore((s) => s.setBoth);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const r1 = await updateProfile(value);
      const r2 = await updatePreferences({ locale, currency });
      setStore(locale, currency);
      if (!r1.success) setMessage(r1.error ?? "Unable to update profile.");
      else if (!r2.success) setMessage("Profile saved but preferences failed.");
      else setMessage("Profile and preferences updated.");
    });
  }

  return (
    <div className="max-w-xl space-y-6 rounded-xl border bg-card p-6">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" value={email} disabled />
      </Field>
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" value={value} onChange={(event) => setValue(event.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Language</FieldLabel>
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Indonesia (ID)</SelectItem>
              <SelectItem value="en">English (EN)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Currency</FieldLabel>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IDR">IDR — Rupiah</SelectItem>
              <SelectItem value="USD">USD — Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
              <SelectItem value="JPY">JPY — Yen</SelectItem>
              <SelectItem value="SGD">SGD — Dollar</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">Language & currency are detected from your IP at sign-in, but you can override here. Rates via exchangerate-api (hourly cache).</p>
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
      <div className="flex gap-3">
        <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : "Save changes"}</Button>
        <form action={signOut}><Button type="submit" variant="outline">Sign out</Button></form>
      </div>
    </div>
  );
}
