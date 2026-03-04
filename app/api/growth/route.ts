import { NextResponse } from "next/server";
import { runQuery, PROJECT, DATASET } from "@/lib/bigquery";

export const revalidate = 3600;

export async function GET() {
  const sql = `
    SELECT platform, date, followers
    FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    ORDER BY date ASC, platform ASC
  `;
  const rows = await runQuery(sql);

  // Fallback: generate 90-day sample
  if (!rows.length) {
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
    return NextResponse.json(result);
  }

  return NextResponse.json(rows);
}
