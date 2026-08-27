"use client";

import { useTransition } from "react";
import { deleteExpenseAsAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Expense = {
  id: string;
  title: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  expenseDate: Date;
  user: { email: string; name: string | null };
  category: { name: string; icon: string | null } | null;
};

export function AdminExpenses({ expenses }: { expenses: Expense[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">All transactions</caption>
        <thead className="border-b text-left text-muted-foreground">
          <tr>
            <th scope="col" className="p-3 font-medium">Transaction</th>
            <th scope="col" className="p-3 font-medium">User</th>
            <th scope="col" className="p-3 font-medium">Date</th>
            <th scope="col" className="p-3 font-medium">Amount</th>
            <th scope="col" className="p-3" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b last:border-0">
              <td className="p-3">
                <span className="font-semibold">
                  {expense.category?.icon} {expense.title}
                </span>
                <p className="text-xs text-muted-foreground">{expense.category?.name ?? "Uncategorized"}</p>
              </td>
              <td className="p-3">{expense.user.email}</td>
              <td className="p-3">{new Date(expense.expenseDate).toLocaleDateString("id-ID")}</td>
              <td className={expense.type === "INCOME" ? "p-3 font-medium text-emerald-600" : "p-3 font-medium"}>
                {expense.type === "INCOME" ? "+" : "-"}
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
                  expense.amount,
                )}
              </td>
              <td className="p-3 text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" disabled={pending} className="text-destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete “{expense.title}” by {expense.user.email}. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => startTransition(() => void deleteExpenseAsAdmin(expense.id))}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
