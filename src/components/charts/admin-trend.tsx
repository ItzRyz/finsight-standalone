"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type Point = { label: string; value: number };

export function AdminExpenseVolume({ data }: { data: Point[] }) {
  if (data.every((d) => d.value === 0)) return <div className="flex h-44 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No expense volume</div>;
  return (
    <ChartContainer config={{ value: { label: "Volume", color: "var(--chart-1)" } }} className="h-44 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v: number) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(v as number)} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function AdminNotificationsTrend({ data }: { data: Point[] }) {
  if (data.every((d) => d.value === 0)) return <div className="flex h-44 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No notifications</div>;
  return (
    <ChartContainer config={{ value: { label: "Notifications", color: "var(--chart-2)" } }} className="h-44 w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={30} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
