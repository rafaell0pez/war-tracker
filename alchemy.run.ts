import alchemy from "alchemy";
import { D1Database, Website, Worker } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { env } from "./env";

const app = await alchemy("war-tracker", {
  stage: env.STAGE,
  phase: process.argv.includes("--destroy") ? "destroy" : "up",
  stateStore: (scope) =>
    new CloudflareStateStore(scope, {
      apiToken: alchemy.secret(env.CLOUDFLARE_API_TOKEN),
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      stateToken: alchemy.secret(env.ALCHEMY_STATE_TOKEN),
    }),
});

const db = await D1Database(`war-tracker-db-${env.STAGE}`, {
  migrationsDir: "./apps/worker/src/db/migrations",
});

const site = await Website("war-tracker-web", {
  assets: "./apps/web/dist",
});

const isProd = env.STAGE === "prod";

const worker = await Worker("war-tracker", {
  name: isProd ? "war-tracker" : `war-tracker-${env.STAGE}`,
  entrypoint: "./apps/worker/src/worker.ts",
  compatibilityDate: "2025-01-20",
  compatibilityFlags: ["nodejs_compat"],
  domains: isProd ? [{ domainName: "war.gay", adopt: true }] : undefined,
  dev: {
    port: 8787,
  },
  assets: {
    not_found_handling: "single-page-application",
    run_worker_first: true,
  },
  bindings: {
    DB: db,
    ASSETS: site,
    INGEST_SECRET: alchemy.secret(env.INGEST_SECRET),
  },
});

console.log(`Worker URL: ${worker.url}`);

await app.finalize();
