/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Currency } from "@/stores/locale-store";

type Props = { data: { name: string; spent: number; budget: number }[]; currency: Currency; locale: string };

export function BudgetVsSpent({ data, currency, locale }: Props) {
  const isMobile = useIsMobile();
  if (!data.length) return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Create a budget to see chart</div>;
  return (
    <ChartContainer config={{ spent: { label: "Spent", color: "var(--chart-1)" }, budget: { label: "Budget", color: "var(--chart-5)" } }} className="h-72 w-full">
      <BarChart data={data} margin={{ left: 12, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={0} angle={isMobile ? -20 : -15} dy={10} height={40} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, currency, locale)} width={isMobile ? 84 : 92} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => formatCurrency(Number(v), currency, locale)} />} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="spent" fill="var(--color-spent)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
