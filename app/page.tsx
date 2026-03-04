export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { GrowthChartNoSSR as GrowthChart, EngagementChartNoSSR as EngagementChart } from "@/components/ChartsWrapper";
import TopPostsTable from "@/components/TopPostsTable";
import QoQSection from "@/components/QoQSection";
import { PLATFORM_COLORS, fmt } from "@/lib/utils";
import { getMetrics, getGrowth, getPosts, getQoQ } from "@/lib/queries";

const PLATFORM_ORDER = ["YouTube", "Instagram", "LinkedIn", "Twitter"];

export default async function Home() {
  const [metrics, growth, posts, qoq] = await Promise.all([getMetrics(), getGrowth(), getPosts(), getQoQ()]);
  const now = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <DashboardLayout>
      {/* Hero header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 100%)",
        border: "1px solid rgba(99,102,241,0.12)", borderRadius: 20,
        padding: "2rem 2.25rem", marginBottom: "2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
            JustPaid · Marketing Intelligence
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.5px", color: "#fafafa", margin: 0 }}>
            Social Media{" "}
            <span className="grad-text">Command Center</span>
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Real-time performance across YouTube, Instagram, LinkedIn & X
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.68rem", color: "#52525b", fontWeight: 500 }}>Last updated</div>
          <div style={{ fontSize: "0.85rem", color: "#e4e4e7", fontWeight: 600, marginTop: "0.2rem" }}>{now}</div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", justifyContent: "flex-end" }}>
            <span className="badge badge-live" style={{ fontWeight: 700 }}>LIVE</span>
            <span className="badge badge-source" style={{ fontWeight: 700 }}>BigQuery</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {PLATFORM_ORDER.map(platform => {
          const m = metrics.find((r: {platform:string}) => r.platform === platform) || {};
          const followers = Number(m.followers || 0);
          const change = Number(m.follower_change || 0);
          const engagement = Number(m.engagement_rate || 0);
          const pct = followers > 0 ? Math.abs(((change / (followers - change)) * 100)).toFixed(0) : "0";
          return (
            <KpiCard key={platform}
              platform={platform}
              color={PLATFORM_COLORS[platform]}
              value={fmt(followers)}
              delta={`${pct}% QoQ`}
              deltaPositive={change >= 0}
              sub="Engagement"
              subValue={`${engagement.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="section-title">Follower Growth</div>
          <GrowthChart data={growth} />
        </div>
        <div className="card">
          <div className="section-title">Engagement Rate</div>
          <EngagementChart data={metrics} />
        </div>
      </div>

      {/* Top posts */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title">Top Performing Content</div>
        <TopPostsTable posts={posts} />
      </div>

      {/* QoQ */}
      {qoq && <QoQSection data={qoq} />}
    </DashboardLayout>
  );
}
