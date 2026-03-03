import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// === Raw Tweet Storage ===

export const tweets = sqliteTable(
  "tweets",
  {
    id: text("id").primaryKey(),
    tweetUrl: text("tweet_url").notNull(),
    authorUsername: text("author_username").notNull(),
    authorName: text("author_name").notNull(),
    authorVerified: integer("author_verified", { mode: "boolean" }).default(
      false,
    ),
    authorFollowers: integer("author_followers").default(0),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0),
    retweetCount: integer("retweet_count").default(0),
    replyCount: integer("reply_count").default(0),
    viewCount: integer("view_count").default(0),
    lang: text("lang"),
    tweetCreatedAt: text("tweet_created_at").notNull(),
    fetchedAt: text("fetched_at").default(sql`(datetime('now'))`).notNull(),
  },
  (table) => [
    index("idx_tweets_created").on(table.tweetCreatedAt),
    index("idx_tweets_author").on(table.authorUsername),
  ],
);

// === Claude-Extracted Loss Events ===

export const lossEvents = sqliteTable(
  "loss_events",
  {
    id: text("id").primaryKey(),
    tweetId: text("tweet_id")
      .notNull()
      .references(() => tweets.id, { onDelete: "cascade" }),
    side: text("side", {
      enum: ["iran_axis", "israel_coalition", "civilian"],
    }).notNull(),
    country: text("country").notNull(),
    category: text("category", {
      enum: [
        "military_killed",
        "military_wounded",
        "military_captured",
        "civilian_killed",
        "civilian_wounded",
        "civilian_displaced",
        "equipment_destroyed",
        "infrastructure_damaged",
        "economic_cost_usd",
      ],
    }).notNull(),
    value: real("value").notNull(),
    unit: text("unit"),
    description: text("description"),
    confidence: real("confidence").notNull(),
    extractedAt: text("extracted_at").default(sql`(datetime('now'))`).notNull(),
    eventDate: text("event_date"),
    location: text("location"),
  },
  (table) => [
    index("idx_loss_events_side").on(table.side),
    index("idx_loss_events_category").on(table.category),
    index("idx_loss_events_country").on(table.country),
    index("idx_loss_events_confidence").on(table.confidence),
  ],
);

// === Precomputed Aggregates ===

export const aggregatedLosses = sqliteTable(
  "aggregated_losses",
  {
    id: text("id").primaryKey(),
    side: text("side", {
      enum: ["iran_axis", "israel_coalition", "civilian"],
    }).notNull(),
    category: text("category").notNull(),
    totalValue: real("total_value").notNull(),
    highConfidenceValue: real("high_confidence_value").notNull(),
    eventCount: integer("event_count").notNull(),
    lastUpdated: text("last_updated").default(sql`(datetime('now'))`).notNull(),
  },
  (table) => [index("idx_agg_side").on(table.side)],
);

// === Country Classifications ===

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  category: text("category", {
    enum: [
      "direct_combatant",
      "active_military",
      "proxy_participant",
      "logistical_diplomatic",
      "affected_impacted",
      "neutral_mediating",
    ],
  }).notNull(),
  side: text("side", {
    enum: ["iran_axis", "israel_coalition", "neutral", "affected"],
  }).notNull(),
  subCategory: text("sub_category"),
  notes: text("notes"),
  flagEmoji: text("flag_emoji"),
  eventCount: integer("event_count").default(0),
});

// === Timeline Events ===

export const timelineEvents = sqliteTable(
  "timeline_events",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    eventDate: text("event_date").notNull(),
    category: text("category", {
      enum: [
        "military_operation",
        "diplomatic",
        "escalation",
        "de_escalation",
        "humanitarian",
        "sanctions",
        "infrastructure",
      ],
    }).notNull(),
    significance: integer("significance").notNull(),
    sourceTweetIds: text("source_tweet_ids"),
    confidence: real("confidence").notNull(),
    createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  },
  (table) => [
    index("idx_timeline_date").on(table.eventDate),
    index("idx_timeline_significance").on(table.significance),
  ],
);

// === War Estimate ===

export const warEstimate = sqliteTable("war_estimate", {
  id: text("id").primaryKey(),
  estimatedEndDate: text("estimated_end_date"),
  estimatedDurationDays: integer("estimated_duration_days"),
  currentPhase: text("current_phase"),
  summary: text("summary").notNull(),
  keyFactors: text("key_factors"),
  confidenceLevel: text("confidence_level", {
    enum: ["very_low", "low", "medium", "high"],
  }).notNull(),
  generatedAt: text("generated_at").default(sql`(datetime('now'))`).notNull(),
});

// === Cron Run Log ===

export const cronRuns = sqliteTable("cron_runs", {
  id: text("id").primaryKey(),
  startedAt: text("started_at").default(sql`(datetime('now'))`).notNull(),
  completedAt: text("completed_at"),
  tweetsFound: integer("tweets_found").default(0),
  tweetsProcessed: integer("tweets_processed").default(0),
  eventsExtracted: integer("events_extracted").default(0),
  errors: text("errors"),
  status: text("status", {
    enum: ["running", "completed", "failed"],
  }).notNull(),
});
