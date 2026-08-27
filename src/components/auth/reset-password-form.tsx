"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(password, confirm);
      if (result.success) {
        setMessage("Password updated successfully. You can now sign in.");
      } else {
        const msg =
          typeof result.error === "object" && result.error
            ? Object.values(result.error as Record<string, string>)[0]
            : (result.error as string | undefined);
        setError(msg ?? "Unable to update password.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          type="password"
          required
          minLength={12}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <p className="text-[10px] text-muted-foreground">At least 12 characters, include upper/lower, number and symbol.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm">Confirm password</Label>
        <Input
          id="reset-confirm"
          type="password"
          required
          minLength={12}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Updating..." : "Update password"}
      </Button>
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </form>
  );
}
