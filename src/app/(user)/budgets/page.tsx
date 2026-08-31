import { getBudgets } from "@/actions/budgets";
import { getAvailableCategories } from "@/lib/data/categories";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getRates } from "@/lib/currency/rates";
import { convertCurrency, formatCurrency } from "@/lib/format/currency";

import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { BudgetList } from "@/components/budgets/budget-list";
import { UserHeader } from "@/components/user/user-header";

export default async function BudgetsPage() {
  const [{ dbUser }, budgets, categories] = await Promise.all([
    getCurrentUser(),
    getBudgets(),
    getAvailableCategories(),
  ]);

  const preferredCurrency = (dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR";
  const locale = (dbUser.locale as string) ?? "id";
  const rates = await getRates(preferredCurrency);

  const toPreferred = (amount: number, cur: string) =>
    convertCurrency(amount, (cur as never) ?? preferredCurrency, preferredCurrency, rates as never);

  const totalBudget = budgets.reduce((sum, b) => sum + toPreferred(Number(b.amount), String((b as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + toPreferred(b.spent, String((b as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + toPreferred(b.remaining, String((b as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
  const fmt = (v: number) => formatCurrency(v, preferredCurrency, locale);

  // If budgets are mixed currencies, also build per-currency breakdown for accessibility title
  const breakdown = (() => {
    const m = new Map<string, number>();
    budgets.forEach((b) => {
      const cur = String((b as unknown as { currency: string }).currency ?? preferredCurrency);
      m.set(cur, (m.get(cur) ?? 0) + Number(b.amount));
    });
    if (m.size <= 1) return null;
    return Array.from(m.entries())
      .map(([cur, amt]) => formatCurrency(amt, cur as never, locale))
      .join(" + ");
  })();

  return (
    <>
      <UserHeader title="Budgets" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>

            <p className="text-sm text-muted-foreground">
              Kelola budget dan pantau pengeluaranmu.
            </p>
          </div>

          <AddBudgetDialog categories={categories} />
        </div>

        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Budget summary"
        >
          <SummaryCard label="Total budget" value={fmt(totalBudget)} sub={breakdown} />
          <SummaryCard label="Total spent" value={fmt(totalSpent)} />
          <SummaryCard label="Remaining" value={fmt(totalRemaining)} />
        </section>

        {/* Budget List */}

        <BudgetList budgets={budgets} categories={categories} />
      </main>
    </>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
