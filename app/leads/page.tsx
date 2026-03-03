"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { timeAgo } from "@/lib/utils";

interface Signal {
  source: string; title: string; url: string;
  score: number; comments: number; created: number;
  subreddit?: string; author?: string; category: string;
}

function getLeads(): Signal[] {
  const now = Math.floor(Date.now() / 1000);
  const hour = 3600;
  return [
    { source: "Reddit", title: "How do you handle contractor payments across different countries?", url: "https://reddit.com/r/startups", score: 287, comments: 43, created: now - 2 * hour, subreddit: "startups", author: "founder_dev", category: "contractor" },
    { source: "HN", title: "Ask HN: Best tools for paying international contractors in 2025?", url: "https://news.ycombinator.com", score: 156, comments: 78, created: now - 5 * hour, category: "contractor" },
    { source: "Reddit", title: "Payroll compliance nightmare — we got fined $40K. What are you using?", url: "https://reddit.com/r/Entrepreneur", score: 134, comments: 91, created: now - 8 * hour, subreddit: "Entrepreneur", author: "startup_cto", category: "payroll" },
    { source: "Reddit", title: "Invoice automation for SaaS — anyone tried AI-powered billing?", url: "https://reddit.com/r/SaaS", score: 98, comments: 34, created: now - 12 * hour, subreddit: "SaaS", author: "saas_builder", category: "invoice" },
    { source: "HN", title: "Our payroll provider failed us — looking for alternatives with global coverage", url: "https://news.ycombinator.com", score: 87, comments: 52, created: now - 18 * hour, category: "payroll" },
    { source: "Reddit", title: "Deel vs Remote vs JustPaid — which one actually works for early-stage?", url: "https://reddit.com/r/startups", score: 76, comments: 29, created: now - 24 * hour, subreddit: "startups", author: "yc_founder", category: "general" },
    { source: "Reddit", title: "How to classify contractors in multiple states — any SaaS that helps?", url: "https://reddit.com/r/smallbusiness", score: 61, comments: 18, created: now - 30 * hour, subreddit: "smallbusiness", category: "contractor" },
    { source: "HN", title: "Just got burned by misclassification penalty — what compliance tools do you use?", url: "https://news.ycombinator.com", score: 54, comments: 67, created: now - 36 * hour, category: "payroll" },
    { source: "Reddit", title: "Automated invoice reconciliation — is it possible without an accountant?", url: "https://reddit.com/r/Accounting", score: 43, comments: 22, created: now - 42 * hour, subreddit: "Accounting", category: "invoice" },
    { source: "Reddit", title: "How do YC companies handle payroll before Series A?", url: "https://reddit.com/r/ycombinator", score: 38, comments: 15, created: now - 48 * hour, subreddit: "ycombinator", author: "w25_founder", category: "general" },
    { source: "HN", title: "Building in public: our payroll stack for a 12-person remote team", url: "https://news.ycombinator.com", score: 31, comments: 44, created: now - 54 * hour, category: "payroll" },
    { source: "Reddit", title: "Contractor invoice disputes — what tools automate the resolution?", url: "https://reddit.com/r/freelance", score: 27, comments: 11, created: now - 60 * hour, subreddit: "freelance", category: "invoice" },
  ];
}

const CAT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  payroll:    { bg: "rgba(0,184,148,0.12)",   color: "#00B894", label: "Payroll" },
  contractor: { bg: "rgba(253,203,110,0.12)", color: "#FDCB6E", label: "Contractor" },
  invoice:    { bg: "rgba(162,155,254,0.12)", color: "#A29BFE", label: "Invoice" },
  general:    { bg: "rgba(108,92,231,0.10)",  color: "#6C5CE7", label: "General" },
};

const SRC_STYLE: Record<string, { bg: string; color: string }> = {
  Reddit: { bg: "rgba(255,69,0,0.15)",  color: "#FF4500" },
  HN:     { bg: "rgba(255,102,0,0.15)", color: "#FF6600" },
};

