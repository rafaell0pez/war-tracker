import { desc } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import { tweets } from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const limit = Math.min(
    Number.parseInt(c.req.query("limit") ?? "20", 10),
    100,
  );
  const offset = Number.parseInt(c.req.query("offset") ?? "0", 10);

  const rows = await db
    .select()
    .from(tweets)
    .orderBy(desc(tweets.tweetCreatedAt))
    .limit(limit)
    .offset(offset);

  return c.json({ tweets: rows, count: rows.length });
});

export default app;
