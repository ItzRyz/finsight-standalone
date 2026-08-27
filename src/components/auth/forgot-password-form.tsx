"use client";

import { useState, useTransition } from "react";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      const result = await forgotPassword(formData);
      if (result.success) {
        setMessage("Check your email for the reset link.");
      } else {
        const fieldMsg = typeof result.error === "object" ? Object.values(result.error as Record<string, string>)[0] : result.error;
        setError(fieldMsg ?? "Unable to send reset email.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-describedby={error ? "forgot-error" : undefined}
        />
      </div>
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
      {error && <p id="forgot-error" className="text-sm text-destructive" role="alert">{error}</p>}
    </form>
  );
}
