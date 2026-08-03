"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyPoint } from "@/lib/analytics";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data: MonthlyPoint[];
  index?: number;
}

export function GrowthAreaChart({ data, index }: Props) {
  return (
    <ChartCard title="New Shortcuts per Month" subtitle="How many shortcuts you added, month by month" index={index}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="addedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4FD1C5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4FD1C5" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="added"
              name="Added"
              stroke="#4FD1C5"
              strokeWidth={2.5}
              fill="url(#addedGradient)"
              isAnimationActive
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
