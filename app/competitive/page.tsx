export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import CompBarChart from "@/components/CompBarChart";
import { Swords, Cpu, Video, User, GitCompare, Lightbulb, TrendingUp, Crown, Target, AlertTriangle, Users, Zap } from "lucide-react";

import { getAnalytics } from "@/lib/queries";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// REAL competitors — B2B billing, AR, invoicing space
const ENTERPRISE_COMPETITORS = [
  { name: "Chargebee", tag: "Subscription billing leader", color: "#f97316", funding: "$950M val", linkedin: 22000, twitter: 7344, youtube: 1800, engagement: 0.8, postsPerWeek: 3, strength: "27 quarters G2 leader, 35+ gateways", weakness: "No AI contract reading, 2-4 week setup" },
  { name: "Stripe Billing", tag: "Developer-first billing", color: "#6366f1", funding: "$65B val", linkedin: 850000, twitter: 420000, youtube: 45000, engagement: 0.3, postsPerWeek: 12, strength: "Massive developer ecosystem, 135+ currencies", weakness: "Requires engineering, no autonomous collections" },
  { name: "Bill.com", tag: "AP/AR automation (NYSE: BILL)", color: "#22c55e", funding: "$5B mkt cap", linkedin: 38000, twitter: 8500, youtube: 2400, engagement: 0.5, postsPerWeek: 5, strength: "7M+ payment network, SMB dominance", weakness: "Weak AR module, no AI contract reading" },
  { name: "Maxio", tag: "B2B SaaS billing ops", color: "#eab308", funding: "Series A+", linkedin: 8500, twitter: 3200, youtube: 800, engagement: 1.2, postsPerWeek: 4, strength: "Best SaaS metrics, ASC 606 native", weakness: "6-12 week setup, no AI, high complexity" },
  { name: "Paddle", tag: "Merchant of Record", color: "#06b6d4", funding: "$1.4B val", linkedin: 15000, twitter: 12000, youtube: 1200, engagement: 1.0, postsPerWeek: 6, strength: "100+ jurisdiction tax, fraud coverage", weakness: "5% per txn, B2C focused, no B2B contracts" },
];

// Stage-comparable competitors (YC/startup stage, from LinkedIn audit)
const STAGE_COMPETITORS = [
  { name: "Puzzle", tag: "AI accounting platform", color: "#a855f7", linkedin: 12603, engagement: 1.56, topPost: 197, medianReactions: "8-18", postFreq: "3-4/week" },
  { name: "Digits", tag: "Automated accounting", color: "#ec4899", linkedin: 7563, engagement: 2.34, topPost: 177, medianReactions: "13-18", postFreq: "2-3/week" },
  { name: "Campfire", tag: "Modern accounting (YC)", color: "#f97316", linkedin: 3200, engagement: 0.9, topPost: 242, medianReactions: "N/A", postFreq: "~1/week" },
];

const GAP_ICONS = [Cpu, Video, User, GitCompare];
const GAPS = [
  { title: "AI contract extraction", desc: "No competitor reads contracts autonomously. Chargebee, Stripe, Bill.com all require manual config. JustPaid's core moat.", action: "Only platform that does this" },
  { title: "YouTube SEO goldmine", desc: '"How to automate B2B billing" — 8K+ monthly searches. Chargebee stopped posting in 2025. Stripe has dev content only.', action: "4 videos — own the keyword" },
  { title: "Founder voice on LinkedIn", desc: "Personal posts get 2.8x more engagement. Puzzle wins with community events, Digits with customer wins. JustPaid needs founder stories.", action: "2.8x engagement multiplier" },
  { title: "Comparison content", desc: '"JustPaid vs Chargebee" and "Chargebee alternatives" have 5K+ monthly searches. Nobody owns this yet.', action: "5K/mo search volume unclaimed" },
];

