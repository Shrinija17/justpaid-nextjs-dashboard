import { NextRequest, NextResponse } from "next/server";
import { runQuery, PROJECT, DATASET } from "@/lib/bigquery";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get("platform");
  if (!platform) return NextResponse.json({ error: "platform required" }, { status: 400 });

  const [monthly, postTypes, periodComparison, contentEvolution, topEarly, topRecent, allPosts, channelMetrics] = await Promise.all([
    // Monthly breakdown
    runQuery(`
      SELECT
        FORMAT_DATE('%Y-%m', DATE(published_at)) as month,
        COUNT(*) as posts,
        SUM(views) as views,
        SUM(likes) as likes,
        SUM(comments) as comments,
        SUM(COALESCE(shares,0)) as shares,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      GROUP BY month
      ORDER BY month
    `),

    // Post type breakdown (all time)
    runQuery(`
      SELECT post_type,
        COUNT(*) as count,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      GROUP BY post_type
      ORDER BY count DESC
    `),

    // Period comparison
    runQuery(`
      SELECT
        CASE WHEN DATE(published_at) < '2025-12-01' THEN 'early' ELSE 'recent' END as period,
        COUNT(*) as posts,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(COALESCE(shares,0)) as total_shares,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      GROUP BY period
      ORDER BY period
    `),

    // Content type evolution between periods
    runQuery(`
      SELECT
        CASE WHEN DATE(published_at) < '2025-12-01' THEN 'early' ELSE 'recent' END as period,
        post_type,
        COUNT(*) as posts,
        SUM(views) as total_views,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      GROUP BY period, post_type
      ORDER BY post_type, period
    `),

    // Top 5 early posts
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares, published_at,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}' AND DATE(published_at) < '2025-12-01'
      ORDER BY views DESC
      LIMIT 5
    `),

    // Top 5 recent posts
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares, published_at,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}' AND DATE(published_at) >= '2025-12-01'
      ORDER BY views DESC
      LIMIT 5
    `),

    // All posts for this platform (for sparkline data)
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares,
        FORMAT_DATE('%Y-%m-%d', DATE(published_at)) as date,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      ORDER BY published_at ASC
    `),

    // Channel-level metrics
    runQuery(`
      SELECT followers, follower_change, total_posts, total_views,
             total_likes, total_comments, engagement_rate
      FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
      WHERE platform = '${platform}'
      LIMIT 1
    `),
  ]);

  return NextResponse.json({
    monthly,
    postTypes,
    periodComparison,
    contentEvolution,
    topEarly,
    topRecent,
    allPosts,
    channelMetrics: channelMetrics[0] || null,
  });
}
