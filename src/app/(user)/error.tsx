"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden = error.name === "ForbiddenError" || error.message.includes("FORBIDDEN");

  if (isForbidden) {
    return (
      <main className="grid min-h-80 place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have permission to view this page.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-80 place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t load this page. Please try again.</p>
        <Button className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
