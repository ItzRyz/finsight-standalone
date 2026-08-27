"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updatePassword(password, confirm);
      setMessage(result.success ? "Password updated successfully." : "Unable to update password.");
    });
  }

  return <form onSubmit={submit} className="space-y-4"><Input type="password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" /><Input type="password" required minLength={12} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" /><Button className="w-full" disabled={isPending}>{isPending ? "Updating..." : "Update password"}</Button>{message && <p className="text-sm text-muted-foreground">{message}</p>}</form>;
}
