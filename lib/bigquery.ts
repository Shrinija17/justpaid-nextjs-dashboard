import { BigQuery } from "@google-cloud/bigquery";

let bq: BigQuery;

export function getBigQuery(): BigQuery {
  if (bq) return bq;
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credsJson) {
    const creds = JSON.parse(credsJson);
    bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID, credentials: creds });
  } else {
    bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });
  }
  return bq;
}

export const PROJECT = process.env.GCP_PROJECT_ID || "bionic-store-488922-d6";
export const DATASET = process.env.BIGQUERY_DATASET || "justpaid_social";

export async function runQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  try {
    const bq = getBigQuery();
    const [rows] = await bq.query({ query: sql, location: "US" });
    // Serialize to plain JSON to strip BigQuery-specific types (BigInt, Timestamp, etc.)
    // that aren't compatible with React Server Component serialization
    return JSON.parse(JSON.stringify(rows)) as T[];
  } catch (e) {
    console.error("BigQuery error:", e);
    return [];
  }
}
