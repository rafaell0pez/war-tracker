import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import {
  aggregatedLosses,
  cronRuns,
  lossEvents,
  timelineEvents,
  tweets,
  warEstimate,
} from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

// Authenticated ingest endpoint — VPS cron POSTs extracted data here
app.post("/", async (c) => {
  const secret = c.req.header("Authorization")?.replace("Bearer ", "");
  if (secret !== c.env.INGEST_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    tweets?: Array<typeof tweets.$inferInsert>;
    lossEvents?: Array<typeof lossEvents.$inferInsert>;
    timelineEvents?: Array<typeof timelineEvents.$inferInsert>;
    warEstimate?: typeof warEstimate.$inferInsert;
    cronRun?: typeof cronRuns.$inferInsert;
  }>();

  const db = createDb(c.env.DB);
  const results = { tweets: 0, lossEvents: 0, timelineEvents: 0 };

  // Insert tweets
  if (body.tweets?.length) {
    for (const tweet of body.tweets) {
      await db.insert(tweets).values(tweet).onConflictDoNothing();
    }
    results.tweets = body.tweets.length;
  }

  // Insert loss events
  if (body.lossEvents?.length) {
    for (const event of body.lossEvents) {
      await db.insert(lossEvents).values(event).onConflictDoNothing();
    }
    results.lossEvents = body.lossEvents.length;
  }

  // Insert timeline events
  if (body.timelineEvents?.length) {
    for (const event of body.timelineEvents) {
      await db.insert(timelineEvents).values(event).onConflictDoNothing();
    }
    results.timelineEvents = body.timelineEvents.length;
  }

  // Upsert war estimate
  if (body.warEstimate) {
    await db
      .insert(warEstimate)
      .values(body.warEstimate)
      .onConflictDoUpdate({
        target: warEstimate.id,
        set: {
          estimatedEndDate: body.warEstimate.estimatedEndDate,
          estimatedDurationDays: body.warEstimate.estimatedDurationDays,
          currentPhase: body.warEstimate.currentPhase,
          summary: body.warEstimate.summary,
          keyFactors: body.warEstimate.keyFactors,
          confidenceLevel: body.warEstimate.confidenceLevel,
          generatedAt: body.warEstimate.generatedAt,
        },
      });
  }

  // Upsert cron run
  if (body.cronRun) {
    await db
      .insert(cronRuns)
      .values(body.cronRun)
      .onConflictDoUpdate({
        target: cronRuns.id,
        set: {
          completedAt: body.cronRun.completedAt,
          tweetsFound: body.cronRun.tweetsFound,
          tweetsProcessed: body.cronRun.tweetsProcessed,
          eventsExtracted: body.cronRun.eventsExtracted,
          errors: body.cronRun.errors,
          status: body.cronRun.status,
        },
      });
  }

  // Recompute aggregated losses
  await recomputeAggregates(db);

  return c.json({ ok: true, results });
});

async function recomputeAggregates(db: ReturnType<typeof createDb>) {
  // Delete existing aggregates
  await db.delete(aggregatedLosses);

  // Recompute from loss_events
  const rows = await db.all(sql`
    SELECT
      side || '_' || category AS id,
      side,
      category,
      SUM(value) AS total_value,
      SUM(CASE WHEN confidence >= 0.7 THEN value ELSE 0 END) AS high_confidence_value,
      COUNT(*) AS event_count
    FROM loss_events
    GROUP BY side, category
  `);

  for (const row of rows as Array<{
    id: string;
    side: string;
    category: string;
    total_value: number;
    high_confidence_value: number;
    event_count: number;
  }>) {
    await db.insert(aggregatedLosses).values({
      id: row.id,
      side: row.side as "iran_axis" | "israel_coalition" | "civilian",
      category: row.category,
      totalValue: row.total_value,
      highConfidenceValue: row.high_confidence_value,
      eventCount: row.event_count,
    });
  }
}

export default app;
