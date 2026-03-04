"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { PLATFORM_COLORS } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background: "#18181b", border: "1px solid #27272a",
  borderRadius: 10, fontSize: 12, color: "#e4e4e7",
};

export default function EngagementChart({ data }: { data: {platform:string; engagement_rate:number}[] }) {
  const sorted = [...(data||[])].sort((a,b) => Number(b.engagement_rate) - Number(a.engagement_rate));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} layout="vertical">
        <XAxis type="number" tick={{ fill:"#52525b", fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="platform" tick={{ fill:"#a1a1aa", fontSize:11, fontWeight:500 }} tickLine={false} axisLine={false} width={70} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number) => [`${v}%`, "Engagement"]} />
        <Bar dataKey="engagement_rate" radius={[0,6,6,0]} barSize={24}>
          {sorted.map((entry) => (
            <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