export default async function CompetitivePage() {
  const analytics = await getAnalytics();
  const channelMetrics = analytics?.channelMetrics || [];
  const platformSummary = analytics?.platformSummary || [];

  const jp = {
    linkedin: Number(channelMetrics.find((c: { platform: string }) => c.platform === "LinkedIn")?.followers || 0),
    twitter: Number(channelMetrics.find((c: { platform: string }) => c.platform === "Twitter")?.followers || 0),
    youtube: Number(channelMetrics.find((c: { platform: string }) => c.platform === "YouTube")?.followers || 0),
    instagram: Number(channelMetrics.find((c: { platform: string }) => c.platform === "Instagram")?.followers || 0),
  };

  const jpLinkedinEng = Number(platformSummary.find((p: { platform: string }) => p.platform === "LinkedIn")?.avg_engagement_rate || 0);
  const jpTwitterEng = Number(platformSummary.find((p: { platform: string }) => p.platform === "Twitter")?.avg_engagement_rate || 0);
  const totalPosts = platformSummary.reduce((s: number, p: { post_count: number }) => s + Number(p.post_count), 0);

  // LinkedIn engagement rate from audit: 0.07-0.14% (reactions/followers)
  // But post-level engagement (likes+comments/views) from BigQuery is different
  const jpLinkedinReactionRate = jp.linkedin > 0 ? 0.14 : 0; // From audit data

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.06),rgba(99,102,241,0.04))", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 20, padding: "2rem 2.25rem", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#22c55e", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Competitive Intelligence · Live from BigQuery</div>
        <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.5px", color: "#fafafa", margin: "0 0 0.4rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Swords size={28} strokeWidth={1.5} />
          JustPaid vs The Market
        </h1>
        <p style={{ color: "#71717a", fontSize: "0.88rem", margin: 0 }}>
          Real JustPaid metrics vs Chargebee, Stripe Billing, Bill.com, Maxio & Paddle. {totalPosts} posts analyzed.
        </p>
      </div>

      {/* === SECTION 1: Enterprise Competitors === */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Enterprise Competitors</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fafafa", marginBottom: "1rem" }}>JustPaid vs Billing Giants</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                {["Company", "LinkedIn", "Twitter/X", "YouTube", "Eng. Rate", "Posts/Wk", "Funding"].map(h => (
                  <th key={h} style={{ padding: "0.7rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* JustPaid row — LIVE data */}
              <tr className="table-row" style={{ borderBottom: "1px solid #27272a", background: "rgba(99,102,241,0.04)" }}>
                <td style={{ padding: "0.75rem 0.8rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontWeight: 700, color: "#818cf8" }}>JustPaid</span>
                    <span className="badge badge-live" style={{ fontSize: "0.5rem", padding: "0.1rem 0.35rem" }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#52525b", marginTop: "0.15rem" }}>AI billing agent (YC W23)</div>
                </td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#fafafa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(jp.linkedin)}</td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#fafafa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(jp.twitter)}</td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#fafafa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(jp.youtube)}</td>
                <td style={{ padding: "0.75rem 0.8rem", fontWeight: 700, color: jpLinkedinEng > 2 ? "#22c55e" : "#eab308" }}>{jpLinkedinEng}%</td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#fafafa", fontVariantNumeric: "tabular-nums" }}>5-6</td>
                <td style={{ padding: "0.75rem 0.8rem", color: "#818cf8", fontWeight: 600 }}>$5.7M</td>
              </tr>
              {/* Competitor rows */}
              {ENTERPRISE_COMPETITORS.map(c => (
                <tr key={c.name} className="table-row" style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}>
                  <td style={{ padding: "0.75rem 0.8rem" }}>
                    <span style={{ fontWeight: 600, color: c.color }}>{c.name}</span>
                    <div style={{ fontSize: "0.6rem", color: "#52525b", marginTop: "0.15rem" }}>{c.tag}</div>
                  </td>
                  <td style={{ padding: "0.75rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{fmt(c.linkedin)}</td>
                  <td style={{ padding: "0.75rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{fmt(c.twitter)}</td>
                  <td style={{ padding: "0.75rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{fmt(c.youtube)}</td>
                  <td style={{ padding: "0.75rem 0.8rem", color: c.engagement > 1 ? "#eab308" : "#ef4444", fontWeight: 600 }}>{c.engagement}%</td>
                  <td style={{ padding: "0.75rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{c.postsPerWeek}</td>
                  <td style={{ padding: "0.75rem 0.8rem", color: "#52525b" }}>{c.funding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strength/Weakness cards */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Target size={16} /> Competitive Strengths & Weaknesses</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
          {ENTERPRISE_COMPETITORS.map(c => (
            <div key={c.name} style={{ background: "#0f0f12", border: "1px solid #1e1e22", borderRadius: 10, padding: "1rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: c.color, marginBottom: "0.6rem" }}>{c.name}</div>
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.2rem" }}>Their strength</div>
                <div style={{ fontSize: "0.72rem", color: "#a1a1aa", lineHeight: 1.4 }}>{c.strength}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "#ef4444", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.2rem" }}>JustPaid advantage</div>
                <div style={{ fontSize: "0.72rem", color: "#a1a1aa", lineHeight: 1.4 }}>{c.weakness}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === SECTION 2: Stage-Comparable Competitors (LinkedIn) === */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#a855f7", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Stage-Comparable Competitors</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fafafa", marginBottom: "0.3rem" }}>LinkedIn Engagement Benchmark (Similar Stage)</div>
        <p style={{ fontSize: "0.78rem", color: "#52525b", marginBottom: "1rem" }}>From the Feb 2026 LinkedIn competitive audit. These are the companies JustPaid should be benchmarking engagement against.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {/* JustPaid card */}
          <div className="card" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(6,182,212,0.03))", borderColor: "rgba(99,102,241,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#818cf8" }}>JustPaid</span>
              <span className="badge badge-live" style={{ fontSize: "0.5rem", padding: "0.1rem 0.35rem" }}>LIVE</span>
            </div>
            <div style={{ fontSize: "0.58rem", color: "#52525b", marginBottom: "0.8rem" }}>AI billing agent (YC W23)</div>
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>LinkedIn Followers</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fafafa" }}>{fmt(jp.linkedin)}</div>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Engagement Rate</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ef4444" }}>0.14%</div>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Median Reactions</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ef4444" }}>2-4</div>
            </div>
            <div>
              <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Top Post</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fafafa" }}>16</div>
            </div>
          </div>

          {/* Stage competitors */}
          {STAGE_COMPETITORS.map(c => (
            <div key={c.name} className="card">
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: c.color, marginBottom: "0.2rem" }}>{c.name}</div>
              <div style={{ fontSize: "0.58rem", color: "#52525b", marginBottom: "0.8rem" }}>{c.tag}</div>
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>LinkedIn Followers</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fafafa" }}>{fmt(c.linkedin)}</div>
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Engagement Rate</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: c.engagement > 1 ? "#22c55e" : "#eab308" }}>{c.engagement}%</div>
              </div>
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Median Reactions</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fafafa" }}>{c.medianReactions}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase" }}>Top Post</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#22c55e" }}>{c.topPost}</div>
              </div>
            </div>
          ))}
        </div>

        {/* The honest insight */}
        <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: 600, marginBottom: "0.2rem" }}>
              JustPaid posts 2x more than Puzzle & Digits but gets 5-10x less engagement
            </div>
            <div style={{ fontSize: "0.72rem", color: "#71717a", lineHeight: 1.5 }}>
              Median 2-4 reactions per post with 2.8K followers (0.14% engagement) vs Puzzle at 8-18 reactions with 12.6K followers (1.56%). The problem is strategy, not effort. Competitors win with community events, founder storytelling, and customer wins.
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Chart — Enterprise */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title">LinkedIn Engagement Rate — Enterprise Landscape</div>
        <CompBarChart
          data={[
            { name: "JustPaid", value: jpLinkedinEng, color: "#6366f1" },
            ...ENTERPRISE_COMPETITORS.map(c => ({ name: c.name, value: c.engagement, color: c.color })),
          ]}
          unit="%"
        />
      </div>

      {/* Audience Size Comparison */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Users size={16} /> LinkedIn Audience Size Gap</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { name: "Stripe Billing", val: 850000, color: "#6366f1" },
            { name: "Bill.com", val: 38000, color: "#22c55e" },
            { name: "Chargebee", val: 22000, color: "#f97316" },
            { name: "Paddle", val: 15000, color: "#06b6d4" },
            { name: "Puzzle", val: 12603, color: "#a855f7" },
            { name: "Maxio", val: 8500, color: "#eab308" },
            { name: "Digits", val: 7563, color: "#ec4899" },
            { name: "JustPaid", val: jp.linkedin, color: "#818cf8" },
          ].sort((a, b) => b.val - a.val).map((comp, i) => {
            const max = 850000;
            const isUs = comp.name === "JustPaid";
            return (
              <div key={comp.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                  <span style={{ fontSize: "0.75rem", color: isUs ? "#fafafa" : "#a1a1aa", fontWeight: isUs ? 700 : 400 }}>
                    {comp.name} {isUs && "★"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: isUs ? "#fafafa" : "#52525b", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(comp.val)}</span>
                </div>
                <div style={{ height: 5, background: "#27272a", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max((comp.val / max) * 100, 0.5)}%`, background: comp.color, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wins & Growth Opportunities */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#22c55e", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Crown size={16} /> Where JustPaid Wins
          </div>
          {[
            "AI contract extraction — no competitor does this. Period.",
            "3-7 day implementation vs 2-12 weeks for Chargebee/Maxio",
            "Free up to $1M ARR — cheapest entry point in the market",
            "Autonomous collections with adaptive AI — competitors use static rules",
            `Twitter/X engagement (${jpTwitterEng}%) crushes Chargebee (avg 2.2 likes/tweet)`,
          ].map((w, i) => (
            <div key={i} style={{ marginBottom: "0.6rem", paddingLeft: "0.8rem", borderLeft: "2px solid rgba(34,197,94,0.3)" }}>
              <div style={{ fontSize: "0.78rem", color: "#86efac", lineHeight: 1.5 }}>{w}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(234,179,8,0.03)", border: "1px solid rgba(234,179,8,0.1)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#eab308", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={16} /> Growth Opportunities
          </div>
          {[
            `LinkedIn: ${fmt(jp.linkedin)} followers with 0.14% eng — Puzzle has 12.6K at 1.56%`,
            "Content strategy needs pivot: 35% talking-head videos get 1-4 reactions",
            "No employee advocacy — 15 team members on LinkedIn not leveraged",
            `Instagram: ${jp.instagram} followers — needs dedicated growth plan`,
            "Pricing cliff at $1M ARR (free → $12K/yr) may cause churn",
          ].map((c, i) => (
            <div key={i} style={{ marginBottom: "0.6rem", paddingLeft: "0.8rem", borderLeft: "2px solid rgba(234,179,8,0.3)" }}>
              <div style={{ fontSize: "0.78rem", color: "#fde68a", lineHeight: 1.5 }}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency: Engagement per dollar */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Zap size={16} /> David vs Goliath — Efficiency Metrics</div>
        <p style={{ fontSize: "0.72rem", color: "#52525b", marginBottom: "1rem" }}>
          JustPaid is competing against companies with 100-10,000x more funding. Here is where scrappiness wins.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
          {[
            { label: "JustPaid", funding: "$5.7M", posts: totalPosts, color: "#818cf8" },
            { label: "Chargebee", funding: "$950M", posts: 156, color: "#f97316" },
            { label: "Stripe", funding: "$65B", posts: 624, color: "#6366f1" },
          ].map(c => {
            const fundingNum = parseFloat(c.funding.replace(/[$MB]/g, "")) * (c.funding.includes("B") ? 1000 : 1);
            const postsPerMil = fundingNum > 0 ? (c.posts / fundingNum * 1000).toFixed(0) : "0";
            return (
              <div key={c.label} style={{ background: "#0f0f12", border: "1px solid #1e1e22", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.68rem", color: c.color, fontWeight: 700, marginBottom: "0.3rem" }}>{c.label}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fafafa" }}>{postsPerMil}</div>
                <div style={{ fontSize: "0.55rem", color: "#3f3f46", marginTop: "0.15rem" }}>posts per $M raised</div>
                <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: "0.3rem" }}>{c.funding} funding · {c.posts} posts</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Gaps */}
      <div style={{ marginBottom: "0.8rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Content Gaps</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fafafa", marginBottom: "1.5rem" }}>4 Places JustPaid Can Win</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1rem" }}>
        {GAPS.map((g, i) => {
          const Icon = GAP_ICONS[i];
          return (
            <div key={g.title} className="card" style={{ borderLeft: "3px solid #6366f1", borderRadius: "0 14px 14px 0" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                <Icon size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fafafa", marginBottom: "0.5rem" }}>{g.title}</div>
              <div style={{ fontSize: "0.8rem", color: "#71717a", lineHeight: 1.6, marginBottom: "1rem" }}>{g.desc}</div>
              <span className="badge badge-source" style={{ fontWeight: 600 }}>{g.action}</span>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
