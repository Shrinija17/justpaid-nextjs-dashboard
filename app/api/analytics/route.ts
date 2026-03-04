import { NextResponse } from "next/server";
import { runQuery, PROJECT, DATASET } from "@/lib/bigquery";

export const revalidate = 3600;

export async function GET() {
  const [channelMetrics, platformSummary, contentTypes, dayOfWeek, monthlyTrend, topPosts, bottomPosts, rows7, rows8, rows9, rows10] = await Promise.all([
    // Channel-level metrics
    runQuery(`
      SELECT platform, followers, follower_change, total_posts, total_views,
             total_likes, total_comments, engagement_rate
      FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
      ORDER BY platform
    `),

    // Platform summary from posts
    runQuery(`
      SELECT platform, COUNT(*) as post_count,
        SUM(views) as total_views, SUM(likes) as total_likes,
        SUM(comments) as total_comments, SUM(COALESCE(shares, 0)) as total_shares,
        ROUND(AVG(views), 0) as avg_views, ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(comments), 1) as avg_comments,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      GROUP BY platform
      ORDER BY total_views DESC
    `),

    // Content type breakdown
    runQuery(`
      SELECT platform, post_type,
        COUNT(*) as count,
        SUM(views) as total_views, SUM(likes) as total_likes,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE views > 0
      GROUP BY platform, post_type
      HAVING COUNT(*) >= 2
      ORDER BY avg_engagement_rate DESC
    `),

    // Day of week analysis
    runQuery(`
      SELECT
        FORMAT_DATE('%A', DATE(published_at)) as day_name,
        EXTRACT(DAYOFWEEK FROM published_at) as day_num,
        COUNT(*) as posts,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE views > 0
      GROUP BY day_name, day_num
      ORDER BY day_num
    `),

    // Monthly trend
    runQuery(`
      SELECT
        FORMAT_DATE('%Y-%m', DATE(published_at)) as month,
        platform,
        COUNT(*) as posts,
        SUM(views) as views,
        SUM(likes) as likes,
        SUM(comments) as comments,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      GROUP BY month, platform
      ORDER BY month, platform
    `),

    // Top 10 posts
    runQuery(`
      SELECT platform, title, post_type, views, likes, comments,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      ORDER BY views DESC
      LIMIT 10
    `),

    // Bottom performers (with some views)
    runQuery(`
      SELECT platform, title, post_type, views, likes, comments,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE views > 10
      ORDER BY engagement_rate ASC
      LIMIT 10
    `),

    // Period comparison: Sep-Nov 2025 vs Dec 2025-Mar 2026
    runQuery(`
      SELECT
        CASE WHEN DATE(published_at) < '2025-12-01' THEN 'early' ELSE 'recent' END as period,
        platform,
        COUNT(*) as posts,
        SUM(views) as total_views,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(COALESCE(shares,0)) as total_shares,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(likes), 1) as avg_likes,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      GROUP BY period, platform
      ORDER BY platform, period
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
      GROUP BY period, post_type
      ORDER BY post_type, period
    `),

    // Top 3 posts per period
    runQuery(`
      WITH ranked AS (
        SELECT *,
          CASE WHEN DATE(published_at) < '2025-12-01' THEN 'early' ELSE 'recent' END as period,
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN DATE(published_at) < '2025-12-01' THEN 'early' ELSE 'recent' END
            ORDER BY views DESC
          ) as rn
        FROM \`${PROJECT}.${DATASET}.posts\`
      )
      SELECT period, platform, title, views, likes, comments, post_type
      FROM ranked WHERE rn <= 5
      ORDER BY period, rn
    `),

    // Monthly aggregate (all platforms combined)
    runQuery(`
      SELECT
        FORMAT_DATE('%Y-%m', DATE(published_at)) as month,
        COUNT(*) as posts,
        SUM(views) as views,
        SUM(likes) as likes,
        SUM(comments) as comments,
        SUM(COALESCE(shares,0)) as shares,
        ROUND(AVG(views), 0) as avg_views,
        ROUND(AVG(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END), 2) as avg_engagement
      FROM \`${PROJECT}.${DATASET}.posts\`
      GROUP BY month
      ORDER BY month
    `),
  ]);

  return NextResponse.json({
    channelMetrics,
    platformSummary,
    contentTypes,
    dayOfWeek,
    monthlyTrend,
    topPosts,
    bottomPosts,
    periodComparison: rows7,
    contentEvolution: rows8,
    periodTopPosts: rows9,
    monthlyAggregate: rows10,
  });
}
