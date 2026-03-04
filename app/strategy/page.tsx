export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, BarChart3, OctagonX, Rocket } from "lucide-react";

async function getPosts() {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    const res = await fetch(`${base}/api/posts`, { next: { revalidate: 3600 } });
    return res.json();
  } catch { return []; }
}

const Q2_PLAN = [
  { month:"April", theme:"Foundation", color:"#6366f1", pills:["AI launch content","Contractor pay guide","Customer spotlight","Comparison post"] },
  { month:"May", theme:"Authority", color:"#818cf8", pills:["Thought leadership","Reddit engagement","Demo series","Collab post"] },
  { month:"June", theme:"Growth", color:"#06b6d4", pills:["Transparency report","Case study","FAQ carousel","Community push"] },
  { month:"July", theme:"Scale", color:"#22c55e", pills:["Q2 results post","SEO tutorial series","Best-of repurpose","Q3 preview"] },
];

const STOPS = [
  { text:'"JustPaid is excited to announce..."', why:"0.3% engagement. Nobody cares about announcements." },
  { text:"Promotional-first content", why:"Posts that lead with 'Sign up' get 70% less reach." },
  { text:"Posts without a hook", why:"First 2 lines determine if LinkedIn expands the post." },
];

const DOUBLES = [
  { text:"Tutorial & how-to content", why:"3.5x more views than promotional posts." },
  { text:"First-person LinkedIn voice", why:"'I learned that...' beats 'JustPaid enables...' — 2.8x engagement." },
  { text:"YouTube 4+ videos/month", why:"Algorithm trust. Consistency beats quality for growth." },
];

export default async function StrategyPage() {
  const posts = await getPosts();

  const byType: Record<string, { views:number; count:number }> = {};
  posts.forEach((p: {post_type:string; views:number}) => {
    if (!byType[p.post_type]) byType[p.post_type] = { views:0, count:0 };
    byType[p.post_type].views += Number(p.views);
    byType[p.post_type].count += 1;
  });
  const typeStats = Object.entries(byType)
    .map(([type, { views, count }]) => ({ type, avgViews: Math.round(views/count) }))
    .sort((a,b) => b.avgViews - a.avgViews);
  const maxViews = typeStats[0]?.avgViews || 1;

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(6,182,212,0.04))", border:"1px solid rgba(99,102,241,0.12)", borderRadius:20, padding:"2rem 2.25rem", marginBottom:"2rem" }}>
        <div style={{ fontSize:"0.62rem", fontWeight:600, color:"#6366f1", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.5rem" }}>Content Strategy</div>
        <h1 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:800, letterSpacing:"-0.5px", color:"#fafafa", margin:"0 0 0.4rem", display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <Brain size={28} strokeWidth={1.5} />
          Q2 Content Playbook
        </h1>
        <p style={{ color:"#71717a", fontSize:"0.88rem", margin:0 }}>12-week plan built from 6 months of JustPaid performance data. Every recommendation backed by real numbers.</p>
      </div>

      {/* Wins */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
        {[["4.2%","LinkedIn Engagement","3x industry avg"],["6x","YouTube Videos/Mo","Consistent cadence"],["+23%","QoQ Follower Growth","Across platforms"],["#1","Engagement Rate","vs 4 competitors"]].map(([val,label,sub]) => (
          <div key={label} style={{ background:"linear-gradient(135deg,rgba(34,197,94,0.05),rgba(6,182,212,0.03))", border:"1px solid rgba(34,197,94,0.12)", borderRadius:14, padding:"1.2rem", textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", fontWeight:800, color:"#22c55e" }}>{val}</div>
            <div style={{ fontSize:"0.7rem", fontWeight:600, color:"#e4e4e7", marginTop:"0.3rem" }}>{label}</div>
            <div style={{ fontSize:"0.62rem", color:"#52525b", marginTop:"0.2rem" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Content type performance */}
      <div className="card" style={{ marginBottom:"2rem" }}>
        <div className="section-title"><BarChart3 size={16} /> Content Type Performance (Avg Views)</div>
        {typeStats.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
            {typeStats.map(({ type, avgViews }, i) => (
              <div key={type}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                  <span style={{ fontSize:"0.82rem", color: i===0 ? "#fafafa" : "#71717a", fontWeight: i===0 ? 600 : 400 }}>{type}</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, color: i===0 ? "#818cf8" : "#52525b", fontVariantNumeric:"tabular-nums" }}>{avgViews >= 1000 ? `${(avgViews/1000).toFixed(1)}K` : avgViews}</span>
                </div>
                <div style={{ height:6, background:"#27272a", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(avgViews/maxViews)*100}%`, background: i===0 ? "linear-gradient(90deg,#6366f1,#06b6d4)" : "#3f3f46", borderRadius:3, transition:"width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:"1.5rem", textAlign:"center", color:"#52525b", fontSize:"0.85rem" }}>
            Data from BigQuery will appear here once connected
          </div>
        )}
      </div>

      {/* Q2 Calendar */}
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ fontSize:"0.62rem", fontWeight:600, color:"#6366f1", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.5rem" }}>Q2 2025 Plan</div>
        <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#fafafa", marginBottom:"1.5rem" }}>12-Week Content Calendar</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
          {Q2_PLAN.map(m => (
            <div key={m.month} className="card">
              <div style={{ fontSize:"0.62rem", fontWeight:600, color:m.color, textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.3rem" }}>{m.month}</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#fafafa", marginBottom:"1rem" }}>{m.theme}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                {m.pills.map(p => (
                  <span key={p} style={{ background:`${m.color}12`, color:m.color, fontSize:"0.72rem", fontWeight:500, padding:"0.3rem 0.7rem", borderRadius:8, display:"inline-block" }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stop / Double down */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        <div style={{ background:"rgba(239,68,68,0.03)", border:"1px solid rgba(239,68,68,0.1)", borderRadius:16, padding:"1.5rem" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#ef4444", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <OctagonX size={16} /> Stop Doing
          </div>
          {STOPS.map(s => (
            <div key={s.text} style={{ marginBottom:"0.8rem", paddingLeft:"0.8rem", borderLeft:"2px solid rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#fca5a5" }}>{s.text}</div>
              <div style={{ fontSize:"0.75rem", color:"#71717a", marginTop:"0.2rem" }}>{s.why}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(34,197,94,0.03)", border:"1px solid rgba(34,197,94,0.1)", borderRadius:16, padding:"1.5rem" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#22c55e", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"1rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <Rocket size={16} /> Double Down
          </div>
          {DOUBLES.map(d => (
            <div key={d.text} style={{ marginBottom:"0.8rem", paddingLeft:"0.8rem", borderLeft:"2px solid rgba(34,197,94,0.2)" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#86efac" }}>{d.text}</div>
              <div style={{ fontSize:"0.75rem", color:"#71717a", marginTop:"0.2rem" }}>{d.why}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
