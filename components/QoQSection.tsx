"use client";
import { fmt } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface QoQData {
  current: { label:string; stats:{total_posts:number;total_views:number;total_likes:number;avg_views:number;engagement_rate:number}; posts:{title:string;views:number;platform:string}[] };
  previous: { label:string; stats:{total_posts:number;total_views:number;total_likes:number;avg_views:number;engagement_rate:number}; posts:{title:string;views:number;platform:string}[] };
}

export default function QoQSection({ data }: { data: QoQData }) {
  const { current, previous } = data;
  const metrics = [
    { label:"Posts", curr: current.stats.total_posts, prev: previous.stats.total_posts, format: (v:number) => String(v) },
    { label:"Total Views", curr: current.stats.total_views, prev: previous.stats.total_views, format: fmt },
    { label:"Total Likes", curr: current.stats.total_likes, prev: previous.stats.total_likes, format: fmt },
    { label:"Avg Views/Post", curr: current.stats.avg_views, prev: previous.stats.avg_views, format: fmt },
    { label:"Engagement", curr: current.stats.engagement_rate, prev: previous.stats.engagement_rate, format: (v:number) => `${v}%` },
  ];

  return (
    <div className="card">
      <div style={{ fontSize:"0.8rem", fontWeight:600, color:"#a1a1aa", marginBottom:"1.2rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <TrendingUp size={16} />
        Quarter-over-Quarter:
        <span style={{ color:"#818cf8", fontWeight:700 }}>{current.label}</span>
        <span style={{ color:"#52525b" }}>vs</span>
        <span style={{ color:"#52525b" }}>{previous.label}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"0.75rem" }}>
        {metrics.map(({ label, curr, prev, format }) => {
          const diff = curr - prev;
          const pct = prev > 0 ? ((diff/prev)*100).toFixed(1) : "0";
          const up = diff >= 0;
          return (
            <div key={label} style={{
              textAlign:"center", background:"#0f0f12", borderRadius:12, padding:"1rem",
              border:"1px solid #1e1e22",
            }}>
              <div style={{ fontSize:"0.6rem", color:"#52525b", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"0.5rem", fontWeight:500 }}>{label}</div>
              <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#fafafa", fontVariantNumeric:"tabular-nums" }}>{format(curr)}</div>
              <div style={{ fontSize:"0.72rem", fontWeight:600, color: up ? "#22c55e":"#ef4444", marginTop:"0.35rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.25rem" }}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(Number(pct))}%
              </div>
              <div style={{ fontSize:"0.6rem", color:"#3f3f46", marginTop:"0.3rem" }}>{previous.label}: {format(prev)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
