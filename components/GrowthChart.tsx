"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PLATFORM_COLORS } from "@/lib/utils";
import { useMemo } from "react";

const TOOLTIP_STYLE = {
  background: "#18181b", border: "1px solid #27272a",
  borderRadius: 10, fontSize: 12, color: "#e4e4e7",
};

export default function GrowthChart({ data }: { data: {platform:string; date:{value:string}|string; followers:number}[] }) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    const byDate: Record<string, Record<string,number>> = {};
    data.forEach(r => {
      const d = typeof r.date === "object" ? r.date.value : String(r.date);
      if (!byDate[d]) byDate[d] = {};
      byDate[d][r.platform] = Number(r.followers);
    });
    return Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b)).map(([date, vals]) => ({ date: date.slice(5), ...vals }));
  }, [data]);

  const platforms = ["YouTube","Instagram","LinkedIn","Twitter"];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fill:"#52525b", fontSize:10 }} tickLine={false} axisLine={false} interval={14} />
        <YAxis tick={{ fill:"#52525b", fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize:11, color:"#a1a1aa" }} />
        {platforms.map(p => (
          <Line key={p} type="monotone" dataKey={p} stroke={PLATFORM_COLORS[p]}
            strokeWidth={2} dot={false} activeDot={{ r:4, strokeWidth:0 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
