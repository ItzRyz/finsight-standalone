import { BudgetCard } from "./budget-card";

type Budget = {
  id: string;

  name: string | null;

  amount: unknown;

  warningThreshold: unknown;

  period: "MONTHLY" | "YEARLY";

  periodStart: Date;
  periodEnd: Date;

  spent: number;
  percentage: number;
  remaining: number;

  status: "SAFE" | "WARNING" | "EXCEEDED";

  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
};

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
};

type Props = {
  budgets: Budget[];
  categories: Category[];
};

export function BudgetList({ budgets, categories }: Props) {
  if (budgets.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-xl border bg-card">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-xl">
            💰
          </div>

          <h2 className="font-semibold">Belum ada budget</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Buat budget pertama untuk mulai mengontrol pengeluaranmu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard key={budget.id} budget={budget} categories={categories} />
      ))}
    </div>
  );
}
