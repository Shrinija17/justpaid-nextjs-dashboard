import DashboardLayout from "./DashboardLayout";
import SingleGrowthChart from "./SingleGrowthChart";
import TopPostsTable from "./TopPostsTable";
import { fmt, PLATFORM_COLORS } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, Activity, Eye, Heart } from "lucide-react";

interface PlatformDetailPageProps {
  platform: string;
  icon: React.ReactNode;
  metrics: { platform: string; followers: number; follower_change: number; engagement_rate: number }[];
  growth: { platform: string; date: { value: string } | string; followers: number }[];
  posts: { platform: string; title: string; post_type: string; views: number; likes: number; comments: number }[];
}

export default function PlatformDetailPage({ platform, icon, metrics, growth, posts }: PlatformDetailPageProps) {
  const color = PLATFORM_COLORS[platform] || "#6366f1";
  const m = metrics.find(r => r.platform === platform);
  const followers = Number(m?.followers || 0);
  const change = Number(m?.follower_change || 0);
  const engagement = Number(m?.engagement_rate || 0);
  const changePositive = change >= 0;
  const changePct = followers > 0 ? Math.abs(((change / (followers - change)) * 100)).toFixed(1) : "0";

  const platformPosts = posts.filter(p => p.platform === platform);
  const totalViews = platformPosts.reduce((sum, p) => sum + Number(p.views || 0), 0);
  const totalLikes = platformPosts.reduce((sum, p) => sum + Number(p.likes || 0), 0);

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: 20, padding: "2rem 2.25rem", marginBottom: "2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: color + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.3rem" }}>
              Platform Analytics
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.5px", color: "#fafafa", margin: 0 }}>
              {platform}
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="badge badge-live" style={{ fontWeight: 700 }}>LIVE</span>
          <span className="badge badge-source" style={{ fontWeight: 700 }}>BigQuery</span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Followers", value: fmt(followers), icon: <Users size={16} color={color} />, sub: null },
          { label: "QoQ Change", value: `${changePositive ? "+" : ""}${fmt(change)}`, icon: changePositive ? <TrendingUp size={16} color="#22c55e" /> : <TrendingDown size={16} color="#ef4444" />, sub: `${changePct}%` },
          { label: "Engagement Rate", value: `${engagement.toFixed(1)}%`, icon: <Activity size={16} color={color} />, sub: null },
          { label: "Total Views", value: fmt(totalViews), icon: <Eye size={16} color={color} />, sub: `${platformPosts.length} posts` },
        ].map(({ label, value, icon: kIcon, sub }) => (
          <div key={label} className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kIcon}
              </div>
            </div>
            <div style={{ fontSize: "0.6rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.3rem", fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fafafa", fontVariantNumeric: "tabular-nums" }}>{value}</div>
            {sub && <div style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.2rem" }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title">
          <TrendingUp size={16} /> Follower Growth (90 days)
        </div>
        <SingleGrowthChart data={growth} platform={platform} color={color} />
      </div>

      {/* Top Posts */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={16} /> Top Performing Content
          </span>
          <span style={{ fontSize: "0.7rem", color: "#52525b", fontWeight: 400 }}>{platformPosts.length} posts</span>
        </div>
        <TopPostsTable posts={platformPosts} />
      </div>

      {/* Quick Stats */}
      {platformPosts.length > 0 && (
        <div className="card">
          <div className="section-title">Content Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
            {Object.entries(
              platformPosts.reduce<Record<string, number>>((acc, p) => {
                acc[p.post_type] = (acc[p.post_type] || 0) + 1;
                return acc;
              }, {})
            ).sort(([,a],[,b]) => b - a).map(([type, count]) => (
              <div key={type} style={{
                background: "#0f0f12", border: "1px solid #1e1e22", borderRadius: 10,
                padding: "0.8rem", textAlign: "center",
              }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fafafa" }}>{count}</div>
                <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: "0.2rem" }}>{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
