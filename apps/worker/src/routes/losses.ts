import { and, desc, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import { lossEvents } from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const side = c.req.query("side");
  const category = c.req.query("category");
  const minConfidence = Number.parseFloat(
    c.req.query("minConfidence") ?? "0.5",
  );
  const limit = Math.min(
    Number.parseInt(c.req.query("limit") ?? "100", 10),
    500,
  );

  const conditions = [gte(lossEvents.confidence, minConfidence)];

  if (side) {
    conditions.push(
      eq(
        lossEvents.side,
        side as "iran_axis" | "israel_coalition" | "civilian",
      ),
    );
  }
  if (category) {
    conditions.push(
      eq(
        lossEvents.category,
        category as (typeof lossEvents.category.enumValues)[number],
      ),
    );
  }

  const rows = await db
    .select()
    .from(lossEvents)
    .where(and(...conditions))
    .orderBy(desc(lossEvents.extractedAt))
    .limit(limit);

  return c.json({ events: rows, count: rows.length });
});

export default app;
