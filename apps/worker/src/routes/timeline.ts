import { desc } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import { timelineEvents } from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const limit = Math.min(
    Number.parseInt(c.req.query("limit") ?? "50", 10),
    200,
  );

  const rows = await db
    .select()
    .from(timelineEvents)
    .orderBy(desc(timelineEvents.eventDate))
    .limit(limit);

  return c.json({ events: rows, count: rows.length });
});

export default app;
