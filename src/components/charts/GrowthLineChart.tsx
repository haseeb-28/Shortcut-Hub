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
            <CartesianGrid strokeDasharray="3 3" stroke="#223052" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#8592AD", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "#223052" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#8592AD", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#223052" }} />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Total shortcuts"
              stroke="#F2B705"
              strokeWidth={2.5}
              dot={{ fill: "#F2B705", r: 3 }}
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
