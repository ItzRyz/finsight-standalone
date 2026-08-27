import { getExpenses } from "@/actions/expenses";
import { getAvailableCategories } from "@/lib/data/categories";

import { UserHeader } from "@/components/user/user-header";
import { ExpenseList } from "@/components/expenses/expense-list";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";

export default async function ExpensesPage() {
  const [expenses, categories] = await Promise.all([
    getExpenses(),
    getAvailableCategories(),
  ]);

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

        <ExpenseList expenses={expenses} categories={categories} />
      </main>
    </>
  );
}
