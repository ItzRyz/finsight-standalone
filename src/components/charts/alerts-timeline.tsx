"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type Point = { label: string; percentage: number };

export function AlertsTimeline({ data }: { data: Point[] }) {
  if (data.length < 2) return <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Not enough alerts to chart</div>;
  return (
    <ChartContainer config={{ percentage: { label: "% used", color: "var(--chart-1)" } }} className="h-56 w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} unit="%" domain={[0, 120]} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="percentage" stroke="var(--color-percentage)" strokeWidth={2} dot />
      </LineChart>
    </ChartContainer>
  );
}
