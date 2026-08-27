import { ArrowDownRight, ArrowUpRight, PiggyBank, WalletCards } from "lucide-react";
import { UserHeader } from "@/components/user/user-header";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { authUser, dbUser } = await getCurrentUser();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [allTotals, monthlyTotals, budgets, recentExpenses, monthlyExpenses] = await Promise.all([
    prisma.expense.groupBy({ where: { userId: dbUser.id }, by: ["type"], _sum: { amount: true } }),
    prisma.expense.groupBy({ where: { userId: dbUser.id, expenseDate: { gte: monthStart, lte: monthEnd } }, by: ["type"], _sum: { amount: true } }),
    prisma.budget.findMany({ where: { userId: dbUser.id, isActive: true, periodStart: { lte: now }, periodEnd: { gte: now } }, select: { amount: true } }),
    prisma.expense.findMany({ where: { userId: dbUser.id }, take: 6, include: { category: { select: { name: true, icon: true } } }, orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }] }),
    prisma.expense.findMany({ where: { userId: dbUser.id, type: "EXPENSE", expenseDate: { gte: monthStart, lte: monthEnd } }, select: { amount: true, expenseDate: true } }),
  ]);

  const total = (rows: typeof allTotals, type: "EXPENSE" | "INCOME") => Number(rows.find((row) => row.type === type)?._sum.amount ?? 0);
  const income = total(allTotals, "INCOME");
  const expenses = total(allTotals, "EXPENSE");
  const monthlyIncome = total(monthlyTotals, "INCOME");
  const monthlyExpense = total(monthlyTotals, "EXPENSE");
  const budgetTotal = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const budgetUsed = budgetTotal ? Math.min((monthlyExpense / budgetTotal) * 100, 100) : 0;

  const dailySpending = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + offset);
    const value = monthlyExpenses.filter((expense) => expense.expenseDate.toDateString() === date.toDateString()).reduce((sum, expense) => sum + Number(expense.amount), 0);
    return { label: date.toLocaleDateString("id-ID", { weekday: "short" }), value };
  });
  const peak = Math.max(...dailySpending.map((point) => point.value), 1);

  return <><UserHeader title="Dashboard" /><main className="flex flex-1 flex-col gap-6 p-6"><div><h1 className="text-2xl font-bold tracking-tight">Welcome back{dbUser.name ? `, ${dbUser.name}` : ""} 👋</h1><p className="text-sm text-muted-foreground">{authUser.email} · Here&apos;s your financial overview.</p></div><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard icon={<WalletCards />} title="Total balance" value={formatIDR(income - expenses)} detail={`${formatIDR(income)} income`} /><StatCard icon={<ArrowDownRight />} title="Monthly expenses" value={formatIDR(monthlyExpense)} detail={`${formatIDR(monthlyIncome)} income this month`} /><StatCard icon={<PiggyBank />} title="Budget used" value={budgetTotal ? `${budgetUsed.toFixed(0)}%` : "No budget"} detail={budgetTotal ? `${formatIDR(monthlyExpense)} of ${formatIDR(budgetTotal)}` : "Create a budget to track this"} /><StatCard icon={<ArrowUpRight />} title="Savings" value={formatIDR(monthlyIncome - monthlyExpense)} detail="This month" /></section><section className="grid gap-4 lg:grid-cols-7"><div className="rounded-xl border bg-card p-6 lg:col-span-4"><h2 className="font-semibold">Spending overview</h2><p className="mt-1 text-sm text-muted-foreground">Your expenses for the last seven days.</p><div className="mt-8 flex h-48 items-end gap-3">{dailySpending.map((point) => <div key={point.label} className="flex flex-1 flex-col items-center gap-2"><div title={formatIDR(point.value)} className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max((point.value / peak) * 100, 3)}%` }} /><span className="text-xs text-muted-foreground">{point.label}</span></div>)}</div></div><div className="rounded-xl border bg-card p-6 lg:col-span-3"><h2 className="font-semibold">Recent transactions</h2><div className="mt-4 divide-y">{recentExpenses.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p> : recentExpenses.map((expense) => <div key={expense.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{expense.category?.icon ?? "💰"} {expense.title}</p><p className="text-xs text-muted-foreground">{expense.category?.name ?? "Uncategorized"} · {expense.expenseDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p></div><p className={expense.type === "INCOME" ? "font-medium text-emerald-600" : "font-medium"}>{expense.type === "INCOME" ? "+" : "-"}{formatIDR(Number(expense.amount))}</p></div>)}</div></div></section></main></>;
}

function StatCard({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) { return <div className="rounded-xl border bg-card p-5"><div className="flex items-center justify-between text-muted-foreground"><p className="text-sm">{title}</p><span className="[&_svg]:size-4">{icon}</span></div><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>; }
function formatIDR(value: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value); }
