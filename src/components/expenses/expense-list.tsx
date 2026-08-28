"use client";

import { useMemo, useState } from "react";
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog";
import { Input } from "@/components/ui/input";
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import { ExportCsvButton } from "@/components/expenses/export-csv-button";
import type { ExpenseCsvRow } from "@/lib/export/expenses-csv";
import { useLocaleStore } from "@/stores/locale-store";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { Button } from "@/components/ui/button";

type ExpenseWithCategory = {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency?: string;
  type: "EXPENSE" | "INCOME";
  expenseDate: Date;
  merchant: string | null;
  location: string | null;
  categorizationSource: "MANUAL" | "AI";
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
};

type ExpenseListProps = {
  expenses: ExpenseWithCategory[];
  categories: { id: string; name: string; icon: string | null }[];
};

export function ExpenseList({ expenses, categories }: ExpenseListProps) {
  const { locale, currency: pref } = useLocaleStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filteredExpenses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return expenses.filter(
      (expense) =>
        (type === "ALL" || expense.type === type) &&
        (categoryId === "ALL" || expense.categoryId === categoryId) &&
        (!fromDate || new Date(expense.expenseDate) >= new Date(`${fromDate}T00:00:00`)) &&
        (!toDate || new Date(expense.expenseDate) <= new Date(`${toDate}T23:59:59.999`)) &&
        (!normalized ||
          [expense.title, expense.description, expense.merchant, expense.category?.name]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalized))),
    );
  }, [expenses, query, type, categoryId, fromDate, toDate]);

  const csvRows: ExpenseCsvRow[] = useMemo(
    () =>
      filteredExpenses.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        type: e.type,
        category: e.category?.name ?? "Uncategorized",
        date: e.expenseDate,
        merchant: e.merchant,
        location: e.location,
        description: e.description,
        receiptUrl: e.receiptUrl,
      })),
    [filteredExpenses],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (expenses.length === 0) {
    return (
      <div className="flex min-h-75 items-center justify-center rounded-xl border bg-card">
        <div className="text-center">
          <h2 className="font-semibold">No transactions yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add your first transaction to start tracking your finances.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          placeholder="Search title, merchant, or category..."
          aria-label="Search expenses"
          className="max-w-md bg-card"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as typeof type);
            setPage(1);
          }}
          className="h-8 rounded-lg border bg-card px-2 text-sm"
          aria-label="Filter by type"
        >
          <option value="ALL">All types</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          className="h-8 rounded-lg border bg-card px-2 text-sm"
          aria-label="Filter by category"
        >
          <option value="ALL">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={fromDate}
          aria-label="From date"
          className="w-auto bg-card"
          onChange={(event) => {
            setFromDate(event.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          value={toDate}
          aria-label="To date"
          className="w-auto bg-card"
          onChange={(event) => {
            setToDate(event.target.value);
            setPage(1);
          }}
        />
        <div className="ml-auto">
          <ExportCsvButton expenses={csvRows} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="divide-y">
          {pageItems.map((expense) => {
            const isIncome = expense.type === "INCOME";
            return (
              <div key={expense.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                    {expense.category?.icon ?? "💰"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{expense.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{expense.category?.name ?? "Uncategorized"}</span>
                      {expense.merchant && (
                        <>
                          <span>•</span>
                          <span>{expense.merchant}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className={isIncome ? "font-semibold text-emerald-600" : "font-semibold text-foreground"}>
                      {isIncome ? "+" : "-"}
                      {formatCurrency(expense.amount, (expense.currency as never) ?? pref, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.expenseDate, locale)}
                    </p>
                    {expense.receiptUrl && (
                      <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline">
                        receipt
                      </a>
                    )}
                  </div>
                  <EditExpenseDialog expense={expense} categories={categories} />
                  <DeleteExpenseDialog expenseId={expense.id} title={expense.title} />
                </div>
              </div>
            );
          })}
        </div>
        {filteredExpenses.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No matching transactions.</p>
        )}
      </div>

      {filteredExpenses.length > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


