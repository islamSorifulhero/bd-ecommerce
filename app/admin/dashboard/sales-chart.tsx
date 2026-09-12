"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface SalesPoint {
  date: string; // e.g. "০৯ সেপ্টে"
  revenue: number;
}

export default function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" fontSize={12} tickLine={false} />
          <YAxis
            fontSize={12}
            tickLine={false}
            tickFormatter={(v) => `৳${v >= 1000 ? `${v / 1000}k` : v}`}
          />
          <Tooltip
            formatter={(value: number) => [`৳${value.toLocaleString()}`, "আয়"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
