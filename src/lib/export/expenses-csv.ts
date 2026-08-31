export type ExpenseCsvRow = {
  id: string;
  title: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  category: string;
  date: Date | string;
  merchant: string | null;
  location: string | null;
  description: string | null;
  receiptUrl: string | null;
  currency?: string | null;
};

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";
  const v = String(value);
  return v.includes(",") || v.includes('"') || v.includes("\n") || v.includes("\r") ? `"${v.replaceAll('"', '""')}"` : v;
}

function formatDate(value: Date | string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function expensesToCsv(expenses: ExpenseCsvRow[]) {
  // Group totals per currency to avoid mixing IDR + USD
  const perCurrency = new Map<string, { income: number; expense: number }>();
  for (const x of expenses) {
    const cur = String(x.currency ?? "IDR");
    const entry = perCurrency.get(cur) ?? { income: 0, expense: 0 };
    if (x.type === "INCOME") entry.income += Number(x.amount);
    else entry.expense += Number(x.amount);
    perCurrency.set(cur, entry);
  }

  const headers = ["Date", "Title", "Type", "Category", "Amount", "Currency", "Merchant", "Location", "Description", "Receipt"];
  const rows = expenses.map((x) => [
    formatDate(x.date),
    x.title,
    x.type === "INCOME" ? "Income" : "Expense",
    x.category,
    x.amount,
    String(x.currency ?? "IDR"),
    x.merchant ?? "",
    x.location ?? "",
    x.description ?? "",
    x.receiptUrl ? "Yes" : "No",
  ]);
  const summary: string[][] = [
    ["FinSight Transaction Export"],
    [],
    ["Total Transactions", String(expenses.length)],
  ];
  for (const [cur, vals] of perCurrency.entries()) {
    summary.push([`Total Income (${cur})`, String(vals.income)]);
    summary.push([`Total Expense (${cur})`, String(vals.expense)]);
    summary.push([`Balance (${cur})`, String(vals.income - vals.expense)]);
  }
  summary.push([]);
  return [
    "\uFEFF",
    ...summary.map((r) => r.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((r) => r.map(escapeCsvValue).join(",")),
  ].join("\n");
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
