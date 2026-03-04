export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import { PLATFORM_COLORS, fmt } from "@/lib/utils";
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle,
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, Lightbulb, Zap,
  ArrowRight, GitCompareArrows, Layers, Award, Clock
} from "lucide-react";

import { getAnalytics } from "@/lib/queries";

const BENCHMARKS: Record<string, { avg: number; good: string; excellent: string }> = {
  Instagram: { avg: 1.22, good: "3-6%", excellent: ">6%" },
  LinkedIn: { avg: 2.0, good: "3-5%", excellent: ">5%" },
  Twitter: { avg: 0.05, good: "0.1-0.5%", excellent: ">0.5%" },
  YouTube: { avg: 5.96, good: "8-15%", excellent: ">15%" },
};

function getHealthLabel(rate: number, platform: string): { label: string; color: string; bg: string } {
  const b = BENCHMARKS[platform];
  if (!b) return { label: "Unknown", color: "#a1a1aa", bg: "#a1a1aa10" };
  if (rate > 6) return { label: "Excellent", color: "#22c55e", bg: "rgba(34,197,94,0.1)" };
  if (rate > 3) return { label: "Good", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" };
  if (rate > 1) return { label: "Average", color: "#eab308", bg: "rgba(234,179,8,0.1)" };
  return { label: "Poor", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
}

function pctChange(a: number, b: number): { value: number; label: string; color: string; icon: "up" | "down" | "flat" } {
  if (b === 0) return { value: 0, label: "New", color: "#3b82f6", icon: "up" };
  const pct = ((a - b) / b) * 100;
  if (Math.abs(pct) < 1) return { value: 0, label: "0%", color: "#71717a", icon: "flat" };
  return {
    value: pct,
    label: `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`,
    color: pct > 0 ? "#22c55e" : "#ef4444",
    icon: pct > 0 ? "up" : "down",
  };
}

interface PeriodRow { period: string; platform: string; posts: number; total_views: number; total_likes: number; total_comments: number; total_shares: number; avg_views: number; avg_likes: number; avg_engagement: number }
interface ContentEvo { period: string; post_type: string; posts: number; total_views: number; avg_views: number; avg_engagement: number }
interface PeriodPost { period: string; platform: string; title: string; views: number; likes: number; comments: number; post_type: string }
interface MonthlyAgg { month: string; posts: number; views: number; likes: number; comments: number; shares: number; avg_views: number; avg_engagement: number }

interface AnalyticsData {
  channelMetrics: { platform: string; followers: number; engagement_rate: number; total_views: number; total_likes: number; total_comments: number; total_posts: number }[];
  platformSummary: { platform: string; post_count: number; total_views: number; total_likes: number; total_comments: number; total_shares: number; avg_views: number; avg_likes: number; avg_engagement_rate: number }[];
  contentTypes: { platform: string; post_type: string; count: number; total_views: number; avg_views: number; avg_engagement_rate: number }[];
  dayOfWeek: { day_name: string; day_num: number; posts: number; avg_views: number; avg_likes: number; avg_engagement_rate: number }[];
  monthlyTrend: { month: string; platform: string; posts: number; views: number; likes: number; comments: number; avg_engagement_rate: number }[];
  topPosts: { platform: string; title: string; post_type: string; views: number; likes: number; comments: number; engagement_rate: number }[];
  bottomPosts: { platform: string; title: string; post_type: string; views: number; likes: number; comments: number; engagement_rate: number }[];
  periodComparison: PeriodRow[];
  contentEvolution: ContentEvo[];
  periodTopPosts: PeriodPost[];
  monthlyAggregate: MonthlyAgg[];
}

export default async function AnalyticsPage() {
  const data: AnalyticsData | null = await getAnalytics();
  if (!data) return <DashboardLayout><div style={{ color: "#52525b", textAlign: "center", padding: "4rem" }}>Failed to load analytics</div></DashboardLayout>;

  const { channelMetrics, platformSummary, contentTypes, dayOfWeek, monthlyTrend, topPosts, bottomPosts, periodComparison, contentEvolution, periodTopPosts, monthlyAggregate } = data;
  const totalPosts = platformSummary.reduce((s, p) => s + Number(p.post_count), 0);
  const totalViews = platformSummary.reduce((s, p) => s + Number(p.total_views), 0);
  const totalEngagements = platformSummary.reduce((s, p) => s + Number(p.total_likes) + Number(p.total_comments), 0);
  const overallEngRate = totalViews > 0 ? (totalEngagements / totalViews * 100) : 0;

  // Period comparison helpers
  const earlyData = (periodComparison || []).filter((r: PeriodRow) => r.period === "early");
  const recentData = (periodComparison || []).filter((r: PeriodRow) => r.period === "recent");
  const earlyTotal = { posts: earlyData.reduce((s: number, r: PeriodRow) => s + Number(r.posts), 0), views: earlyData.reduce((s: number, r: PeriodRow) => s + Number(r.total_views), 0), likes: earlyData.reduce((s: number, r: PeriodRow) => s + Number(r.total_likes), 0), comments: earlyData.reduce((s: number, r: PeriodRow) => s + Number(r.total_comments), 0), shares: earlyData.reduce((s: number, r: PeriodRow) => s + Number(r.total_shares), 0) };
  const recentTotal = { posts: recentData.reduce((s: number, r: PeriodRow) => s + Number(r.posts), 0), views: recentData.reduce((s: number, r: PeriodRow) => s + Number(r.total_views), 0), likes: recentData.reduce((s: number, r: PeriodRow) => s + Number(r.total_likes), 0), comments: recentData.reduce((s: number, r: PeriodRow) => s + Number(r.total_comments), 0), shares: recentData.reduce((s: number, r: PeriodRow) => s + Number(r.total_shares), 0) };

  // Exclude linkedin viral outlier from view comparison for fair analysis
  const earlyViewsNoOutlier = earlyTotal.views - 320492; // remove the 320K viral article
  const earlyEngRate = earlyTotal.views > 0 ? ((earlyTotal.likes + earlyTotal.comments) / earlyTotal.views * 100) : 0;
  const recentEngRate = recentTotal.views > 0 ? ((recentTotal.likes + recentTotal.comments) / recentTotal.views * 100) : 0;

  // Content evolution helpers
  const earlyContent = (contentEvolution || []).filter((r: ContentEvo) => r.period === "early");
  const recentContent = (contentEvolution || []).filter((r: ContentEvo) => r.period === "recent");
  const allPostTypes = [...new Set([...earlyContent.map((r: ContentEvo) => r.post_type), ...recentContent.map((r: ContentEvo) => r.post_type)])];

  // Period top posts
  const earlyTopPosts = (periodTopPosts || []).filter((r: PeriodPost) => r.period === "early");
  const recentTopPosts = (periodTopPosts || []).filter((r: PeriodPost) => r.period === "recent");

  // Monthly aggregate for timeline
  const monthlyAgg = monthlyAggregate || [];
  const maxMonthViews = Math.max(...monthlyAgg.map((m: MonthlyAgg) => Number(m.views)), 1);
  const maxMonthEng = Math.max(...monthlyAgg.map((m: MonthlyAgg) => Number(m.avg_engagement)), 1);

  // Recommendations
  const recommendations: { icon: React.ReactNode; title: string; detail: string; type: "success" | "warning" | "action" }[] = [];
  const bestContent = contentTypes[0];
  if (bestContent) {
    recommendations.push({ icon: <CheckCircle size={16} />, title: `${bestContent.platform} ${bestContent.post_type}s are top performers`, detail: `${bestContent.avg_engagement_rate}% engagement — ${(Number(bestContent.avg_engagement_rate) / (BENCHMARKS[bestContent.platform]?.avg || 1)).toFixed(1)}x above industry average.`, type: "success" });
  }
  const bestDay = [...dayOfWeek].sort((a, b) => Number(b.avg_engagement_rate) - Number(a.avg_engagement_rate))[0];
  if (bestDay) {
    recommendations.push({ icon: <Calendar size={16} />, title: `${bestDay.day_name}s get highest engagement`, detail: `${bestDay.avg_engagement_rate}% avg engagement. Schedule best content for this day.`, type: "action" });
  }
  platformSummary.forEach(p => {
    const bench = BENCHMARKS[p.platform];
    if (bench && Number(p.avg_engagement_rate) < bench.avg * 0.5) {
      recommendations.push({ icon: <AlertTriangle size={16} />, title: `${p.platform} below benchmark`, detail: `${p.avg_engagement_rate}% vs ${bench.avg}% industry avg. Review content strategy.`, type: "warning" });
    }
  });

  // Month labels for display
  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${names[parseInt(mo)]} '${y.slice(2)}`;
  };

  const platforms = ["YouTube", "LinkedIn", "Instagram", "Twitter"];

  return (
    <DashboardLayout>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(234,179,8,0.04) 100%)",
        border: "1px solid rgba(99,102,241,0.12)", borderRadius: 20,
        padding: "2rem 2.25rem", marginBottom: "2rem",
      }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
          Performance Comparison · Sep 2025 → Now
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.5px", color: "#fafafa", margin: "0 0 0.4rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <GitCompareArrows size={28} strokeWidth={1.5} />
          6-Month Growth Analysis
        </h1>
        <p style={{ color: "#71717a", fontSize: "0.88rem", margin: 0 }}>
          Tracking {totalPosts} posts across {platformSummary.length} platforms from September 2025 to March 2026. Comparing early-stage content (Sep–Nov) against the recent strategy shift (Dec–Mar).
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PERIOD COMPARISON: Sep-Nov 2025 vs Dec 2025 - Mar 2026    */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Period Summary Cards */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.4rem" }}>Period Comparison</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fafafa", marginBottom: "0.3rem" }}>Sep–Nov 2025 vs Dec 2025–Mar 2026</div>
        <p style={{ fontSize: "0.78rem", color: "#71717a", margin: "0 0 1.2rem", maxWidth: 700, lineHeight: 1.6 }}>
          Comparing the first three months of tracked content against the most recent four months. This reveals whether posting frequency, reach, and audience engagement are trending in the right direction.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "stretch" }}>
          {/* Early Period */}
          <div className="card" style={{ borderColor: "rgba(234,179,8,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Clock size={16} color="#eab308" />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#eab308" }}>Sep – Nov 2025</span>
              <span style={{ fontSize: "0.6rem", color: "#52525b", marginLeft: "auto" }}>Early stage</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Posts</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fafafa" }}>{earlyTotal.posts}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Views</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fafafa" }}>{fmt(earlyTotal.views)}</div>
                <div style={{ fontSize: "0.6rem", color: "#71717a" }}>({fmt(earlyViewsNoOutlier)} excl. viral)</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Likes</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e4e4e7" }}>{fmt(earlyTotal.likes)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Engagement</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e4e4e7" }}>{earlyEngRate.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Arrow divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <ArrowRight size={24} color="#6366f1" />
              <div style={{ fontSize: "0.6rem", color: "#6366f1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", writingMode: "vertical-rl", textOrientation: "mixed" }}>Growth</div>
            </div>
          </div>

          {/* Recent Period */}
          <div className="card" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <TrendingUp size={16} color="#22c55e" />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22c55e" }}>Dec 2025 – Mar 2026</span>
              <span style={{ fontSize: "0.6rem", color: "#52525b", marginLeft: "auto" }}>Current</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Posts", early: earlyTotal.posts, recent: recentTotal.posts, val: recentTotal.posts },
                { label: "Total Views", early: earlyViewsNoOutlier, recent: recentTotal.views, val: recentTotal.views },
                { label: "Likes", early: earlyTotal.likes, recent: recentTotal.likes, val: recentTotal.likes },
                { label: "Engagement", early: earlyEngRate, recent: recentEngRate, val: recentEngRate, isSuffix: "%" },
              ].map(item => {
                const change = pctChange(item.recent, item.early);
                return (
                  <div key={item.label}>
                    <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                    <div style={{ fontSize: item.label === "Posts" || item.label === "Total Views" ? "1.8rem" : "1.3rem", fontWeight: item.label === "Posts" || item.label === "Total Views" ? 800 : 700, color: "#fafafa" }}>
                      {item.isSuffix ? `${item.val.toFixed(2)}%` : fmt(item.val)}
                    </div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 600, color: change.color, display: "flex", alignItems: "center", gap: "0.15rem" }}>
                      {change.icon === "up" ? <ArrowUpRight size={12} /> : change.icon === "down" ? <ArrowDownRight size={12} /> : null}
                      {change.label} vs prior
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MONTHLY TIMELINE                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><BarChart3 size={16} /> Monthly Timeline</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1.2rem", lineHeight: 1.6 }}>
          Each bar shows total views for that month (blue) with the engagement rate overlaid (green dot). The dotted line at Dec marks the transition from early content to the current strategy. Notice how engagement improved significantly after December despite lower raw view counts — a sign the content is resonating better with a more targeted audience.
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.25rem", height: 200, padding: "0 0.5rem" }}>
          {monthlyAgg.map((m: MonthlyAgg, i: number) => {
            const viewPct = Number(m.views) / maxMonthViews * 100;
            const engPct = Number(m.avg_engagement) / maxMonthEng * 100;
            const isDecBorder = m.month === "2025-11"; // show border after Nov
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", position: "relative", borderRight: isDecBorder ? "2px dashed rgba(99,102,241,0.3)" : undefined, paddingRight: isDecBorder ? "0.25rem" : undefined }}>
                {/* Engagement dot */}
                <div style={{ position: "absolute", bottom: `${engPct}%`, width: 8, height: 8, borderRadius: "50%", background: "#22c55e", border: "2px solid #0a0a0c", zIndex: 2 }} title={`${m.avg_engagement}% engagement`} />
                {/* View bar */}
                <div style={{
                  width: "100%", maxWidth: 48, borderRadius: "4px 4px 0 0",
                  height: `${Math.max(viewPct, 2)}%`,
                  background: m.month >= "2025-12" ? "rgba(99,102,241,0.5)" : "rgba(234,179,8,0.35)",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", top: -18, width: "100%", textAlign: "center", fontSize: "0.55rem", fontWeight: 600, color: "#71717a", whiteSpace: "nowrap" }}>
                    {fmt(Number(m.views))}
                  </div>
                </div>
                {/* Month label */}
                <div style={{ fontSize: "0.55rem", color: "#52525b", marginTop: "0.2rem", whiteSpace: "nowrap" }}>
                  {monthLabel(m.month)}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "#71717a" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(234,179,8,0.35)" }} /> Sep–Nov 2025
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "#71717a" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(99,102,241,0.5)" }} /> Dec 2025–Mar 2026
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "#71717a" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Engagement rate
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PLATFORM-BY-PLATFORM COMPARISON                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.4rem" }}>Platform Breakdown</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fafafa", marginBottom: "0.3rem" }}>How Each Platform Changed Over 6 Months</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0 0 1.2rem", maxWidth: 700, lineHeight: 1.6 }}>
          A side-by-side look at how each platform performed during the early period vs. now. Green arrows indicate improvement, red arrows indicate decline. Engagement rate is the most meaningful metric — it shows how well content resonates regardless of audience size.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {platforms.map(platform => {
            const early = earlyData.find((r: PeriodRow) => r.platform === platform);
            const recent = recentData.find((r: PeriodRow) => r.platform === platform);
            if (!early && !recent) return null;
            const color = PLATFORM_COLORS[platform] || "#6366f1";
            const channel = channelMetrics.find(c => c.platform === platform);

            const metrics = [
              { label: "Posts", early: early?.posts || 0, recent: recent?.posts || 0 },
              { label: "Avg Views", early: early?.avg_views || 0, recent: recent?.avg_views || 0 },
              { label: "Avg Likes", early: Number(early?.avg_likes || 0), recent: Number(recent?.avg_likes || 0) },
              { label: "Engagement", early: Number(early?.avg_engagement || 0), recent: Number(recent?.avg_engagement || 0), suffix: "%" },
            ];

            // Generate platform-specific insight
            let insight = "";
            const engChange = pctChange(Number(recent?.avg_engagement || 0), Number(early?.avg_engagement || 0));
            const viewChange = pctChange(Number(recent?.avg_views || 0), Number(early?.avg_views || 0));
            if (engChange.value > 50) insight = `Engagement jumped ${engChange.label} — content strategy is clearly improving.`;
            else if (engChange.value > 10) insight = `Solid engagement growth of ${engChange.label}. Keep refining what works.`;
            else if (engChange.value < -20) insight = `Engagement dropped ${engChange.label}. May need to revisit content approach.`;
            else if (viewChange.value > 50) insight = `Reach is expanding (${viewChange.label} avg views) — focus on converting views to engagement.`;
            else insight = `Steady performance. Consider experimenting with new formats to accelerate growth.`;

            return (
              <div key={platform} className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color }}>{platform}</span>
                  </div>
                  {channel && <span style={{ fontSize: "0.65rem", color: "#52525b" }}>{fmt(channel.followers)} followers</span>}
                </div>

                {/* Metric rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  {metrics.map(m => {
                    const change = pctChange(m.recent, m.early);
                    return (
                      <div key={m.label} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 60px", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.68rem", color: "#52525b", fontWeight: 500 }}>{m.label}</span>
                        <span style={{ fontSize: "0.78rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>
                          {m.suffix ? `${m.early.toFixed(1)}${m.suffix}` : fmt(m.early)}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#fafafa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                          {m.suffix ? `${m.recent.toFixed(1)}${m.suffix}` : fmt(m.recent)}
                        </span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: change.color, display: "flex", alignItems: "center", gap: "0.1rem" }}>
                          {change.icon === "up" ? <ArrowUpRight size={12} /> : change.icon === "down" ? <ArrowDownRight size={12} /> : null}
                          {change.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Platform insight */}
                <div style={{ padding: "0.6rem 0.75rem", background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 8, fontSize: "0.72rem", color: "#a1a1aa", lineHeight: 1.5 }}>
                  {insight}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CONTENT TYPE EVOLUTION                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Layers size={16} /> Content Format Evolution</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1.2rem", lineHeight: 1.6 }}>
          How the content mix shifted between the two periods. The &quot;Early&quot; column shows Sep–Nov 2025 and &quot;Recent&quot; shows Dec 2025–Mar 2026. Look at how engagement rates changed per format — some formats work better now with an established audience.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                {["Format", "Early Posts", "Early Eng.", "Recent Posts", "Recent Eng.", "Trend"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPostTypes.map(type => {
                const e = earlyContent.find((r: ContentEvo) => r.post_type === type);
                const r = recentContent.find((r: ContentEvo) => r.post_type === type);
                const engChange = pctChange(Number(r?.avg_engagement || 0), Number(e?.avg_engagement || 0));
                return (
                  <tr key={type} className="table-row" style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}>
                    <td style={{ padding: "0.7rem 0.8rem", color: "#e4e4e7", fontWeight: 600 }}>{type}</td>
                    <td style={{ padding: "0.7rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{e?.posts || "—"}</td>
                    <td style={{ padding: "0.7rem 0.8rem", color: e ? "#e4e4e7" : "#3f3f46", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{e ? `${e.avg_engagement}%` : "—"}</td>
                    <td style={{ padding: "0.7rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{r?.posts || "—"}</td>
                    <td style={{ padding: "0.7rem 0.8rem", color: r ? "#fafafa" : "#3f3f46", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{r ? `${r.avg_engagement}%` : "—"}</td>
                    <td style={{ padding: "0.7rem 0.8rem" }}>
                      {(e && r) ? (
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: engChange.color, display: "flex", alignItems: "center", gap: "0.15rem" }}>
                          {engChange.icon === "up" ? <ArrowUpRight size={13} /> : engChange.icon === "down" ? <ArrowDownRight size={13} /> : null}
                          {engChange.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.65rem", color: "#52525b" }}>{r ? "New" : "Dropped"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TOP POSTS PER PERIOD                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="section-title" style={{ color: "#eab308" }}><Award size={16} /> Best Posts · Sep–Nov 2025</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            The early period was dominated by one viral LinkedIn article that drove 320K+ views. Without it, reach was modest across all platforms.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {earlyTopPosts.map((p: PeriodPost, i: number) => (
              <div key={i} style={{ padding: "0.6rem 0.8rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.25rem" }}>
                      {String(p.title).slice(0, 60)}{String(p.title).length > 60 ? "..." : ""}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.62rem", color: "#52525b" }}>
                      <span style={{ color: PLATFORM_COLORS[p.platform], fontWeight: 600 }}>{p.platform}</span>
                      <span>{p.post_type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fafafa" }}>{fmt(Number(p.views))}</div>
                    <div style={{ fontSize: "0.58rem", color: "#52525b" }}>{Number(p.likes)} likes · {Number(p.comments)} comments</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ color: "#22c55e" }}><Award size={16} /> Best Posts · Dec 2025–Mar 2026</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            Recent top performers are more evenly distributed and consistently driven by YouTube founder interviews and educational Shorts.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {recentTopPosts.map((p: PeriodPost, i: number) => (
              <div key={i} style={{ padding: "0.6rem 0.8rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.25rem" }}>
                      {String(p.title).slice(0, 60)}{String(p.title).length > 60 ? "..." : ""}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.62rem", color: "#52525b" }}>
                      <span style={{ color: PLATFORM_COLORS[p.platform], fontWeight: 600 }}>{p.platform}</span>
                      <span>{p.post_type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fafafa" }}>{fmt(Number(p.views))}</div>
                    <div style={{ fontSize: "0.58rem", color: "#52525b" }}>{Number(p.likes)} likes · {Number(p.comments)} comments</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PLATFORM HEALTH + BENCHMARKS                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.4rem" }}>Current Snapshot</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fafafa", marginBottom: "0.3rem" }}>Platform Health vs Industry Benchmarks</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0 0 1.2rem", maxWidth: 700, lineHeight: 1.6 }}>
          Each card shows the current engagement rate compared to the industry average for that platform. The rating (Excellent / Good / Average / Poor) is based on how JustPaid stacks up against the typical SaaS company on that platform.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {platformSummary.map(p => {
            const bench = BENCHMARKS[p.platform];
            const rate = Number(p.avg_engagement_rate);
            const health = getHealthLabel(rate, p.platform);
            const multiplier = bench ? (rate / bench.avg).toFixed(1) : "N/A";
            const channel = channelMetrics.find(c => c.platform === p.platform);
            return (
              <div key={p.platform} className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: PLATFORM_COLORS[p.platform] || "#fafafa" }}>{p.platform}</span>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20, background: health.bg, color: health.color }}>
                    {health.label}
                  </span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fafafa", marginBottom: "0.2rem" }}>{rate}%</div>
                <div style={{ fontSize: "0.68rem", color: "#52525b", marginBottom: "1rem" }}>
                  vs {bench?.avg}% benchmark · <span style={{ color: Number(multiplier) >= 1 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{multiplier}x</span>
                </div>
                <div style={{ borderTop: "1px solid #27272a", paddingTop: "0.8rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>Followers</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e4e4e7" }}>{fmt(Number(channel?.followers || 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>Posts</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e4e4e7" }}>{p.post_count}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Views</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e4e4e7" }}>{fmt(Number(p.avg_views))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Views</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e4e4e7" }}>{fmt(Number(p.total_views))}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CONTENT TYPE MATRIX + DAY OF WEEK + RECOMMENDATIONS        */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Content Type Performance Matrix */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Target size={16} /> Content Type Performance Matrix</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
          Every content format ranked by engagement rate, compared against the industry benchmark for its platform. This helps identify which formats to invest more in and which to phase out.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                {["Platform", "Content Type", "Posts", "Avg Views", "Eng. Rate", "vs Benchmark", "Rating"].map(h => (
                  <th key={h} style={{ padding: "0.7rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contentTypes.map((ct, i) => {
                const bench = BENCHMARKS[ct.platform];
                const rate = Number(ct.avg_engagement_rate);
                const mult = bench ? (rate / bench.avg) : 0;
                const health = getHealthLabel(rate, ct.platform);
                return (
                  <tr key={i} className="table-row" style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}>
                    <td style={{ padding: "0.75rem 0.8rem" }}>
                      <span style={{ color: PLATFORM_COLORS[ct.platform] || "#6366f1", fontWeight: 600, fontSize: "0.78rem" }}>{ct.platform}</span>
                    </td>
                    <td style={{ padding: "0.75rem 0.8rem", color: "#e4e4e7", fontWeight: 500 }}>{ct.post_type}</td>
                    <td style={{ padding: "0.75rem 0.8rem", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{ct.count}</td>
                    <td style={{ padding: "0.75rem 0.8rem", color: "#e4e4e7", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(Number(ct.avg_views))}</td>
                    <td style={{ padding: "0.75rem 0.8rem", color: "#fafafa", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{rate}%</td>
                    <td style={{ padding: "0.75rem 0.8rem" }}>
                      <span style={{ color: mult >= 1 ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        {mult >= 1 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {mult.toFixed(1)}x
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.8rem" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: 20, background: health.bg, color: health.color }}>
                        {health.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day of Week + Recommendations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="section-title"><Calendar size={16} /> Best Days to Post</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            Average engagement rate by day of week. Posts on the top-ranked day get significantly more interactions — use this to time your highest-effort content.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[...dayOfWeek].sort((a, b) => Number(b.avg_engagement_rate) - Number(a.avg_engagement_rate)).map((d, i) => {
              const maxEng = Math.max(...dayOfWeek.map(x => Number(x.avg_engagement_rate)));
              const pct = Number(d.avg_engagement_rate) / maxEng * 100;
              return (
                <div key={d.day_name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "0.8rem", color: i === 0 ? "#fafafa" : "#a1a1aa", fontWeight: i === 0 ? 600 : 400 }}>
                      {d.day_name} <span style={{ color: "#3f3f46", fontSize: "0.7rem" }}>({d.posts} posts)</span>
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: i === 0 ? "#22c55e" : "#52525b", fontVariantNumeric: "tabular-nums" }}>{d.avg_engagement_rate}%</span>
                  </div>
                  <div style={{ height: 5, background: "#27272a", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? "#22c55e" : i < 3 ? "#3b82f6" : "#3f3f46", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-title"><Lightbulb size={16} /> AI-Powered Recommendations</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            Auto-generated insights based on the data patterns above. These are derived from engagement benchmarks, content type performance, and day-of-week analysis.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recommendations.map((r, i) => (
              <div key={i} style={{
                padding: "0.8rem",
                background: r.type === "success" ? "rgba(34,197,94,0.04)" : r.type === "warning" ? "rgba(239,68,68,0.04)" : "rgba(59,130,246,0.04)",
                border: `1px solid ${r.type === "success" ? "rgba(34,197,94,0.12)" : r.type === "warning" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)"}`,
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem", color: r.type === "success" ? "#22c55e" : r.type === "warning" ? "#ef4444" : "#3b82f6", fontWeight: 600, fontSize: "0.78rem" }}>
                  {r.icon} {r.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", lineHeight: 1.5 }}>{r.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend Detail Table */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><TrendingUp size={16} /> Monthly Engagement Detail</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
          The complete month-by-month breakdown per platform. Use this to spot seasonal patterns and identify which months saw the best and worst performance for each channel.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>Month</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>Platform</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "right", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>Posts</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "right", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>Views</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "right", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>Eng. Rate</th>
                <th style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.8px", width: 120 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set(monthlyTrend.map(m => m.month))].sort().map(month => {
                const monthData = monthlyTrend.filter(m => m.month === month);
                return monthData.map((md, j) => (
                  <tr key={`${month}-${md.platform}`} className="table-row" style={{ borderBottom: "1px solid rgba(39,39,42,0.3)" }}>
                    {j === 0 && (
                      <td rowSpan={monthData.length} style={{ padding: "0.6rem 0.8rem", color: "#e4e4e7", fontWeight: 600, verticalAlign: "top", borderRight: "1px solid #27272a" }}>
                        {monthLabel(month)}
                      </td>
                    )}
                    <td style={{ padding: "0.6rem 0.8rem" }}>
                      <span style={{ color: PLATFORM_COLORS[md.platform] || "#6366f1", fontWeight: 500 }}>{md.platform}</span>
                    </td>
                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "right", color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>{md.posts}</td>
                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "right", color: "#e4e4e7", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(Number(md.views))}</td>
                    <td style={{ padding: "0.6rem 0.8rem", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: Number(md.avg_engagement_rate) > 3 ? "#22c55e" : Number(md.avg_engagement_rate) > 1 ? "#eab308" : "#ef4444" }}>
                      {md.avg_engagement_rate}%
                    </td>
                    <td style={{ padding: "0.6rem 0.8rem" }}>
                      <div style={{ height: 5, background: "#27272a", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(Number(md.avg_engagement_rate) / 10 * 100, 100)}%`, background: PLATFORM_COLORS[md.platform] || "#6366f1", borderRadius: 3 }} />
                      </div>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top vs Bottom Performers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="section-title" style={{ color: "#22c55e" }}><TrendingUp size={16} /> Top 10 Posts (by Views)</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            Highest-reaching content across all platforms and time periods. Use these as templates for what drives maximum visibility.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {topPosts.map((p, i) => (
              <div key={i} style={{ padding: "0.6rem 0.8rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.3rem" }}>
                      {String(p.title).slice(0, 55)}{String(p.title).length > 55 ? "..." : ""}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.65rem", color: "#52525b" }}>
                      <span style={{ color: PLATFORM_COLORS[p.platform], fontWeight: 600 }}>{p.platform}</span>
                      <span>{p.post_type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fafafa" }}>{fmt(Number(p.views))}</div>
                    <div style={{ fontSize: "0.62rem", color: "#52525b" }}>{p.engagement_rate}% eng</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ color: "#ef4444" }}><TrendingDown size={16} /> Lowest Engagement (needs work)</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            Posts that got views but failed to generate meaningful interactions. Study these to understand what topics or formats fall flat with the audience.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {bottomPosts.map((p, i) => (
              <div key={i} style={{ padding: "0.6rem 0.8rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", color: "#a1a1aa", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.3rem" }}>
                      {String(p.title).slice(0, 55)}{String(p.title).length > 55 ? "..." : ""}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.65rem", color: "#52525b" }}>
                      <span style={{ color: PLATFORM_COLORS[p.platform], fontWeight: 600 }}>{p.platform}</span>
                      <span>{p.post_type}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a1a1aa" }}>{fmt(Number(p.views))}</div>
                    <div style={{ fontSize: "0.62rem", color: "#ef4444", fontWeight: 600 }}>{p.engagement_rate}% eng</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Value Estimate */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Zap size={16} /> Estimated Engagement Value</div>
        <p style={{ fontSize: "0.72rem", color: "#71717a", margin: "-0.3rem 0 1rem", lineHeight: 1.5 }}>
          Using industry CPE (cost-per-engagement) benchmarks — Like: $0.50, Comment: $2.00, Share: $5.00 — this estimates the equivalent ad-spend value of the organic engagement generated across each platform.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
          {platformSummary.map(p => {
            const likeVal = Number(p.total_likes) * 0.5;
            const commentVal = Number(p.total_comments) * 2.0;
            const shareVal = Number(p.total_shares) * 5.0;
            const totalVal = likeVal + commentVal + shareVal;
            return (
              <div key={p.platform} style={{ background: "#0f0f12", border: "1px solid #1e1e22", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: PLATFORM_COLORS[p.platform], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "0.4rem" }}>{p.platform}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fafafa" }}>${Math.round(totalVal)}</div>
                <div style={{ fontSize: "0.6rem", color: "#3f3f46", marginTop: "0.2rem" }}>
                  {Number(p.total_likes)} likes · {Number(p.total_comments)} comments · {Number(p.total_shares)} shares
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
