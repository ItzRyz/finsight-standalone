/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Currency } from "@/stores/locale-store";

type Props = { data: { name: string; spent: number; budget: number; percentage: number }[]; currency: Currency; locale: string };

export function BudgetRadial({ data, currency, locale }: Props) {
  const isMobile = useIsMobile();
  if (data.length === 0) return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No active budgets</div>;
  return (
    <ChartContainer config={{ spent: { label: "Spent", color: "var(--chart-1)" }, budget: { label: "Budget", color: "var(--chart-2)" } }} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: isMobile ? 8 : 24, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, currency, locale)} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={isMobile ? 70 : 90} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => formatCurrency(Number(v), currency, locale)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={[0, 6, 6, 0]} />
        <Bar dataKey="spent" fill="var(--color-spent)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