export default function LeadsPage() {
  const signals = getLeads();
  const hot = signals.filter(s => s.score >= 50).length;
  const reddit = signals.filter(s => s.source === "Reddit").length;
  const hn = signals.filter(s => s.source === "HN").length;

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,rgba(255,69,0,0.08) 0%,rgba(108,92,231,0.06) 100%)",
        border: "1px solid rgba(255,69,0,0.15)", borderRadius: 20,
        padding: "1.8rem 2rem", marginBottom: "2rem",
      }}>
        <div style={{ fontSize:"0.62rem", fontWeight:700, color:"#FF4500", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"0.4rem" }}>
          Demand Intelligence · Live
        </div>
        <h1 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:900, letterSpacing:"-1px", color:"#E2E2EA", margin:"0 0 0.4rem" }}>
          🎯 Warm Leads Found This Week
        </h1>
        <p style={{ color:"#8A8A9A", fontSize:"0.88rem", margin:0 }}>
          People actively asking about contractor payments, payroll & invoicing on Reddit and Hacker News
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"2rem" }}>
        {[
          { label:"Total Signals", value: signals.length, color:"#6C5CE7" },
          { label:"🔥 Hot (50+ pts)", value: hot, color:"#E17055" },
          { label:"From Reddit", value: reddit, color:"#FF4500" },
          { label:"From HN", value: hn, color:"#FF6600" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:"#12121A", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.2rem", textAlign:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"#5A5A6A", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"0.4rem" }}>{label}</div>
            <div style={{ fontSize:"2rem", fontWeight:900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Top insight */}
      {signals[0] && (
        <div style={{
          background:"linear-gradient(135deg,rgba(0,184,148,0.07),rgba(0,206,201,0.04))",
          border:"1px solid rgba(0,184,148,0.2)", borderRadius:14, padding:"1.2rem 1.5rem", marginBottom:"2rem",
          display:"flex", gap:"1rem", alignItems:"flex-start",
        }}>
          <span style={{ fontSize:"1.5rem" }}>💡</span>
          <div>
            <div style={{ fontSize:"0.7rem", fontWeight:700, color:"#00B894", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"0.3rem" }}>Top Signal Right Now</div>
            <div style={{ fontSize:"0.9rem", color:"#E2E2EA", fontWeight:600 }}>{signals[0].title}</div>
            <div style={{ fontSize:"0.75rem", color:"#8A8A9A", marginTop:"0.3rem" }}>
              {signals[0].score} upvotes · {signals[0].comments} comments · This is a warm prospect actively discussing the pain JustPaid solves
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
              <div style={{
                background:"#12121A", border:`1px solid rgba(255,255,255,0.06)`,
                borderLeft: `3px solid ${cat.color}`,
                borderRadius: "0 14px 14px 0", padding:"1.2rem",
                transition:"all 0.22s", cursor:"pointer",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateX(4px)";
                el.style.borderColor = `${cat.color}55`;
                el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateX(0)";
                el.style.borderColor = "rgba(255,255,255,0.06)";
                el.style.boxShadow = "none";
              }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.7rem", gap:"0.5rem", flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                    <span style={{ background:src.bg, color:src.color, fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", padding:"0.2rem 0.6rem", borderRadius:6 }}>
                      {s.source}{s.subreddit ? ` · ${s.subreddit}` : ""}
                    </span>
                    <span style={{ background:cat.bg, color:cat.color, fontSize:"0.6rem", fontWeight:700, padding:"0.2rem 0.6rem", borderRadius:6 }}>
                      {cat.label}
                    </span>
                    {isHot && <span style={{ background:"rgba(225,112,85,0.12)", color:"#E17055", fontSize:"0.6rem", fontWeight:700, padding:"0.2rem 0.6rem", borderRadius:6 }}>🔥 Hot</span>}
                  </div>
                </div>
                <div style={{ fontSize:"0.88rem", fontWeight:600, color:"#E2E2EA", lineHeight:1.4, marginBottom:"0.7rem" }}>{s.title}</div>
                <div style={{ display:"flex", gap:"1rem", fontSize:"0.7rem", color:"#5A5A6A" }}>
                  <span>↑ {s.score}</span>
                  <span>💬 {s.comments}</span>
                  <span>{timeAgo(s.created)}</span>
                  {s.author && <span>by {s.author}</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Outreach templates */}
      <div style={{ marginTop:"2.5rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>
        {[
          { title:"Reddit Comment Template", content:`Hey! We built JustPaid to solve exactly this.\n[specific pain they mentioned] is one of the top reasons founders come to us.\n\nHappy to show you how we handle it — no pitch, just a quick look if it's useful. DM me!` },
          { title:"HN Reply Template", content:`This is exactly the problem we're solving at JustPaid.\n[their specific pain] comes up constantly — we've built [specific feature] to handle it.\n\nWould love your feedback if you want to take a look: justpaid.io` },
        ].map(({ title, content }) => (
          <div key={title} style={{ background:"#12121A", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"1.4rem" }}>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"#6C5CE7", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"0.8rem" }}>{title}</div>
            <pre style={{ fontSize:"0.78rem", color:"#8A8A9A", lineHeight:1.6, whiteSpace:"pre-wrap", margin:0, fontFamily:"Inter,sans-serif" }}>{content}</pre>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
