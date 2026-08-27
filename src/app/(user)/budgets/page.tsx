import { getBudgets } from "@/actions/budgets";
import { getAvailableCategories } from "@/lib/data/categories";

import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { BudgetList } from "@/components/budgets/budget-list";
import { UserHeader } from "@/components/user/user-header";

export default async function BudgetsPage() {
  const [budgets, categories] = await Promise.all([
    getBudgets(),
    getAvailableCategories(),
  ]);

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
          <SummaryCard
            label="Total budget"
            value={formatIDR(
              budgets.reduce(
                (total, budget) => total + Number(budget.amount),
                0,
              ),
            )}
          />
          <SummaryCard
            label="Total spent"
            value={formatIDR(
              budgets.reduce((total, budget) => total + budget.spent, 0),
            )}
          />
          <SummaryCard
            label="Remaining"
            value={formatIDR(
              budgets.reduce((total, budget) => total + budget.remaining, 0),
            )}
          />
        </section>

        {/* Budget List */}

        <BudgetList budgets={budgets} categories={categories} />
      </main>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
