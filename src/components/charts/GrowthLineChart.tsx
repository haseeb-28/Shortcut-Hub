"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/lib/analytics";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data: MonthlyPoint[];
  index?: number;
}

export function GrowthLineChart({ data, index }: Props) {
  return (
    <ChartCard title="Total Growth Over Time" subtitle="Cumulative shortcuts saved, by month" index={index}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--chart-label)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-grid)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--chart-label)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--chart-grid)" }} />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Total shortcuts"
              stroke="var(--amber)"
              strokeWidth={2.5}
              dot={{ fill: "var(--amber)", r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
