"use client";
import { PLATFORM_COLORS, fmt } from "@/lib/utils";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Layers, Award,
  Clock, ArrowRight, BarChart3, Zap, Target, Eye, Heart, MessageCircle,
  Share2, FileText
} from "lucide-react";

/* ─── types ─── */
interface Monthly { month: string; posts: number; views: number; likes: number; comments: number; shares: number; avg_views: number; avg_likes: number; avg_engagement: number }
interface PostType { post_type: string; count: number; total_views: number; total_likes: number; total_comments: number; avg_views: number; avg_likes: number; avg_engagement: number }
interface Period { period: string; posts: number; total_views: number; total_likes: number; total_comments: number; total_shares: number; avg_views: number; avg_likes: number; avg_engagement: number }
interface ContentEvo { period: string; post_type: string; posts: number; total_views: number; avg_views: number; avg_engagement: number }
interface Post { title: string; post_type: string; views: number; likes: number; comments: number; shares: number; date?: string; published_at?: string; engagement_rate: number }
interface ChannelMetrics { followers: number; follower_change: number | null; total_posts: number; total_views: number; total_likes: number; total_comments: number; engagement_rate: number }

interface Props {
  platform: string;
  icon: React.ReactNode;
  data: {
    monthly: Monthly[];
    postTypes: PostType[];
    periodComparison: Period[];
    contentEvolution: ContentEvo[];
    topEarly: Post[];
    topRecent: Post[];
    allPosts: Post[];
    channelMetrics: ChannelMetrics | null;
  };
  benchmarkAvg: number;
  benchmarkLabel: string;
}

/* ─── helpers ─── */
function pct(a: number, b: number) {
  if (b === 0) return { val: 0, label: "New", color: "#3b82f6", up: true };
  const p = ((a - b) / b) * 100;
  if (Math.abs(p) < 1) return { val: 0, label: "—", color: "#71717a", up: true };
  return { val: p, label: `${p > 0 ? "+" : ""}${p.toFixed(0)}%`, color: p > 0 ? "#22c55e" : "#ef4444", up: p > 0 };
}

function monthLabel(m: string) {
  const names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, mo] = m.split("-");
  return `${names[parseInt(mo)]} '${y.slice(2)}`;
}

