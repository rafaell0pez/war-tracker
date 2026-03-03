import { z } from "zod";

const envSchema = z.object({
  STAGE: z.string(),
  CLOUDFLARE_API_TOKEN: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  ALCHEMY_STATE_TOKEN: z.string(),
  INGEST_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

function formatZodError(error: z.ZodError): string {
  const lines = ["Environment variable validation failed:"];
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    lines.push(`  - ${path}: ${issue.message}`);
  }
  lines.push("");
  lines.push("Make sure to set all required environment variables.");
  lines.push("Copy .env.example to .env and fill in the values.");
  return lines.join("\n");
}

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(formatZodError(result.error));
  process.exit(1);
}

export const env = result.data;
