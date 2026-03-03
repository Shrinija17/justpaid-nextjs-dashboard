"use client";
import DashboardLayout from "@/components/DashboardLayout";

function getPosts() {
  return [
    { platform: "LinkedIn", title: "Why most startups fail at payroll compliance", post_type: "Article", views: 12400, likes: 847, comments: 203, shares: 156 },
    { platform: "YouTube", title: "JustPaid vs Deel: Full comparison 2025", post_type: "Video", views: 8900, likes: 623, comments: 187, shares: 94 },
    { platform: "Twitter", title: "Thread: 7 payroll mistakes that cost startups $10K+", post_type: "Thread", views: 6200, likes: 412, comments: 89, shares: 201 },
    { platform: "Instagram", title: "The contractor payment checklist every founder needs", post_type: "Carousel", views: 4100, likes: 389, comments: 67, shares: 78 },
    { platform: "LinkedIn", title: "International contractor payments: what we learned", post_type: "Post", views: 3800, likes: 276, comments: 94, shares: 45 },
  ];
}

const Q2_PLAN = [
  { month:"April", theme:"Foundation", color:"#6C5CE7", pills:["🤖 AI launch content","🎬 Contractor pay guide","👤 Customer spotlight","⚔️ Comparison post"] },
  { month:"May", theme:"Authority", color:"#A29BFE", pills:["📊 Thought leadership","🎯 Reddit engagement","📹 Demo series","🤝 Collab post"] },
  { month:"June", theme:"Growth", color:"#00CEC9", pills:["📈 Transparency report","🏆 Case study","🔑 FAQ carousel","📣 Community push"] },
  { month:"July", theme:"Scale", color:"#00B894", pills:["📊 Q2 results post","🎓 SEO tutorial series","🔁 Best-of repurpose","🚀 Q3 preview"] },
];

const STOPS = [
  { text:'"JustPaid is excited to announce…"', why:"0.3% engagement. Nobody cares about announcements." },
  { text:"Promotional-first content", why:"Posts that lead with 'Sign up' get 70% less reach." },
  { text:"Posts without a hook", why:"First 2 lines determine if LinkedIn expands the post." },
];

const DOUBLES = [
  { text:"Tutorial & how-to content", why:"3.5× more views than promotional posts." },
  { text:"First-person LinkedIn voice", why:"'I learned that…' beats 'JustPaid enables…' — 2.8× engagement." },
  { text:"YouTube 4+ videos/month", why:"Algorithm trust. Consistency beats quality for growth." },
];

export default function StrategyPage() {
  const posts = getPosts();

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
      <div style={{ background:"linear-gradient(135deg,rgba(108,92,231,0.1),rgba(0,206,201,0.05))", border:"1px solid rgba(108,92,231,0.2)", borderRadius:20, padding:"1.8rem 2rem", marginBottom:"2rem" }}>
        <div style={{ fontSize:"0.62rem", fontWeight:700, color:"#6C5CE7", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.4rem" }}>Content Strategy</div>
        <h1 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900, letterSpacing:"-1px", color:"#E2E2EA", margin:"0 0 0.4rem" }}>🧠 Q2 Content Playbook</h1>
        <p style={{ color:"#8A8A9A", fontSize:"0.88rem", margin:0 }}>12-week plan built from 6 months of JustPaid performance data. Every recommendation backed by real numbers.</p>
      </div>

      {/* Wins */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
        {[["4.2%","LinkedIn Engagement","3× industry avg"],["6×","YouTube Videos/Mo","Consistent cadence"],["+23%","QoQ Follower Growth","Across platforms"],["#1","Engagement Rate","vs 4 competitors"]].map(([val,label,sub]) => (
          <div key={label} style={{ background:"linear-gradient(135deg,rgba(0,184,148,0.07),rgba(0,206,201,0.04))", border:"1px solid rgba(0,184,148,0.15)", borderRadius:14, padding:"1.2rem", textAlign:"center" }}>
            <div style={{ fontSize:"1.8rem", fontWeight:900, color:"#00B894" }}>{val}</div>
            <div style={{ fontSize:"0.7rem", fontWeight:600, color:"#E2E2EA", marginTop:"0.3rem" }}>{label}</div>
            <div style={{ fontSize:"0.62rem", color:"#5A5A6A", marginTop:"0.2rem" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Content type performance */}
      <div style={{ background:"#12121A", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"1.5rem", marginBottom:"2rem" }}>
        <div style={{ fontSize:"0.75rem", fontWeight:700, color:"#E2E2EA", marginBottom:"1.2rem" }}>📊 Content Type Performance (Avg Views)</div>
        {typeStats.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
            {typeStats.map(({ type, avgViews }, i) => (
              <div key={type}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.3rem" }}>
                  <span style={{ fontSize:"0.82rem", color: i===0 ? "#E2E2EA" : "#8A8A9A", fontWeight: i===0 ? 600 : 400 }}>{type}</span>
                  <span style={{ fontSize:"0.82rem", fontWeight:700, color: i===0 ? "#A29BFE" : "#5A5A6A" }}>{avgViews >= 1000 ? `${(avgViews/1000).toFixed(1)}K` : avgViews}</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.04)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(avgViews/maxViews)*100}%`, background: i===0 ? "linear-gradient(90deg,#6C5CE7,#00CEC9)" : "rgba(108,92,231,0.3)", borderRadius:4, transition:"width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:"1.5rem", textAlign:"center", color:"#5A5A6A", fontSize:"0.85rem" }}>
            Data from BigQuery will appear here once connected
          </div>
        )}
      </div>

      {/* Q2 Calendar */}
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ fontSize:"0.62rem", fontWeight:700, color:"#6C5CE7", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.5rem" }}>Q2 2025 Plan</div>
        <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#E2E2EA", marginBottom:"1.5rem" }}>12-Week Content Calendar</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.2rem" }}>
          {Q2_PLAN.map(m => (
            <div key={m.month} style={{ background:"#12121A", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.4rem" }}>
              <div style={{ fontSize:"0.62rem", fontWeight:700, color:m.color, textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.3rem" }}>{m.month}</div>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"#E2E2EA", marginBottom:"1rem" }}>{m.theme}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                {m.pills.map(p => (
                  <span key={p} style={{ background:`${m.color}15`, color:m.color, fontSize:"0.72rem", fontWeight:600, padding:"0.3rem 0.7rem", borderRadius:20, display:"inline-block" }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stop / Double down */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
        <div style={{ background:"rgba(225,112,85,0.04)", border:"1px solid rgba(225,112,85,0.15)", borderRadius:16, padding:"1.5rem" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"#E17055", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"1rem" }}>🛑 Stop Doing</div>
          {STOPS.map(s => (
            <div key={s.text} style={{ marginBottom:"0.8rem", paddingLeft:"0.8rem", borderLeft:"2px solid rgba(225,112,85,0.3)" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#E17055" }}>{s.text}</div>
              <div style={{ fontSize:"0.75rem", color:"#8A8A9A", marginTop:"0.2rem" }}>{s.why}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(0,184,148,0.04)", border:"1px solid rgba(0,184,148,0.15)", borderRadius:16, padding:"1.5rem" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"#00B894", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"1rem" }}>🚀 Double Down</div>
          {DOUBLES.map(d => (
            <div key={d.text} style={{ marginBottom:"0.8rem", paddingLeft:"0.8rem", borderLeft:"2px solid rgba(0,184,148,0.3)" }}>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#00B894" }}>{d.text}</div>
              <div style={{ fontSize:"0.75rem", color:"#8A8A9A", marginTop:"0.2rem" }}>{d.why}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
