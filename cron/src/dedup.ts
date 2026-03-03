import { mkdirSync } from "node:fs";
import path from "node:path";
import { Database } from "bun:sqlite";

const DB_PATH = path.join(import.meta.dirname, "..", "data", "dedup.db");

let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS processed_tweets (
        tweet_id TEXT PRIMARY KEY,
        processed_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}

export function isProcessed(tweetId: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM processed_tweets WHERE tweet_id = ?")
    .get(tweetId);
  return !!row;
}

export function markProcessed(tweetIds: string[]): void {
  const stmt = getDb().prepare(
    "INSERT OR IGNORE INTO processed_tweets (tweet_id) VALUES (?)",
  );
  const transaction = getDb().transaction(() => {
    for (const id of tweetIds) {
      stmt.run(id);
    }
  });
  transaction();
}

export function cleanOld(daysToKeep = 30): void {
  getDb().exec(
    `DELETE FROM processed_tweets WHERE processed_at < datetime('now', '-${daysToKeep} days')`,
  );
}
