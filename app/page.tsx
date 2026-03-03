"use client";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import GrowthChart from "@/components/GrowthChart";
import EngagementChart from "@/components/EngagementChart";
import TopPostsTable from "@/components/TopPostsTable";
import QoQSection from "@/components/QoQSection";
import { PLATFORM_COLORS, PLATFORM_ICONS, fmt } from "@/lib/utils";

function getMetrics() {
  return [
    { platform: "LinkedIn", followers: 3400, follower_change: 550, engagement_rate: 4.2 },
    { platform: "Twitter", followers: 2100, follower_change: 225, engagement_rate: 2.1 },
    { platform: "Instagram", followers: 1200, follower_change: 280, engagement_rate: 3.8 },
    { platform: "YouTube", followers: 890, follower_change: 138, engagement_rate: 5.1 },
  ];
}
function getGrowth() {
  const platforms = ["LinkedIn","Twitter","Instagram","YouTube"];
  const bases: Record<string,number> = { LinkedIn: 2900, Twitter: 1900, Instagram: 950, YouTube: 760 };
  const result = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    platforms.forEach(p => {
      const growth = (89 - i) / 89;
      result.push({ platform: p, date: { value: dateStr }, followers: Math.round(bases[p] * (1 + growth * 0.17)) });
    });
  }
  return result;
}
function getPosts() {
  return [
    { platform: "LinkedIn", title: "Why most startups fail at payroll compliance", post_type: "Article", views: 12400, likes: 847, comments: 203, shares: 156 },
    { platform: "YouTube", title: "JustPaid vs Deel: Full comparison 2025", post_type: "Video", views: 8900, likes: 623, comments: 187, shares: 94 },
    { platform: "Twitter", title: "Thread: 7 payroll mistakes that cost startups $10K+", post_type: "Thread", views: 6200, likes: 412, comments: 89, shares: 201 },
    { platform: "Instagram", title: "The contractor payment checklist every founder needs", post_type: "Carousel", views: 4100, likes: 389, comments: 67, shares: 78 },
    { platform: "LinkedIn", title: "International contractor payments: what we learned", post_type: "Post", views: 3800, likes: 276, comments: 94, shares: 45 },
  ];
}
function getQoQ() {
  const makePosts = (mult: number) => [
    { title: "Why most startups fail at payroll compliance", views: Math.round(12400 * mult), platform: "LinkedIn" },
    { title: "JustPaid vs Deel: Full comparison 2025", views: Math.round(8900 * mult), platform: "YouTube" },
    { title: "Thread: 7 payroll mistakes that cost startups $10K+", views: Math.round(6200 * mult), platform: "Twitter" },
  ];
  return {
    current: {
      label: "Q2 2025",
      stats: { total_posts: 61, total_views: 58000, total_likes: 4200, avg_views: 951, engagement_rate: 3.8 },
      posts: makePosts(1),
    },
    previous: {
      label: "Q1 2025",
      stats: { total_posts: 48, total_views: 42000, total_likes: 3100, avg_views: 875, engagement_rate: 3.2 },
      posts: makePosts(0.72),
    },
  };
}

const PLATFORM_ORDER = ["YouTube", "Instagram", "LinkedIn", "Twitter"];

export default function Home() {
  const metrics = getMetrics();
  const growth = getGrowth();
  const posts = getPosts();
  const qoq = getQoQ();
  const now = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <DashboardLayout>
      {/* Hero header */}
      <div style={{
        background: "linear-gradient(135deg,rgba(108,92,231,0.12) 0%,rgba(0,206,201,0.06) 100%)",
        border: "1px solid rgba(108,92,231,0.18)", borderRadius: 20,
        padding: "1.8rem 2rem", marginBottom: "2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#6C5CE7", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.4rem" }}>
            JustPaid · Marketing Intelligence
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, letterSpacing: "-1px", color: "#E2E2EA", margin: 0 }}>
            Social Media{" "}
            <span style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE,#00CEC9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Command Center
            </span>
          </h1>
          <p style={{ color: "#8A8A9A", fontSize: "0.85rem", marginTop: "0.3rem" }}>
            Real-time performance across YouTube · Instagram · LinkedIn · X
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.68rem", color: "#5A5A6A" }}>Last updated</div>
          <div style={{ fontSize: "0.85rem", color: "#E2E2EA", fontWeight: 600, marginTop: "0.2rem" }}>{now}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", justifyContent: "flex-end" }}>
            <span style={{ background: "rgba(0,184,148,0.15)", color: "#00B894", fontSize: "0.62rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: "20px" }}>● LIVE</span>
            <span style={{ background: "rgba(108,92,231,0.12)", color: "#A29BFE", fontSize: "0.62rem", fontWeight: 700, padding: "0.2rem 0.7rem", borderRadius: "20px" }}>BigQuery</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.2rem", marginBottom: "2rem" }}>
        {PLATFORM_ORDER.map(platform => {
          const m = metrics.find((r: {platform:string}) => r.platform === platform) || {};
          const followers = Number((m as Record<string,number>).followers || 0);
          const change = Number((m as Record<string,number>).follower_change || 0);
          const engagement = Number((m as Record<string,number>).engagement_rate || 0);
          const pct = followers > 0 ? Math.abs(((change / (followers - change)) * 100)).toFixed(0) : "0";
          return (
            <KpiCard key={platform}
              platform={platform}
              icon={PLATFORM_ICONS[platform]}
              color={PLATFORM_COLORS[platform]}
              value={fmt(followers)}
              delta={`+${pct}% QoQ`}
              deltaPositive={change >= 0}
              sub="Engagement"
              subValue={`${engagement.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "#12121A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E2E2EA", marginBottom: "1rem" }}>📈 Follower Growth</div>
          <GrowthChart data={growth} />
        </div>
        <div style={{ background: "#12121A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E2E2EA", marginBottom: "1rem" }}>💥 Engagement Rate</div>
          <EngagementChart data={metrics} />
        </div>
      </div>

      {/* Top posts */}
      <div style={{ background: "#12121A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E2E2EA", marginBottom: "1rem" }}>🏆 Top Performing Content</div>
        <TopPostsTable posts={posts} />
      </div>

      {/* QoQ */}
      {qoq && <QoQSection data={qoq} />}
    </DashboardLayout>
  );
}
