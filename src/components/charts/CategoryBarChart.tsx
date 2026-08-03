"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { CategorySlice } from "@/lib/analytics";
import { CATEGORY_STYLE } from "@/lib/utils";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data: CategorySlice[];
  index?: number;
}

export function CategoryBarChart({ data, index }: Props) {
  return (
    <ChartCard title="Shortcuts per Category" subtitle="Count of saved shortcuts, by category" index={index}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#223052" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fill: "#8592AD", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "#223052" }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#8592AD", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="count" name="Shortcuts" radius={[6, 6, 0, 0]} maxBarSize={38} isAnimationActive animationDuration={700}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_STYLE[entry.category].accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
