import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#eef0f3] px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-white shadow">
        <WifiOff className="size-6 text-muted-foreground" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">You are offline</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        It looks like you lost connection. FinSight will automatically sync when you are back online.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className="rounded-full bg-[#ffc400] px-6 py-2.5 text-sm font-semibold hover:bg-[#e6b000]">
          Go to dashboard
        </Link>
        <Link href="/" className="rounded-full border bg-white px-6 py-2.5 text-sm font-medium hover:bg-muted">
          Home
        </Link>
      </div>
    </div>
  );
}
