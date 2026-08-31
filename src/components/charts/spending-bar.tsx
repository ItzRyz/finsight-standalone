/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import type { Currency } from "@/stores/locale-store";

type Props = { data: { label: string; value: number }[]; currency: Currency; locale: string };

export function SpendingBar({ data, currency, locale }: Props) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No spending data yet</div>;
  }
  return (
    <ChartContainer config={{ value: { label: "Spent", color: "var(--chart-1)" } }} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} interval={data.length > 14 ? 3 : 0} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v, currency, locale)} width={80} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          content={<ChartTooltipContent formatter={(value: any) => formatCurrency(Number(value), currency, locale)} />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
