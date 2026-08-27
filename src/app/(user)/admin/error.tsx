"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden = error.name === "ForbiddenError" || error.message.includes("FORBIDDEN");

  if (isForbidden) {
    return (
      <main className="grid min-h-[60vh] place-items-center p-6">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto size-10 text-destructive" aria-hidden />
          <h1 className="mt-4 text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need administrator privileges to view this page. Contact an admin if you believe this is a mistake.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-[60vh] place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t load the admin page. Please try again.</p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
