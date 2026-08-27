"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/auth";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [value, setValue] = useState(name);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateProfile(value);
      setMessage(result.success ? "Profile updated." : result.error ?? "Unable to update profile.");
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
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <div className="flex gap-3">
        <Button onClick={save} disabled={isPending}>{isPending ? "Saving..." : "Save changes"}</Button>
        <form action={signOut}><Button type="submit" variant="outline">Sign out</Button></form>
      </div>
    </div>
  );
}
