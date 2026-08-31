/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Currency } from "@/stores/locale-store";

type Props = { data: { label: string; income: number; expense: number }[]; currency: Currency; locale: string };

export function IncomeExpenseArea({ data, currency, locale }: Props) {
  const isMobile = useIsMobile();
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No income/expense trend yet</div>;
  }
  return (
    <ChartContainer config={{ income: { label: "Income", color: "var(--chart-2)" }, expense: { label: "Expense", color: "var(--chart-1)" } }} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, currency, locale)} width={isMobile ? 78 : 88} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => formatCurrency(Number(v), currency, locale)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="income" stroke="var(--color-income)" fill="var(--color-income)" fillOpacity={0.2} strokeWidth={2} />
        <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" fill="var(--color-expense)" fillOpacity={0.2} strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
