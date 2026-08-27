import Link from "next/link";
import { TrendingUp, WalletCards, Bell, Tags, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#eef0f3] font-sans">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#ffc400] text-white">
            <TrendingUp className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">FinSight</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">Financial command center</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="rounded-full bg-[#ffc400] px-5 py-2 text-sm font-semibold text-[#292929] hover:bg-[#e6b000]"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#b48f00]">
              Your financial command center
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#292929] sm:text-5xl">
              Smart insights
              <br />
              for smarter decisions.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Track income and expenses, manage budgets by category, and get real-time alerts — all in one
              beautifully simple dashboard.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ffc400] px-8 text-sm font-semibold text-[#292929] hover:bg-[#e6b000]"
              >
                Get started <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex h-11 items-center justify-center rounded-full border bg-white px-8 text-sm font-medium hover:bg-muted"
              >
                Sign in to dashboard
              </Link>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <Feature icon={<WalletCards className="size-5" />} title="Smart budgets" desc="Monthly & yearly budgets with warning thresholds" />
            <Feature icon={<Tags className="size-5" />} title="Categories" desc="System & custom categories with auto-detect" />
            <Feature icon={<Bell className="size-5" />} title="Real-time alerts" desc="Budget warnings pushed instantly to you" />
          </div>
        </section>

        <footer className="border-t bg-white px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FinSight — AI-powered financial solution
        </footer>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 text-left">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#ffc400]/15 text-[#b48f00]">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
    </div>
  );
}
