import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db/client";
import {
  aggregatedLosses,
  countries,
  cronRuns,
  timelineEvents,
  warEstimate,
} from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DB);

  const [losses, countryList, timeline, estimate, lastRun] = await Promise.all([
    db.select().from(aggregatedLosses),
    db.select().from(countries),
    db
      .select()
      .from(timelineEvents)
      .orderBy(desc(timelineEvents.eventDate))
      .limit(10),
    db
      .select()
      .from(warEstimate)
      .orderBy(desc(warEstimate.generatedAt))
      .limit(1),
    db
      .select()
      .from(cronRuns)
      .where(eq(cronRuns.status, "completed"))
      .orderBy(desc(cronRuns.completedAt))
      .limit(1),
  ]);

  const lossesBySide: Record<
    string,
    Record<string, { total: number; highConfidence: number; count: number }>
  > = {};
  for (const row of losses) {
    if (!lossesBySide[row.side]) lossesBySide[row.side] = {};
    lossesBySide[row.side][row.category] = {
      total: row.totalValue,
      highConfidence: row.highConfidenceValue,
      count: row.eventCount,
    };
  }

  const countriesByCategory: Record<string, typeof countryList> = {};
  for (const country of countryList) {
    if (!countriesByCategory[country.category])
      countriesByCategory[country.category] = [];
    countriesByCategory[country.category].push(country);
  }

  return c.json({
    losses: lossesBySide,
    countries: countriesByCategory,
    countryCount: countryList.length,
    timeline,
    estimate: estimate[0] ?? null,
    lastUpdated: lastRun[0]?.completedAt ?? null,
  });
});

export default app;
