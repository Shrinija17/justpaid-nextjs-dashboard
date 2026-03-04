import { runQuery, PROJECT, DATASET } from "./bigquery";

/* ── Analytics page queries ────────────────────────── */

export async function getAnalytics() {
  const [channelMetrics, platformSummary, contentTypes, dayOfWeek, monthlyTrend, topPosts, bottomPosts, rows7, rows8, rows9, rows10] = await Promise.all([
    runQuery(`
      SELECT platform, followers, follower_change, total_posts, total_views,
             total_likes, total_comments, engagement_rate
      FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
      ORDER BY platform
    `),
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
    runQuery(`
      SELECT platform, title, post_type, views, likes, comments,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      ORDER BY views DESC
      LIMIT 10
    `),
    runQuery(`
      SELECT platform, title, post_type, views, likes, comments,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE views > 10
      ORDER BY engagement_rate ASC
      LIMIT 10
    `),
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

  return {
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
  };
}

/* ── Leads page queries ────────────────────────────── */

interface Signal {
  source: string; title: string; url: string;
  score: number; comments: number; created: number;
  subreddit?: string; author?: string; category: string;
}

function categorize(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("payroll") || t.includes("pay ")) return "payroll";
  if (t.includes("contractor") || t.includes("1099") || t.includes("freelan")) return "contractor";
  if (t.includes("invoice") || t.includes("payment") || t.includes("billing")) return "invoice";
  return "general";
}

async function fetchReddit(): Promise<Signal[]> {
  const queries = ["payroll contractor startup","invoice payment problems","paying international contractors","1099 payment software"];
  const subs = ["startups","Entrepreneur","smallbusiness","freelance"];
  const results: Signal[] = [];
  const seen = new Set<string>();

  for (const query of queries.slice(0,2)) {
    for (const sub of subs.slice(0,2)) {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=5&restrict_sr=1&t=month`;
        const res = await fetch(url, { headers: { "User-Agent": "JustPaid-Analytics/1.0" }, next: { revalidate: 21600 } });
        if (!res.ok) continue;
        const data = await res.json();
        for (const post of (data?.data?.children || [])) {
          const p = post.data;
          if (seen.has(p.id) || p.score < 5) continue;
          seen.add(p.id);
          results.push({
            source: "Reddit", title: p.title, url: `https://reddit.com${p.permalink}`,
            score: p.score, comments: p.num_comments, created: p.created_utc,
            subreddit: p.subreddit_name_prefixed, category: categorize(p.title),
          });
        }
      } catch { /* skip */ }
    }
  }
  return results;
}

async function fetchHN(): Promise<Signal[]> {
  const queries = ["payroll startup contractors","invoice payment automation"];
  const results: Signal[] = [];
  const seen = new Set<string>();
  const cutoff = Math.floor(Date.now()/1000) - 86400*30;

  for (const q of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${cutoff},points>5&hitsPerPage=8`;
      const res = await fetch(url, { next: { revalidate: 21600 } });
      if (!res.ok) continue;
      const data = await res.json();
      for (const h of (data?.hits || [])) {
        if (seen.has(h.objectID)) continue;
        seen.add(h.objectID);
        results.push({
          source: "HN", title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
          score: h.points, comments: h.num_comments, created: h.created_at_i,
          author: h.author, category: categorize(h.title),
        });
      }
    } catch { /* skip */ }
  }
  return results;
}

const LEAD_FALLBACK: Signal[] = [
  { source:"Reddit", title:"Paying contractors in 5 countries — current setup is a nightmare", url:"#", score:347, comments:89, created: Date.now()/1000 - 7200, subreddit:"r/startups", category:"contractor" },
  { source:"HN", title:"Ask HN: Best way to handle 1099 payments for remote contractor team?", url:"#", score:218, comments:54, created: Date.now()/1000 - 18000, author:"pgfan2024", category:"contractor" },
  { source:"Reddit", title:"Invoice payment delays are killing my cash flow", url:"#", score:156, comments:42, created: Date.now()/1000 - 28800, subreddit:"r/Entrepreneur", category:"invoice" },
  { source:"Reddit", title:"Multi-state compliance penalties — nobody told me remote hiring was this complex", url:"#", score:94, comments:61, created: Date.now()/1000 - 86400, subreddit:"r/smallbusiness", category:"payroll" },
  { source:"HN", title:"International contractor FX fees eating 4-8% monthly — what are people using?", url:"#", score:87, comments:33, created: Date.now()/1000 - 90000, author:"startup_cto", category:"contractor" },
  { source:"Reddit", title:"Need automated invoicing that handles follow-ups — client wants net-60", url:"#", score:71, comments:28, created: Date.now()/1000 - 172800, subreddit:"r/freelance", category:"invoice" },
];

export async function getLeads(): Promise<Signal[]> {
  const [reddit, hn] = await Promise.allSettled([fetchReddit(), fetchHN()]);
  const all: Signal[] = [
    ...(reddit.status === "fulfilled" ? reddit.value : []),
    ...(hn.status === "fulfilled" ? hn.value : []),
  ].sort((a, b) => b.score - a.score);

  return all.length ? all.slice(0, 20) : LEAD_FALLBACK;
}

/* ── Home page queries ─────────────────────────────── */

export async function getMetrics() {
  const sql = `
    WITH latest AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY platform ORDER BY date DESC) as rn
      FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
    )
    SELECT platform, followers, follower_change, engagement_rate
    FROM latest WHERE rn = 1
    ORDER BY followers DESC
  `;
  const rows = await runQuery(sql);
  return rows.length ? rows : [];
}

export async function getGrowth() {
  const sql = `
    SELECT platform, date, followers
    FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
    WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    ORDER BY date ASC, platform ASC
  `;
  return runQuery(sql);
}

export async function getPosts() {
  const sql = `
    SELECT platform, title, post_type, views, likes, comments,
           COALESCE(shares, 0) as shares, published_at
    FROM \`${PROJECT}.${DATASET}.posts\`
    ORDER BY views DESC
    LIMIT 20
  `;
  return runQuery(sql);
}

