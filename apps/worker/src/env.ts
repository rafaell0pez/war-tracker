export interface Env {
  DB: D1Database;
  ASSETS: { fetch: typeof fetch };
  INGEST_SECRET: string;
}
