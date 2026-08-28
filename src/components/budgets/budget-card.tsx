"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { BudgetActions } from "@/components/budgets/budget-actions";
import { useLocaleStore } from "@/stores/locale-store";
import { formatCurrency } from "@/lib/format/currency";

type Budget = {
  id: string;

  name: string | null;

  amount: unknown;
  currency?: string;

  warningThreshold: unknown;

  period: "MONTHLY" | "YEARLY";

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
  budget: Budget;
  categories: Category[];
};

export function BudgetCard({ budget, categories }: Props) {
  const amount = Number(budget.amount);
  const { locale, currency: prefCurrency } = useLocaleStore();
  const currency = (budget.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? prefCurrency;
  const progress = Math.min(budget.percentage, 100);

  const title = budget.name ?? budget.category?.name ?? "General Budget";

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {/* Header */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            {budget.category?.icon ?? "💰"}
          </div>

          <div>
            <h3 className="font-semibold">{title}</h3>

            <p className="text-xs text-muted-foreground">
              {budget.period === "MONTHLY" ? "Monthly" : "Yearly"}
            </p>
          </div>
        </div>

        <BudgetStatus status={budget.status} />
      </div>

      {/* Amount */}

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Spent</p>

          <p className="text-xl font-bold">{formatCurrency(budget.spent, currency, locale)}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-foreground">Budget</p>

          <p className="font-medium">{formatCurrency(amount, currency, locale)}</p>
        </div>
      </div>

      {/* Progress */}

      <Progress value={progress} className="mt-4" />

      {/* Footer */}

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{budget.percentage.toFixed(0)}%</span>

        <span>
          {budget.remaining > 0
            ? `${formatCurrency(budget.remaining, currency, locale)} remaining`
            : "Budget exceeded"}
        </span>
      </div>
      <div className="mt-3">
        <Link href={`/budgets/alerts?budgetId=${budget.id}`} className="text-xs text-primary hover:underline">
          View alerts →
        </Link>
      </div>
      <BudgetActions
        id={budget.id}
        name={budget.name}
        amount={amount}
        warningThreshold={Number(budget.warningThreshold)}
        categoryId={budget.category?.id ?? null}
        period={budget.period}
        categories={categories}
      />
    </div>
  );
}

function BudgetStatus({ status }: { status: "SAFE" | "WARNING" | "EXCEEDED" }) {
  if (status === "SAFE") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="size-3" />
        Safe
      </div>
    );
  }

  if (status === "WARNING") {
    return (
      <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600">
        <AlertTriangle className="size-3" />
        Warning
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
      <CircleAlert className="size-3" />
      Exceeded
    </div>
  );
}