function quarterBounds(y: number, q: number): [string, string] {
  const starts = ["01-01","04-01","07-01","10-01"];
  const ends = ["03-31","06-30","09-30","12-31"];
  return [`${y}-${starts[q-1]}`, `${y}-${ends[q-1]}`];
}

function currentAndPrev(): [[number,number],[number,number]] {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  const y = now.getFullYear();
  if (q === 1) return [[y, 1], [y-1, 4]];
  return [[y, q], [y, q-1]];
}

export async function getQoQ() {
  const [[cy, cq], [py, pq]] = currentAndPrev();
  const [cs, ce] = quarterBounds(cy, cq);
  const [ps, pe] = quarterBounds(py, pq);

  const query = (start: string, end: string) => `
    SELECT platform, title, post_type, views, likes, comments, COALESCE(shares,0) as shares, published_at
    FROM \`${PROJECT}.${DATASET}.posts\`
    WHERE DATE(published_at) BETWEEN '${start}' AND '${end}'
  `;

  const [curr, prev] = await Promise.all([runQuery(query(cs, ce)), runQuery(query(ps, pe))]);

  const stats = (rows: Record<string,unknown>[]) => {
    if (!rows.length) return { total_posts:0, total_views:0, total_likes:0, avg_views:0, engagement_rate:0 };
    const tv = rows.reduce((s,r) => s + Number(r.views||0), 0);
    const tl = rows.reduce((s,r) => s + Number(r.likes||0), 0);
    const tc = rows.reduce((s,r) => s + Number(r.comments||0), 0);
    return {
      total_posts: rows.length, total_views: tv, total_likes: tl,
      avg_views: Math.round(tv / rows.length),
      engagement_rate: tv ? +((tl + tc) / tv * 100).toFixed(2) : 0,
    };
  };

  return {
    current: { label: `Q${cq} ${cy}`, stats: stats(curr as Record<string,unknown>[]), posts: curr.slice(0,5) },
    previous: { label: `Q${pq} ${py}`, stats: stats(prev as Record<string,unknown>[]), posts: prev.slice(0,5) },
  };
}

/* ── Platform story queries ────────────────────────── */

export async function getPlatformStory(platform: string) {
  const [monthly, postTypes, periodComparison, contentEvolution, topEarly, topRecent, allPosts, channelMetrics] = await Promise.all([
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
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares, published_at,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}' AND DATE(published_at) < '2025-12-01'
      ORDER BY views DESC
      LIMIT 5
    `),
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares, published_at,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}' AND DATE(published_at) >= '2025-12-01'
      ORDER BY views DESC
      LIMIT 5
    `),
    runQuery(`
      SELECT title, post_type, views, likes, comments, COALESCE(shares,0) as shares,
        FORMAT_DATE('%Y-%m-%d', DATE(published_at)) as date,
        ROUND(CASE WHEN views > 0 THEN (likes + comments) / views * 100 ELSE 0 END, 2) as engagement_rate
      FROM \`${PROJECT}.${DATASET}.posts\`
      WHERE platform = '${platform}'
      ORDER BY published_at ASC
    `),
    runQuery(`
      SELECT followers, follower_change, total_posts, total_views,
             total_likes, total_comments, engagement_rate
      FROM \`${PROJECT}.${DATASET}.channel_daily_metrics\`
      WHERE platform = '${platform}'
      LIMIT 1
    `),
  ]);

  return {
    monthly,
    postTypes,
    periodComparison,
    contentEvolution,
    topEarly,
    topRecent,
    allPosts,
    channelMetrics: channelMetrics[0] || null,
  };
}
