export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { timeAgo } from "@/lib/utils";
import { Crosshair, Flame, MessageCircle, ArrowUp } from "lucide-react";

interface Signal {
  source: string; title: string; url: string;
  score: number; comments: number; created: number;
  subreddit?: string; author?: string; category: string;
}

import { getLeads } from "@/lib/queries";

const CAT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  payroll:    { bg: "rgba(34,197,94,0.1)",   color: "#22c55e", label: "Payroll" },
  contractor: { bg: "rgba(234,179,8,0.1)",   color: "#eab308", label: "Contractor" },
  invoice:    { bg: "rgba(129,140,248,0.1)", color: "#818cf8", label: "Invoice" },
  general:    { bg: "rgba(99,102,241,0.08)", color: "#6366f1", label: "General" },
};

const SRC_STYLE: Record<string, { bg: string; color: string }> = {
  Reddit: { bg: "rgba(255,69,0,0.1)",  color: "#FF4500" },
  HN:     { bg: "rgba(255,102,0,0.1)", color: "#FF6600" },
};

export default async function LeadsPage() {
  const signals = await getLeads();
  const hot = signals.filter(s => s.score >= 50).length;
  const reddit = signals.filter(s => s.source === "Reddit").length;
  const hn = signals.filter(s => s.source === "HN").length;

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,rgba(255,69,0,0.06) 0%,rgba(99,102,241,0.04) 100%)",
        border: "1px solid rgba(255,69,0,0.1)", borderRadius: 20,
        padding: "2rem 2.25rem", marginBottom: "2rem",
      }}>
        <div style={{ fontSize:"0.62rem", fontWeight:600, color:"#FF4500", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.5rem" }}>
          Demand Intelligence · Live
        </div>
        <h1 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:800, letterSpacing:"-0.5px", color:"#fafafa", margin:"0 0 0.4rem", display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <Crosshair size={28} strokeWidth={1.5} />
          Warm Leads Found This Week
        </h1>
        <p style={{ color:"#71717a", fontSize:"0.88rem", margin:0 }}>
          People actively asking about contractor payments, payroll & invoicing on Reddit and Hacker News
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
        {[
          { label:"Total Signals", value: signals.length, color:"#6366f1" },
          { label:"Hot (50+ pts)", value: hot, color:"#ef4444" },
          { label:"From Reddit", value: reddit, color:"#FF4500" },
          { label:"From HN", value: hn, color:"#FF6600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"#52525b", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"0.4rem", fontWeight:500 }}>{label}</div>
            <div style={{ fontSize:"2rem", fontWeight:800, color, fontVariantNumeric:"tabular-nums" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Top insight */}
      {signals[0] && (
        <div style={{
          background:"linear-gradient(135deg,rgba(34,197,94,0.05),rgba(6,182,212,0.03))",
          border:"1px solid rgba(34,197,94,0.15)", borderRadius:14, padding:"1.2rem 1.5rem", marginBottom:"2rem",
          display:"flex", gap:"1rem", alignItems:"flex-start",
        }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Flame size={18} color="#22c55e" />
          </div>
          <div>
            <div style={{ fontSize:"0.7rem", fontWeight:600, color:"#22c55e", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"0.3rem" }}>Top Signal Right Now</div>
            <div style={{ fontSize:"0.9rem", color:"#fafafa", fontWeight:600 }}>{signals[0].title}</div>
            <div style={{ fontSize:"0.75rem", color:"#71717a", marginTop:"0.3rem" }}>
              {signals[0].score} upvotes · {signals[0].comments} comments · Warm prospect actively discussing the pain JustPaid solves
            </div>
          </div>
        </div>
      )}

      {/* Signal feed */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:"1rem" }}>
        {signals.map((s, i) => {
          const cat = CAT_STYLE[s.category] || CAT_STYLE.general;
          const src = SRC_STYLE[s.source] || SRC_STYLE.HN;
          const isHot = s.score >= 50;
          return (
            <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
              <div className="card" style={{
                borderLeft: `3px solid ${cat.color}`,
                borderRadius: "0 14px 14px 0",
                cursor:"pointer",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.7rem", gap:"0.5rem", flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                    <span style={{ background:src.bg, color:src.color, fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", padding:"0.2rem 0.6rem", borderRadius:6 }}>
                      {s.source}{s.subreddit ? ` · ${s.subreddit}` : ""}
                    </span>
                    <span style={{ background:cat.bg, color:cat.color, fontSize:"0.6rem", fontWeight:700, padding:"0.2rem 0.6rem", borderRadius:6 }}>
                      {cat.label}
                    </span>
                    {isHot && <span style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:"0.6rem", fontWeight:700, padding:"0.2rem 0.6rem", borderRadius:6 }}>Hot</span>}
                  </div>
                </div>
                <div style={{ fontSize:"0.88rem", fontWeight:600, color:"#e4e4e7", lineHeight:1.4, marginBottom:"0.7rem" }}>{s.title}</div>
                <div style={{ display:"flex", gap:"1rem", fontSize:"0.7rem", color:"#52525b", alignItems:"center" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:"0.2rem" }}><ArrowUp size={12} /> {s.score}</span>
                  <span style={{ display:"flex", alignItems:"center", gap:"0.2rem" }}><MessageCircle size={12} /> {s.comments}</span>
                  <span>{timeAgo(s.created)}</span>
                  {s.author && <span>by {s.author}</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Outreach templates */}
      <div style={{ marginTop:"2.5rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        {[
          { title:"Reddit Comment Template", content:`Hey! We built JustPaid to solve exactly this.\n[specific pain they mentioned] is one of the top reasons founders come to us.\n\nHappy to show you how we handle it — no pitch, just a quick look if it's useful. DM me!` },
          { title:"HN Reply Template", content:`This is exactly the problem we're solving at JustPaid.\n[their specific pain] comes up constantly — we've built [specific feature] to handle it.\n\nWould love your feedback if you want to take a look: justpaid.io` },
        ].map(({ title, content }) => (
          <div key={title} className="card">
            <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#6366f1", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"0.8rem" }}>{title}</div>
            <pre style={{ fontSize:"0.78rem", color:"#71717a", lineHeight:1.6, whiteSpace:"pre-wrap", margin:0, fontFamily:"Inter,sans-serif" }}>{content}</pre>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