/* ─── component ─── */
export default function PlatformStoryPage({ platform, icon, data, benchmarkAvg, benchmarkLabel }: Props) {
  const { monthly, postTypes, periodComparison, contentEvolution, topEarly, topRecent, allPosts, channelMetrics } = data;
  const color = PLATFORM_COLORS[platform] || "#6366f1";

  const early = periodComparison.find(r => r.period === "early");
  const recent = periodComparison.find(r => r.period === "recent");

  // Compute totals
  const totalPosts = allPosts.length;
  const totalViews = allPosts.reduce((s, p) => s + Number(p.views), 0);
  const totalLikes = allPosts.reduce((s, p) => s + Number(p.likes), 0);
  const totalComments = allPosts.reduce((s, p) => s + Number(p.comments), 0);

  // First and last month for range label
  const firstMonth = monthly[0]?.month || "2025-09";
  const lastMonth = monthly[monthly.length - 1]?.month || "2026-03";

  // Growth story headline
  const engGrowth = pct(Number(recent?.avg_engagement || 0), Number(early?.avg_engagement || 0));
  const viewGrowth = pct(Number(recent?.avg_views || 0), Number(early?.avg_views || 0));
  const postGrowth = pct(Number(recent?.posts || 0), Number(early?.posts || 0));

  // For the timeline
  const maxViews = Math.max(...monthly.map(m => Number(m.views)), 1);
  const maxEng = Math.max(...monthly.map(m => Number(m.avg_engagement)), 1);

  // Content evolution helpers
  const earlyContent = contentEvolution.filter(r => r.period === "early");
  const recentContent = contentEvolution.filter(r => r.period === "recent");
  const allTypes = [...new Set([...earlyContent.map(r => r.post_type), ...recentContent.map(r => r.post_type)])];

  // Generate narrative insights
  const insights: string[] = [];
  if (engGrowth.val > 30) insights.push(`Engagement rate grew ${engGrowth.label} between the early period and now — a sign the content strategy is maturing and resonating with the audience.`);
  else if (engGrowth.val > 0) insights.push(`Engagement rate improved by ${engGrowth.label}. Consistent improvement shows content is finding its audience.`);
  else if (engGrowth.val < -10) insights.push(`Engagement dipped ${engGrowth.label} in the recent period. This may indicate content fatigue or a shift to broader, less targeted reach.`);

  if (postTypes.length > 1) {
    const best = [...postTypes].sort((a, b) => Number(b.avg_engagement) - Number(a.avg_engagement))[0];
    const worst = [...postTypes].sort((a, b) => Number(a.avg_engagement) - Number(b.avg_engagement))[0];
    if (best && worst && best.post_type !== worst.post_type) {
      insights.push(`${best.post_type}s drive ${best.avg_engagement}% engagement (${(Number(best.avg_engagement) / Number(worst.avg_engagement)).toFixed(1)}x more than ${worst.post_type}s at ${worst.avg_engagement}%). Lean into this format.`);
    }
  }

  const bestMonth = [...monthly].sort((a, b) => Number(b.avg_engagement) - Number(a.avg_engagement))[0];
  if (bestMonth) insights.push(`Best-performing month was ${monthLabel(bestMonth.month)} with ${bestMonth.avg_engagement}% average engagement across ${bestMonth.posts} posts.`);

  if (channelMetrics && benchmarkAvg > 0) {
    const mult = (Number(channelMetrics.engagement_rate) / benchmarkAvg).toFixed(1);
    if (Number(mult) >= 1) insights.push(`Current channel engagement (${channelMetrics.engagement_rate}%) is ${mult}x the ${benchmarkLabel} industry average of ${benchmarkAvg}%.`);
    else insights.push(`Channel engagement (${channelMetrics.engagement_rate}%) is below the ${benchmarkLabel} average of ${benchmarkAvg}%. There's room to improve with better-targeted content.`);
  }

  // Rolling engagement: compute engagement per post in chronological order for sparkline
  const rollingData = allPosts.map((p, i) => {
    const windowStart = Math.max(0, i - 4);
    const window = allPosts.slice(windowStart, i + 1);
    const avgEng = window.reduce((s, w) => s + Number(w.engagement_rate), 0) / window.length;
    return { index: i, engagement: avgEng, views: Number(p.views) };
  });
  const maxRollingEng = Math.max(...rollingData.map(r => r.engagement), 1);
  const maxRollingViews = Math.max(...rollingData.map(r => r.views), 1);

  return (
    <>
      {/* ═══ GROWTH HERO ═══ */}
      <div style={{
        background: `linear-gradient(135deg, ${color}12 0%, ${color}04 100%)`,
        border: `1px solid ${color}20`, borderRadius: 20,
        padding: "2rem 2.25rem", marginBottom: "2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.62rem", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
          {icon} {platform} Growth Story · {monthLabel(firstMonth)} → {monthLabel(lastMonth)}
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.5px", color: "#fafafa", margin: "0 0 0.5rem" }}>
          {engGrowth.val > 20 ? (
            <>{platform} engagement grew <span style={{ color }}>{engGrowth.label}</span> in 6 months</>
          ) : engGrowth.val > 0 ? (
            <>{platform} is steadily improving — <span style={{ color }}>{engGrowth.label}</span> engagement growth</>
          ) : (
            <>{platform} is finding its footing — <span style={{ color }}>{totalPosts} posts</span> and counting</>
          )}
        </h1>
        <p style={{ color: "#71717a", fontSize: "0.85rem", margin: 0, lineHeight: 1.6, maxWidth: 700 }}>
          From the first post in {monthLabel(firstMonth)} to today, JustPaid has published {totalPosts} pieces of content
          on {platform}, generating {fmt(totalViews)} views and {fmt(totalLikes + totalComments)} interactions.
          Here&apos;s how the journey unfolded.
        </p>
      </div>

      {/* ═══ KEY GROWTH METRICS ═══ */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.4rem" }}>Growth at a Glance</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "0 0 1rem", lineHeight: 1.5 }}>
          Comparing the early content period (Sep–Nov 2025) against the most recent months (Dec 2025–Mar 2026). The arrows show the direction of change.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {[
            { label: "Posts Published", early: Number(early?.posts || 0), recent: Number(recent?.posts || 0), icon: <FileText size={15} /> },
            { label: "Avg Views / Post", early: Number(early?.avg_views || 0), recent: Number(recent?.avg_views || 0), icon: <Eye size={15} /> },
            { label: "Avg Likes / Post", early: Number(early?.avg_likes || 0), recent: Number(recent?.avg_likes || 0), icon: <Heart size={15} />, decimals: true },
            { label: "Engagement Rate", early: Number(early?.avg_engagement || 0), recent: Number(recent?.avg_engagement || 0), icon: <Target size={15} />, suffix: "%", decimals: true },
          ].map(metric => {
            const change = pct(metric.recent, metric.early);
            return (
              <div key={metric.label} className="card" style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", color: "#52525b", fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem" }}>
                  {metric.icon} {metric.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", marginBottom: "0.15rem" }}>EARLY</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#a1a1aa" }}>
                      {metric.decimals ? (metric.suffix ? `${metric.early.toFixed(1)}${metric.suffix}` : metric.early.toFixed(1)) : fmt(metric.early)}
                    </div>
                  </div>
                  <ArrowRight size={14} color="#3f3f46" />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.55rem", color: "#3f3f46", marginBottom: "0.15rem" }}>NOW</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fafafa" }}>
                      {metric.decimals ? (metric.suffix ? `${metric.recent.toFixed(1)}${metric.suffix}` : metric.recent.toFixed(1)) : fmt(metric.recent)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: change.color, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.15rem" }}>
                  {change.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {change.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ MONTHLY TIMELINE ═══ */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><BarChart3 size={16} /> Month-by-Month Journey</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
          Each bar represents total views for that month. The green dots show the average engagement rate per post. The dashed line marks the transition from early exploration to the current content strategy. Watch how consistency built momentum over time.
        </p>

        {/* Bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 220, padding: "0 0.5rem" }}>
          {monthly.map((m) => {
            const viewPct = Number(m.views) / maxViews * 100;
            const engPct = Number(m.avg_engagement) / maxEng * 100;
            const isTransition = m.month === "2025-11";
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", borderRight: isTransition ? `2px dashed ${color}40` : undefined, paddingRight: isTransition ? "0.5rem" : undefined }}>
                {/* Stats above bar */}
                <div style={{ fontSize: "0.55rem", color: "#71717a", fontWeight: 600, marginBottom: "0.2rem", textAlign: "center", whiteSpace: "nowrap" }}>
                  {fmt(Number(m.views))}
                </div>
                {/* Engagement dot */}
                <div style={{
                  position: "absolute", bottom: `${Math.max(engPct, 5)}%`,
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#22c55e", border: "2px solid #18181b", zIndex: 2,
                }} />
                {/* View bar */}
                <div style={{
                  width: "100%", maxWidth: 60, borderRadius: "6px 6px 0 0",
                  height: `${Math.max(viewPct, 3)}%`,
                  background: `linear-gradient(180deg, ${color}90 0%, ${color}40 100%)`,
                }} />
                {/* Month + posts label */}
                <div style={{ marginTop: "0.3rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#a1a1aa" }}>{monthLabel(m.month)}</div>
                  <div style={{ fontSize: "0.5rem", color: "#3f3f46" }}>{m.posts} posts</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Engagement rate labels under chart */}
        <div style={{ display: "flex", gap: "0.5rem", padding: "0.5rem 0.5rem 0", borderTop: "1px solid #27272a", marginTop: "0.5rem" }}>
          {monthly.map((m) => (
            <div key={m.month} style={{ flex: 1, textAlign: "center", fontSize: "0.58rem", fontWeight: 600, color: Number(m.avg_engagement) > 3 ? "#22c55e" : Number(m.avg_engagement) > 1 ? "#eab308" : "#ef4444" }}>
              {m.avg_engagement}%
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.62rem", color: "#71717a" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: `${color}70` }} /> Views
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.62rem", color: "#71717a" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Engagement %
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.62rem", color: "#71717a" }}>
            <div style={{ width: 16, height: 0, borderTop: `2px dashed ${color}60` }} /> Strategy shift
          </div>
        </div>
      </div>

      {/* ═══ POST-BY-POST SPARKLINE ═══ */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><TrendingUp size={16} /> Engagement Trajectory (Every Post)</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
          Each column represents one post in chronological order (left = oldest, right = newest). The height shows the 5-post rolling average engagement rate. A rising trend means the content is consistently improving, not just getting lucky with one-off hits.
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 100 }}>
          {rollingData.map((d, i) => {
            const h = (d.engagement / maxRollingEng) * 100;
            const isRecent = i >= (early?.posts || 0);
            return (
              <div key={i} style={{
                flex: 1, height: `${Math.max(h, 2)}%`, borderRadius: "2px 2px 0 0",
                background: isRecent ? `${color}80` : `${color}30`,
                minWidth: 2,
              }} />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem", fontSize: "0.55rem", color: "#52525b" }}>
          <span>First post ({monthLabel(firstMonth)})</span>
          <span>Latest ({monthLabel(lastMonth)})</span>
        </div>
      </div>

      {/* ═══ CONTENT FORMAT BREAKDOWN ═══ */}
      {postTypes.length > 1 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="section-title"><Layers size={16} /> What Content Works Best</div>
          <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
            Breaking down performance by content format. The top bar is the best-performing format by engagement rate. Use this to decide where to invest more effort.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[...postTypes].sort((a, b) => Number(b.avg_engagement) - Number(a.avg_engagement)).map((pt, i) => {
              const maxEng = Number(postTypes.reduce((best, p) => Number(p.avg_engagement) > Number(best.avg_engagement) ? p : best, postTypes[0]).avg_engagement);
              const barW = (Number(pt.avg_engagement) / maxEng) * 100;
              const isBest = i === 0;
              return (
                <div key={pt.post_type}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: isBest ? 700 : 500, color: isBest ? "#fafafa" : "#a1a1aa" }}>{pt.post_type}</span>
                      <span style={{ fontSize: "0.6rem", color: "#3f3f46" }}>{pt.count} posts · {fmt(Number(pt.avg_views))} avg views</span>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isBest ? "#22c55e" : "#71717a", fontVariantNumeric: "tabular-nums" }}>{pt.avg_engagement}%</span>
                  </div>
                  <div style={{ height: 8, background: "#27272a", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${barW}%`, borderRadius: 4,
                      background: isBest ? `linear-gradient(90deg, ${color}, #22c55e)` : `${color}40`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CONTENT FORMAT EVOLUTION TABLE ═══ */}
      {allTypes.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="section-title"><Calendar size={16} /> How Content Strategy Evolved</div>
          <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
            Comparing the same formats between early and recent periods. Green trends mean that format improved with the audience; red means it declined. Formats marked &quot;New&quot; were introduced in the recent period.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                {["Format", "Early Posts", "Early Eng.", "Recent Posts", "Recent Eng.", "Change"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: "left", color: "#52525b", fontWeight: 600, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTypes.map(type => {
                const e = earlyContent.find(r => r.post_type === type);
                const r = recentContent.find(r => r.post_type === type);
                const change = (e && r) ? pct(Number(r.avg_engagement), Number(e.avg_engagement)) : null;
                return (
                  <tr key={type} className="table-row" style={{ borderBottom: "1px solid rgba(39,39,42,0.5)" }}>
                    <td style={{ padding: "0.65rem 0.8rem", color: "#e4e4e7", fontWeight: 600 }}>{type}</td>
                    <td style={{ padding: "0.65rem 0.8rem", color: "#a1a1aa" }}>{e?.posts || "—"}</td>
                    <td style={{ padding: "0.65rem 0.8rem", color: e ? "#e4e4e7" : "#3f3f46", fontWeight: 500 }}>{e ? `${e.avg_engagement}%` : "—"}</td>
                    <td style={{ padding: "0.65rem 0.8rem", color: "#a1a1aa" }}>{r?.posts || "—"}</td>
                    <td style={{ padding: "0.65rem 0.8rem", color: r ? "#fafafa" : "#3f3f46", fontWeight: 600 }}>{r ? `${r.avg_engagement}%` : "—"}</td>
                    <td style={{ padding: "0.65rem 0.8rem" }}>
                      {change ? (
                        <span style={{ fontWeight: 600, color: change.color, display: "flex", alignItems: "center", gap: "0.1rem", fontSize: "0.75rem" }}>
                          {change.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {change.label}
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
      )}

      {/* ═══ TOP POSTS COMPARISON ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card">
          <div className="section-title" style={{ color: "#eab308" }}><Award size={16} /> Early Hits · Sep–Nov 2025</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            The posts that performed best during the first months. These set the baseline for what the {platform} audience responded to.
          </p>
          {topEarly.length === 0 ? (
            <div style={{ color: "#3f3f46", fontSize: "0.78rem", padding: "1rem", textAlign: "center" }}>No posts in this period</div>
          ) : topEarly.map((p, i) => (
            <div key={i} style={{ padding: "0.6rem 0.75rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.78rem", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.2rem" }}>
                    {String(p.title).slice(0, 55)}{String(p.title).length > 55 ? "..." : ""}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#52525b" }}>
                    {p.post_type} · {p.engagement_rate}% eng
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fafafa" }}>{fmt(Number(p.views))}</div>
                  <div style={{ display: "flex", gap: "0.3rem", fontSize: "0.55rem", color: "#52525b", justifyContent: "flex-end" }}>
                    <span>{Number(p.likes)} <Heart size={9} style={{ display: "inline" }} /></span>
                    <span>{Number(p.comments)} <MessageCircle size={9} style={{ display: "inline" }} /></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title" style={{ color: "#22c55e" }}><Award size={16} /> Recent Hits · Dec 2025–Mar 2026</div>
          <p style={{ fontSize: "0.7rem", color: "#71717a", margin: "-0.3rem 0 0.8rem", lineHeight: 1.5 }}>
            The best-performing recent content. Compare these against the early hits to see how content quality and topics evolved.
          </p>
          {topRecent.length === 0 ? (
            <div style={{ color: "#3f3f46", fontSize: "0.78rem", padding: "1rem", textAlign: "center" }}>No posts in this period</div>
          ) : topRecent.map((p, i) => (
            <div key={i} style={{ padding: "0.6rem 0.75rem", background: "#0f0f12", borderRadius: 8, border: "1px solid #1e1e22", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.78rem", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.3, marginBottom: "0.2rem" }}>
                    {String(p.title).slice(0, 55)}{String(p.title).length > 55 ? "..." : ""}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#52525b" }}>
                    {p.post_type} · {p.engagement_rate}% eng
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fafafa" }}>{fmt(Number(p.views))}</div>
                  <div style={{ display: "flex", gap: "0.3rem", fontSize: "0.55rem", color: "#52525b", justifyContent: "flex-end" }}>
                    <span>{Number(p.likes)} <Heart size={9} style={{ display: "inline" }} /></span>
                    <span>{Number(p.comments)} <MessageCircle size={9} style={{ display: "inline" }} /></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ KEY INSIGHTS ═══ */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="section-title"><Zap size={16} /> Key Insights</div>
        <p style={{ fontSize: "0.75rem", color: "#71717a", margin: "-0.5rem 0 1rem", lineHeight: 1.6 }}>
          Auto-generated takeaways based on the data above. These highlight the most actionable patterns for improving {platform} performance.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {insights.map((text, i) => (
            <div key={i} style={{
              padding: "0.75rem 1rem", borderRadius: 10,
              background: `${color}06`, border: `1px solid ${color}15`,
              fontSize: "0.78rem", color: "#d4d4d8", lineHeight: 1.6,
              display: "flex", gap: "0.5rem", alignItems: "flex-start",
            }}>
              <div style={{ color, flexShrink: 0, marginTop: "0.1rem" }}>
                {i === 0 ? <TrendingUp size={14} /> : i === 1 ? <Target size={14} /> : i === 2 ? <Calendar size={14} /> : <BarChart3 size={14} />}
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CURRENT STATUS FOOTER ═══ */}
      {channelMetrics && (
        <div style={{
          background: `${color}08`, border: `1px solid ${color}15`, borderRadius: 14,
          padding: "1.25rem 1.5rem",
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", textAlign: "center",
        }}>
          {[
            { label: "Followers", value: fmt(channelMetrics.followers) },
            { label: "Total Posts", value: fmt(channelMetrics.total_posts) },
            { label: "Total Views", value: fmt(channelMetrics.total_views) },
            { label: "Total Likes", value: fmt(channelMetrics.total_likes) },
            { label: "Channel Eng.", value: `${channelMetrics.engagement_rate}%` },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "0.55rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.3rem" }}>{s.label}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fafafa" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
