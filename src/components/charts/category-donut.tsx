/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format/currency";
import type { Currency } from "@/stores/locale-store";

type Props = { data: { name: string; value: number; fill: string }[]; currency: Currency; locale: string };

export function CategoryDonut({ data, currency, locale }: Props) {
  if (data.length === 0) return <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No category spending</div>;
  const config = Object.fromEntries(data.map((d) => [d.name, { label: d.name, color: d.fill }]));
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => formatCurrency(Number(v), currency, locale)} nameKey="name" />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
