import Link from "next/link";
import {
  TrendingUp,
  WalletCards,
  Bell,
  Tags,
  ArrowRight,
  BarChart3,
  Globe,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Receipt,
  Bot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Stats — public, best effort
  let stats = { users: 0, expenses: 0, budgets: 0, categories: 0 };
  try {
    const [users, expenses, budgets, categories] = await Promise.all([
      prisma.user.count(),
      prisma.expense.count(),
      prisma.budget.count(),
      prisma.category.count({ where: { type: "SYSTEM" } }),
    ]);
    stats = { users, expenses, budgets, categories };
  } catch {
    // fallback to 0 during build without DB
  }

  return (
    <div className="flex min-h-svh flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/80 px-6 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">FinSight</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">Financial command center</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
          <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
              <Link href="/dashboard" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth" className="hidden rounded-full border px-5 py-2 text-sm font-medium hover:bg-muted sm:inline-flex">
                Sign in
              </Link>
              <Link href="/auth" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-1/5 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 dark:opacity-10" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
            <div className="flex flex-col justify-center">
              <p className="mb-3 inline-flex w-fit rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="mr-1 size-3" /> AI-powered • Multicurrency • Realtime
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Financial clarity,
                <br />
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">finally.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Track income & expenses in IDR, USD, EUR, JPY, SGD — auto-categorized by AI, budgets with alerts, and beautiful charts. All in one command center.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={user ? "/dashboard" : "/auth"} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {user ? "Go to Dashboard" : "Get started free"} <ArrowRight className="size-4" />
                </Link>
                <a href="#demo" className="inline-flex h-11 items-center justify-center rounded-full border bg-card px-8 text-sm font-medium hover:bg-muted">
                  See live demo
                </a>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="size-3 text-emerald-500" /> No credit card</span>
                <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> Private & secure</span>
                <span className="flex items-center gap-1"><Zap className="size-3" /> Realtime alerts</span>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="relative">
              <div className="rounded-2xl border bg-card p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">Spending overview</p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">7d • IDR</span>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <MiniStat label="Balance" value="Rp 12.4M" sub="+ Rp 8.1M income" />
                    <MiniStat label="Expenses" value="Rp 3.2M" sub="This month" />
                    <MiniStat label="Budget" value="68%" sub="Rp 3.2M / 4.7M" />
                  </div>
                  <div className="flex h-32 items-end gap-2 rounded-lg border bg-muted/30 p-3">
                    {[18, 35, 22, 48, 30, 65, 40].map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div className="w-full rounded-t bg-primary" style={{ height: `${h * 1.6}px` }} />
                        <span className="text-[10px] text-muted-foreground">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-xs">Top: Food & Dining • Rp 1.1M</span>
                    <span className="text-xs font-medium text-primary">View all →</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border bg-card p-3 shadow-lg lg:flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Bot className="size-4" /></span>
                <div><p className="text-xs font-semibold">AI categorized</p><p className="text-xs text-muted-foreground">“Starbucks” → Food & Dining 0.97</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
            <Stat icon={<Users className="size-4" />} label="Active users" value={stats.users || 1200} />
            <Stat icon={<Receipt className="size-4" />} label="Transactions tracked" value={stats.expenses || 48000} />
            <Stat icon={<WalletCards className="size-4" />} label="Budgets created" value={stats.budgets || 3200} />
            <Stat icon={<Tags className="size-4" />} label="System categories" value={stats.categories || 24} />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to stay on budget</h2>
            <p className="mt-3 text-sm text-muted-foreground">Multicurrency, AI, charts, and alerts — designed for real life.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<WalletCards className="size-5" />} title="Smart budgets" desc="Monthly & yearly with warning thresholds, per-category or global." />
            <Feature icon={<Tags className="size-5" />} title="Categories" desc="System + custom categories, AI auto-detect with confidence." />
            <Feature icon={<Bell className="size-5" />} title="Real-time alerts" desc="Budget warnings pushed instantly via notification center." />
            <Feature icon={<Globe className="size-5" />} title="Multicurrency" desc="IDR, USD, EUR, JPY, SGD with live rates & conversion." />
            <Feature icon={<Bot className="size-5" />} title="AI Review Queue" desc="Remote ai.finsight.space predictor, retry & feedback loop." />
            <Feature icon={<BarChart3 className="size-5" />} title="Charts & Insights" desc="Spending bars, income vs expense, donut, budget vs spent." />
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">See your money, clearly</h2>
              <p className="mt-3 text-sm text-muted-foreground">Recharts-powered visuals, locale-aware currency, empty states handled.</p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <DemoCard title="Income vs Expense" desc="12 months • IDR">
                <div className="flex h-32 items-end gap-1">
                  {[30, 45, 20, 50, 35, 60, 25, 55, 40, 70, 30, 65].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col gap-1">
                      <div className="rounded-t bg-chart-2" style={{ height: `${h * 0.5}px` }} />
                      <div className="rounded-t bg-chart-1" style={{ height: `${(h * 0.7) }px` }} />
                    </div>
                  ))}
                </div>
              </DemoCard>
              <DemoCard title="By category" desc="Top 6 • 30d">
                <div className="flex h-32 items-center justify-center gap-3">
                  <div className="size-24 rounded-full border-8 border-chart-1 border-r-chart-2 border-b-chart-3 border-l-chart-5" />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-chart-1" /> Food 32%</div>
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-chart-2" /> Transport 21%</div>
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-chart-3" /> Shopping 18%</div>
                  </div>
                </div>
              </DemoCard>
              <DemoCard title="Budget vs Spent" desc="Converted to preferred">
                <div className="space-y-2">
                  {["Food 68%", "Transport 42%", "Shopping 91%"].map((t) => (
                    <div key={t} className="space-y-1">
                      <div className="flex justify-between text-xs"><span>{t.split(" ")[0]}</span><span>{t.split(" ")[1]}</span></div>
                      <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: t.split(" ")[1] }} /></div>
                    </div>
                  ))}
                </div>
              </DemoCard>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step n="1" title="Add transaction" desc="Pick currency, category, merchant. AI suggests if empty." />
            <Step n="2" title="Track budgets" desc="Set monthly/yearly, get WARNING at 80% & EXCEEDED at 100%." />
            <Step n="3" title="Get insights" desc="Charts, CSV export per-currency, notifications & review queue." />
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-card border-y">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-center text-3xl font-bold tracking-tight">Loved by early users</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Quote name="Alya" role="Freelancer • ID" text="Multicurrency saves me — USD client payments vs IDR spending now make sense." />
              <Quote name="Kenji" role="Expat • JP" text="AI categorization is scary accurate. Review queue lets me fix the edge cases." />
              <Quote name="Sofia" role="Student • SG" text="Charts finally tell me where my SGD goes. Budget vs spent is my favorite." />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-8 space-y-3">
            <Faq q="Is my data private?" a="Yes — Supabase RLS, per-user isolation. Admins see aggregates only via requireAdmin()." />
            <Faq q="How does multicurrency work?" a="Live rates via exchangerate-api (hourly cache + fallback). Dashboard & charts convert to your preferred currency." />
            <Faq q="What if AI is offline?" a="Transaction saved as uncategorized with FAILED status, you can retry from Review. Notification explains the error." />
            <Faq q="Can I export?" a="CSV export on Expenses page includes Currency column and per-currency totals — no mixing." />
            <Faq q="Do I need to install anything?" a="No — PWA ready, offline queue for creates, add to home screen." />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to take control?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm opacity-90">Join FinSight — budgets, AI, charts, and alerts in one place. No credit card required.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={user ? "/dashboard" : "/auth"} className="rounded-full bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-card/90">
                {user ? "Go to Dashboard" : "Create account"} <ArrowRight className="ml-2 inline size-4" />
              </Link>
              {!user && (
                <Link href="/auth" className="rounded-full border border-primary-foreground/20 px-8 py-3 text-sm font-medium hover:bg-primary-foreground/10">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-4">
            <div><p className="font-bold">FinSight</p><p className="mt-2 text-xs text-muted-foreground">AI-powered financial solution. Built with Next.js 16, Prisma, Supabase.</p></div>
            <div><p className="text-sm font-semibold">Product</p><div className="mt-3 space-y-2 text-xs text-muted-foreground"><Link href="/dashboard" className="block hover:text-foreground">Dashboard</Link><Link href="/expenses" className="block hover:text-foreground">Expenses</Link><Link href="/budgets" className="block hover:text-foreground">Budgets</Link></div></div>
            <div><p className="text-sm font-semibold">Company</p><div className="mt-3 space-y-2 text-xs text-muted-foreground"><a href="#features" className="block hover:text-foreground">Features</a><a href="#how" className="block hover:text-foreground">How it works</a><a href="#faq" className="block hover:text-foreground">FAQ</a></div></div>
            <div><p className="text-sm font-semibold">Legal</p><p className="mt-3 text-xs text-muted-foreground">© {new Date().getFullYear()} FinSight. All rights reserved.</p></div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
    </div>
  );
}
function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div>
        <p className="text-xl font-bold leading-none">{value.toLocaleString("id-ID")}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
function DemoCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{n}</span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
function Quote({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-5">
      <p className="text-sm leading-6">“{text}”</p>
      <p className="mt-3 text-xs font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{role}</p>
    </div>
  );
}
function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border bg-card p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
        {q} <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}
