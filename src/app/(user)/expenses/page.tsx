import { getExpenses } from "@/actions/expenses";
import { getAvailableCategories } from "@/lib/data/categories";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getRates } from "@/lib/currency/rates";

import { UserHeader } from "@/components/user/user-header";
import { ExpenseList } from "@/components/expenses/expense-list";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { ExpenseTrend } from "@/components/charts/expense-trend";

export default async function ExpensesPage() {
  const [{ dbUser }, expenses, categories] = await Promise.all([
    getCurrentUser(),
    getExpenses(),
    getAvailableCategories(),
  ]);
  const preferredCurrency = (dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR";
  const locale = (dbUser.locale as string) ?? "id";
  const rates = await getRates(preferredCurrency);

  return (
    <>
      <UserHeader title="Expenses" />
      <main className="flex flex-1 flex-col gap-6 bg-background p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>

            <p className="text-sm text-muted-foreground">
              Track and manage your income and expenses.
            </p>
          </div>

          <AddExpenseDialog categories={categories} />
        </div>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Expense trend</h2>
          <p className="text-sm text-muted-foreground">Daily expense vs income — toggle 7d / 30d, values in {preferredCurrency}.</p>
          <div className="mt-4">
            <ExpenseTrend expenses={expenses as never} currency={preferredCurrency} locale={locale} rates={rates as never} />
          </div>
        </section>

        <ExpenseList expenses={expenses} categories={categories} />
      </main>
    </>
  );
}
