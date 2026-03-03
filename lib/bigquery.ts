export const PROJECT = process.env.GCP_PROJECT_ID || "bionic-store-488922-d6";
export const DATASET = process.env.BIGQUERY_DATASET || "justpaid_social";

export async function runQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credsJson && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // No credentials — return empty so callers use fallback data
    return [];
  }
  try {
    // Dynamic import to avoid module-level errors when package isn't available
    const { BigQuery } = await import("@google-cloud/bigquery");
    let bq;
    if (credsJson) {
      const creds = JSON.parse(credsJson);
      bq = new BigQuery({ projectId: PROJECT, credentials: creds });
    } else {
      bq = new BigQuery({ projectId: PROJECT });
    }
    const [rows] = await bq.query({ query: sql, location: "US" });
    return rows as T[];
  } catch (e) {
    console.error("BigQuery error:", e);
    return [];
  }
}
