"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

const TOOLTIP_STYLE = {
  background: "#18181b", border: "1px solid #27272a",
  borderRadius: 10, fontSize: 12, color: "#e4e4e7",
};

export default function CompBarChart({ data, unit }: { data:{name:string;value:number;color:string}[]; unit:string }) {
  const sorted = [...data].sort((a,b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={sorted}>
        <XAxis dataKey="name" tick={{ fill:"#a1a1aa", fontSize:11, fontWeight:500 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill:"#52525b", fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${unit.trim()}`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number) => [`${v}${unit}`, ""]} />
        <Bar dataKey="value" radius={[6,6,0,0]} barSize={32}>
          {sorted.map(entry => <Cell key={entry.name} fill={entry.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
