import { ArrowDownRight, ArrowUpRight, PiggyBank, WalletCards } from "lucide-react";
import { UserHeader } from "@/components/user/user-header";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatCurrency, convertCurrency } from "@/lib/format/currency";
import { getRates } from "@/lib/currency/rates";
import { formatDate } from "@/lib/format/date";
import { SpendingBar } from "@/components/charts/spending-bar";
import { IncomeExpenseArea } from "@/components/charts/income-expense-area";
import { CategoryDonut } from "@/components/charts/category-donut";
import { BudgetRadial } from "@/components/charts/budget-radial";
import { getSpendingChartData, getIncomeExpenseTrend, getCategoryBreakdown, getBudgetUtilization } from "@/lib/charts/aggregate";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = (params.range === "30d" || params.range === "12m" ? params.range : "7d") as "7d" | "30d" | "12m";
  const { authUser, dbUser } = await getCurrentUser();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const preferredCurrency = (dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR";
  const locale = (dbUser.locale as string) ?? "id";
  const rates = await getRates(preferredCurrency);

  const toPreferred = (amount: number, from: string) =>
    convertCurrency(amount, (from as never) ?? preferredCurrency, preferredCurrency, rates as never);

  const [allExpenses, monthlyExpensesRaw, budgets, recentExpenses, spendingData, trendData, categoryData, budgetUtil] = await Promise.all([
    prisma.expense.findMany({ where: { userId: dbUser.id }, select: { amount: true, currency: true, type: true } }),
    prisma.expense.findMany({
      where: { userId: dbUser.id, expenseDate: { gte: monthStart, lte: monthEnd } },
      select: { amount: true, currency: true, type: true },
    }),
    prisma.budget.findMany({
      where: { userId: dbUser.id, isActive: true, periodStart: { lte: now }, periodEnd: { gte: now } },
      select: { amount: true, currency: true },
    }),
    prisma.expense.findMany({
      where: { userId: dbUser.id },
      take: 6,
      include: { category: { select: { name: true, icon: true } } },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    }),
    getSpendingChartData(dbUser.id, preferredCurrency, range),
    getIncomeExpenseTrend(dbUser.id, preferredCurrency),
    getCategoryBreakdown(dbUser.id, preferredCurrency, range === "12m" ? "12m" : "30d"),
    getBudgetUtilization(dbUser.id, preferredCurrency),
  ]);

  const sumConverted = (items: { amount: unknown; currency: unknown; type?: string }[], type?: "EXPENSE" | "INCOME") =>
    items
      .filter((r) => !type || (r as { type: string }).type === type)
      .reduce((sum, r) => sum + toPreferred(Number(r.amount), String(r.currency ?? preferredCurrency)), 0);

  const income = sumConverted(allExpenses, "INCOME");
  const expenses = sumConverted(allExpenses, "EXPENSE");
  const monthlyIncome = sumConverted(monthlyExpensesRaw, "INCOME");
  const monthlyExpense = sumConverted(monthlyExpensesRaw, "EXPENSE");
  const budgetTotal = budgets.reduce(
    (sum, b) => sum + toPreferred(Number(b.amount), String((b as unknown as { currency: string }).currency ?? preferredCurrency)),
    0,
  );
  const budgetUsed = budgetTotal ? Math.min((monthlyExpense / budgetTotal) * 100, 100) : 0;

  const fmt = (v: number) => formatCurrency(v, preferredCurrency, locale);

  return (
    <>
      <UserHeader title="Dashboard" />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back{dbUser.name ? `, ${dbUser.name}` : ""} 👋</h1>
          <p className="text-sm text-muted-foreground">{authUser.email} · Here&apos;s your financial overview.</p>
        </div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<WalletCards />} title="Total balance" value={fmt(income - expenses)} detail={`${fmt(income)} income`} />
          <StatCard icon={<ArrowDownRight />} title="Monthly expenses" value={fmt(monthlyExpense)} detail={`${fmt(monthlyIncome)} income this month`} />
          <StatCard
            icon={<PiggyBank />}
            title="Budget used"
            value={budgetTotal ? `${budgetUsed.toFixed(0)}%` : "No budget"}
            detail={budgetTotal ? `${fmt(monthlyExpense)} of ${fmt(budgetTotal)}` : "Create a budget to track this"}
          />
          <StatCard icon={<ArrowUpRight />} title="Savings" value={fmt(monthlyIncome - monthlyExpense)} detail="This month" />
        </section>
        <section className="grid gap-4 lg:grid-cols-7">
          <div className="rounded-xl border bg-card p-6 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Spending overview</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your expenses for the last {range === "12m" ? "12 months" : range === "30d" ? "30 days" : "seven days"}.</p>
              </div>
              <div className="flex gap-1">
                {(["7d", "30d", "12m"] as const).map((r) => (
                  <Link key={r} href={`/dashboard?range=${r}`} className={r === range ? "rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground" : "rounded-md border px-2.5 py-1 text-xs"}>{r}</Link>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <SpendingBar data={spendingData} currency={preferredCurrency} locale={locale} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 lg:col-span-3">
            <h2 className="font-semibold">Recent transactions</h2>
            <div className="mt-4 divide-y">
              {recentExpenses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-sm">{expense.category?.icon ?? "💰"}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">{expense.category?.name ?? "Uncategorized"} · {formatDate(expense.expenseDate, locale)}</p>
                      </div>
                    </div>
                    <span className={expense.type === "INCOME" ? "shrink-0 text-sm font-semibold text-emerald-600" : "shrink-0 text-sm font-semibold"}>
                      {expense.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(expense.amount), (expense.currency as never) ?? preferredCurrency, locale)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold">Income vs Expense (12 months)</h2>
            <p className="mt-1 text-sm text-muted-foreground">Monthly flow in {preferredCurrency}.</p>
            <div className="mt-4">
              <IncomeExpenseArea data={trendData} currency={preferredCurrency} locale={locale} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold">Spending by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Top categories for {range === "12m" ? "12 months" : "30 days"}.</p>
            <div className="mt-4">
              <CategoryDonut data={categoryData} currency={preferredCurrency} locale={locale} />
            </div>
            {categoryData.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 min-w-0">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: c.fill }} />
                    <span className="truncate" title={`${c.name} · ${fmt(c.value)}`}>
                      {c.icon} {c.name} · {fmt(c.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Budget utilization</h2>
          <p className="mt-1 text-sm text-muted-foreground">Active budgets — spent vs budget.</p>
          <div className="mt-4">
            <BudgetRadial data={budgetUtil} currency={preferredCurrency} locale={locale} />
          </div>
        </section>
      </main>
    </>
  );
}

function StatCard({ icon, title, value, detail }: { icon: React.ReactNode; title: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 min-w-0">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm truncate">{title}</p>
        <span className="[&_svg]:size-4 shrink-0">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight truncate" title={value}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground truncate" title={detail}>{detail}</p>
    </div>
  );
}
