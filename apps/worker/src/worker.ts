import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db/client";
import { countries } from "./db/schema";
import type { Env } from "./env";
import { COUNTRY_DATA } from "./lib/countries";
import countriesRoutes from "./routes/countries";
import dashboardRoutes from "./routes/dashboard";
import ingestRoutes from "./routes/ingest";
import lossesRoutes from "./routes/losses";
import timelineRoutes from "./routes/timeline";
import tweetsRoutes from "./routes/tweets";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: "*",
  }),
);

// Cache public API responses
app.use("/api/*", async (c, next) => {
  await next();
  if (c.req.method === "GET") {
    c.header("Cache-Control", "public, max-age=300, s-maxage=3600");
  }
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/dashboard", dashboardRoutes);
app.route("/api/countries", countriesRoutes);
app.route("/api/losses", lossesRoutes);
app.route("/api/timeline", timelineRoutes);
app.route("/api/tweets", tweetsRoutes);
app.route("/api/internal/ingest", ingestRoutes);

// Seed countries on first request if table is empty
app.get("/api/seed", async (c) => {
  const secret = c.req.query("secret");
  if (secret !== c.env.INGEST_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb(c.env.DB);
  const existing = await db.select().from(countries);

  if (existing.length > 0) {
    return c.json({ message: "Already seeded", count: existing.length });
  }

  for (const country of COUNTRY_DATA) {
    await db.insert(countries).values(country);
  }

  return c.json({ message: "Seeded", count: COUNTRY_DATA.length });
});

// Serve SPA assets for non-API routes
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
