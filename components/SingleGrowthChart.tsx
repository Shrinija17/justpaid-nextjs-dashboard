"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const TOOLTIP_STYLE = {
  background: "#18181b", border: "1px solid #27272a",
  borderRadius: 10, fontSize: 12, color: "#e4e4e7",
};

interface Props {
  data: { platform: string; date: { value: string } | string; followers: number }[];
  platform: string;
  color: string;
}

export default function SingleGrowthChart({ data, platform, color }: Props) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data
      .filter(r => r.platform === platform)
      .map(r => {
        const d = typeof r.date === "object" ? r.date.value : String(r.date);
        return { date: d.slice(5), followers: Number(r.followers) };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, platform]);

  if (!chartData.length) return <div style={{ color: "#52525b", textAlign: "center", padding: "2rem" }}>No growth data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${platform}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false} interval={14} />
        <YAxis tick={{ fill: "#52525b", fontSize: 10 }} tickLine={false} axisLine={false}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="followers" stroke={color} strokeWidth={2}
          fill={`url(#gradient-${platform})`} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
