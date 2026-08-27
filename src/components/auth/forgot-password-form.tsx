"use client";

import { useState, useTransition } from "react";
import { forgotPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      const result = await forgotPassword(formData);
      setMessage(result.success ? "Check your email for the reset link." : "Unable to send reset email.");
    });
  }

  return <form onSubmit={submit} className="space-y-4"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /><Button className="w-full" disabled={isPending}>{isPending ? "Sending..." : "Send reset link"}</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form>;
}
