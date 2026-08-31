/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Bar, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import type { Currency } from "@/stores/locale-store";

type ExpenseForChart = { amount: number; currency?: string; type: "EXPENSE" | "INCOME"; expenseDate: Date; category?: { name: string } | null };

type Props = { expenses: ExpenseForChart[]; currency: Currency; locale: string; rates: Record<string, Record<string, number>> };

function toPref(amount: number, from: string, pref: Currency, rates: Record<string, Record<string, number>>) {
  if (from === pref) return amount;
  const r = rates[from]?.[pref];
  return r ? amount * r : amount;
}

export function ExpenseTrend({ expenses, currency, locale, rates }: Props) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const data = useMemo(() => {
    const days = range === "30d" ? 30 : 7;
    const start = new Date(); start.setDate(start.getDate() - days + 1); start.setHours(0, 0, 0, 0);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = d.toDateString();
      const dayItems = expenses.filter((e) => new Date(e.expenseDate).toDateString() === key);
      const expense = dayItems.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + toPref(Number(e.amount), String(e.currency ?? currency), currency, rates), 0);
      const income = dayItems.filter((e) => e.type === "INCOME").reduce((s, e) => s + toPref(Number(e.amount), String(e.currency ?? currency), currency, rates), 0);
      return { label: d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric" }), expense, income };
    });
  }, [expenses, currency, locale, rates, range]);

  if (expenses.length === 0) return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No transactions to chart</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {(["7d", "30d"] as const).map((r) => (
          <button key={r} onClick={() => setRange(r)} className={r === range ? "rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground" : "rounded-md border px-2.5 py-1 text-xs"}>{r}</button>
        ))}
      </div>
      <ChartContainer config={{ expense: { label: "Expense", color: "var(--chart-1)" }, income: { label: "Income", color: "var(--chart-2)" } }} className="h-64 w-full">
        <ComposedChart data={data} margin={{ left: 8, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={range === "30d" ? 4 : 0} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, currency, locale)} width={80} />
          <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => formatCurrency(Number(v), currency, locale)} />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
          <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
