"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <main className="grid min-h-80 place-items-center p-6"><div className="max-w-md text-center"><h1 className="text-xl font-bold">Something went wrong</h1><p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t load this page. Please try again.</p><Button className="mt-4" onClick={reset}>Try again</Button></div></main>; }
