import { Hono } from "hono";
import { createDb } from "../db/client";
import { countries } from "../db/schema";
import type { Env } from "../env";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(countries);

  const grouped: Record<string, typeof rows> = {};
  for (const row of rows) {
    if (!grouped[row.category]) grouped[row.category] = [];
    grouped[row.category].push(row);
  }

  return c.json({
    countries: grouped,
    total: rows.length,
  });
});

export default app;
