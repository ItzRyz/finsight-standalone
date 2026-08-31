import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminExpenses } from "@/components/admin/admin-expenses";

export default async function AdminExpensesPage() {
  await requireAdmin();
  const expenses = await prisma.expense.findMany({ take: 100, include: { user: { select: { email: true, name: true } }, category: { select: { name: true, icon: true } } }, orderBy: { createdAt: "desc" } });
  return <main className="flex flex-1 flex-col gap-6 p-6"><div><h1 className="text-2xl font-bold tracking-tight">Expenses</h1><p className="text-sm text-muted-foreground">Most recent 100 transactions across all users.</p></div><AdminExpenses expenses={expenses.map((expense) => ({ ...expense, amount: Number(expense.amount), currency: (expense as unknown as { currency: string }).currency ?? "IDR" }))} /></main>;
}
