import { NextResponse } from "next/server";
import { runQuery, PROJECT, DATASET } from "@/lib/bigquery";

export const revalidate = 3600;

export async function GET() {
  const sql = `
    SELECT platform, followers, follower_change, engagement_rate
    FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
    WHERE date = (SELECT MAX(date) FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`)
    ORDER BY followers DESC
  `;
  const rows = await runQuery(sql);

  // Fallback sample data if BigQuery unavailable
  const fallback = [
    { platform: "LinkedIn", followers: 3400, follower_change: 550, engagement_rate: 4.2 },
    { platform: "Twitter", followers: 2100, follower_change: 225, engagement_rate: 2.1 },
    { platform: "Instagram", followers: 1200, follower_change: 280, engagement_rate: 3.8 },
    { platform: "YouTube", followers: 890, follower_change: 138, engagement_rate: 5.1 },
  ];

  return NextResponse.json(rows.length ? rows : fallback);
}
