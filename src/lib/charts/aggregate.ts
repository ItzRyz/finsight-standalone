import { prisma } from "@/lib/prisma";
import { convertCurrency } from "@/lib/format/currency";
import { getRates } from "@/lib/currency/rates";
import type { Currency } from "@/stores/locale-store";

export type ChartRange = "7d" | "30d" | "12m";

export type DailyPoint = { label: string; value: number; date: string };
export type MonthlyPoint = { label: string; income: number; expense: number; balance: number; date: string };
export type CategoryPoint = { name: string; value: number; fill: string; icon?: string | null };

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export async function getSpendingChartData(userId: string, preferredCurrency: Currency, range: ChartRange = "7d") {
  const rates = await getRates(preferredCurrency);
  const toPref = (amt: number, from: string) => convertCurrency(amt, (from as Currency) ?? preferredCurrency, preferredCurrency, rates as never);
  const now = new Date();
  if (range === "12m") {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const expenses = await prisma.expense.findMany({
      where: { userId, type: "EXPENSE", expenseDate: { gte: start } },
      select: { amount: true, currency: true, expenseDate: true },
    });
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const value = expenses
        .filter((e) => e.expenseDate.getFullYear() === d.getFullYear() && e.expenseDate.getMonth() === d.getMonth())
        .reduce((s, e) => s + toPref(Number(e.amount), String((e as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
      return { label, value, date: d.toISOString().slice(0, 7) };
    });
  }
  const days = range === "30d" ? 30 : 7;
  const start = new Date(now); start.setDate(now.getDate() - days + 1); start.setHours(0, 0, 0, 0);
  const expenses = await prisma.expense.findMany({
    where: { userId, type: "EXPENSE", expenseDate: { gte: start } },
    select: { amount: true, currency: true, expenseDate: true },
  });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = d.toDateString();
    const value = expenses.filter((e) => e.expenseDate.toDateString() === key).reduce((s, e) => s + toPref(Number(e.amount), String((e as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, value, date: d.toISOString().slice(0, 10) };
  });
}

export async function getIncomeExpenseTrend(userId: string, preferredCurrency: Currency): Promise<MonthlyPoint[]> {
  const rates = await getRates(preferredCurrency);
  const toPref = (amt: number, from: string) => convertCurrency(amt, (from as Currency) ?? preferredCurrency, preferredCurrency, rates as never);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const expenses = await prisma.expense.findMany({ where: { userId, expenseDate: { gte: start } }, select: { amount: true, currency: true, type: true, expenseDate: true } });
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const monthItems = expenses.filter((e) => e.expenseDate.getFullYear() === d.getFullYear() && e.expenseDate.getMonth() === d.getMonth());
    const income = monthItems.filter((e) => e.type === "INCOME").reduce((s, e) => s + toPref(Number(e.amount), String((e as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
    const expense = monthItems.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + toPref(Number(e.amount), String((e as unknown as { currency: string }).currency ?? preferredCurrency)), 0);
    return { label, income, expense, balance: income - expense, date: d.toISOString().slice(0, 7) };
  });
}

export async function getCategoryBreakdown(userId: string, preferredCurrency: Currency, range: ChartRange = "30d"): Promise<CategoryPoint[]> {
  const rates = await getRates(preferredCurrency);
  const toPref = (amt: number, from: string) => convertCurrency(amt, (from as Currency) ?? preferredCurrency, preferredCurrency, rates as never);
  const now = new Date();
  const start = range === "7d" ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) : range === "12m" ? new Date(now.getFullYear(), now.getMonth() - 11, 1) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  const expenses = await prisma.expense.findMany({ where: { userId, type: "EXPENSE", expenseDate: { gte: start } }, select: { amount: true, currency: true, category: { select: { name: true, icon: true, color: true } } } });
  const map = new Map<string, { value: number; icon?: string | null; color?: string | null }>();
  for (const e of expenses) {
    const key = e.category?.name ?? "Uncategorized";
    const cur = String((e as unknown as { currency: string }).currency ?? preferredCurrency);
    const val = toPref(Number(e.amount), cur);
    const prev = map.get(key) ?? { value: 0, icon: e.category?.icon ?? "💰", color: e.category?.color ?? null };
    prev.value += val;
    map.set(key, prev);
  }
  return Array.from(map.entries())
    .map(([name, v], i) => ({ name, value: v.value, fill: v.color ?? CHART_COLORS[i % CHART_COLORS.length], icon: v.icon }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export async function getBudgetUtilization(userId: string, preferredCurrency: Currency) {
  const budgets = await prisma.budget.findMany({ where: { userId, isActive: true }, include: { category: true } });
  const rates = await getRates(preferredCurrency);
  const toPref = (amt: number, from: string) => convertCurrency(amt, (from as Currency) ?? preferredCurrency, preferredCurrency, rates as never);
  const data: { name: string; spent: number; budget: number; percentage: number; fill: string }[] = [];
  for (const b of budgets.slice(0, 6)) {
    const cur = String((b as unknown as { currency: string }).currency ?? preferredCurrency);
    const spentAgg = await prisma.expense.aggregate({
      where: { userId, type: "EXPENSE", currency: cur as never, expenseDate: { gte: b.periodStart, lte: b.periodEnd }, ...(b.categoryId ? { categoryId: b.categoryId } : {}) }, _sum: { amount: true },
    });
    const spent = Number((spentAgg._sum as unknown as { amount: unknown })?.amount ?? 0);
    const budget = Number(b.amount);
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    // keep in budget currency for bar, but also provide converted for tooltip if needed
    data.push({ name: b.name ?? b.category?.name ?? "General", spent: toPref(spent, cur), budget: toPref(budget, cur), percentage: pct, fill: CHART_COLORS[data.length % CHART_COLORS.length] });
  }
  return data;
}
