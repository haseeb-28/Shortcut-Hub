"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySlice } from "@/lib/analytics";
import { CATEGORY_STYLE, getCategoryStyle } from "@/lib/utils";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";

interface Props {
  data: CategorySlice[];
  index?: number;
}

export function CategoryPieChart({ data, index }: Props) {
  return (
    <ChartCard title="Category Distribution" subtitle="Percentage share of your shortcut library" index={index}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              isAnimationActive
              animationDuration={700}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={getCategoryStyle(entry.category).accent} stroke="#0A0F1E" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#8592AD" }}
              formatter={(value: string) => <span style={{ color: "#8592AD" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
