CREATE TABLE `aggregated_losses` (
	`id` text PRIMARY KEY NOT NULL,
	`side` text NOT NULL,
	`category` text NOT NULL,
	`total_value` real NOT NULL,
	`high_confidence_value` real NOT NULL,
	`event_count` integer NOT NULL,
	`last_updated` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_agg_side` ON `aggregated_losses` (`side`);--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`side` text NOT NULL,
	`sub_category` text,
	`notes` text,
	`flag_emoji` text,
	`event_count` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `cron_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text DEFAULT (datetime('now')) NOT NULL,
	`completed_at` text,
	`tweets_found` integer DEFAULT 0,
	`tweets_processed` integer DEFAULT 0,
	`events_extracted` integer DEFAULT 0,
	`errors` text,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loss_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tweet_id` text NOT NULL,
	`side` text NOT NULL,
	`country` text NOT NULL,
	`category` text NOT NULL,
	`value` real NOT NULL,
	`unit` text,
	`description` text,
	`confidence` real NOT NULL,
	`extracted_at` text DEFAULT (datetime('now')) NOT NULL,
	`event_date` text,
	`location` text,
	FOREIGN KEY (`tweet_id`) REFERENCES `tweets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_loss_events_side` ON `loss_events` (`side`);--> statement-breakpoint
CREATE INDEX `idx_loss_events_category` ON `loss_events` (`category`);--> statement-breakpoint
CREATE INDEX `idx_loss_events_country` ON `loss_events` (`country`);--> statement-breakpoint
CREATE INDEX `idx_loss_events_confidence` ON `loss_events` (`confidence`);--> statement-breakpoint
CREATE TABLE `timeline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`event_date` text NOT NULL,
	`category` text NOT NULL,
	`significance` integer NOT NULL,
	`source_tweet_ids` text,
	`confidence` real NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_timeline_date` ON `timeline_events` (`event_date`);--> statement-breakpoint
CREATE INDEX `idx_timeline_significance` ON `timeline_events` (`significance`);--> statement-breakpoint
CREATE TABLE `tweets` (
	`id` text PRIMARY KEY NOT NULL,
	`tweet_url` text NOT NULL,
	`author_username` text NOT NULL,
	`author_name` text NOT NULL,
	`author_verified` integer DEFAULT false,
	`author_followers` integer DEFAULT 0,
	`text` text NOT NULL,
	`like_count` integer DEFAULT 0,
	`retweet_count` integer DEFAULT 0,
	`reply_count` integer DEFAULT 0,
	`view_count` integer DEFAULT 0,
	`lang` text,
	`tweet_created_at` text NOT NULL,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tweets_created` ON `tweets` (`tweet_created_at`);--> statement-breakpoint
CREATE INDEX `idx_tweets_author` ON `tweets` (`author_username`);--> statement-breakpoint
CREATE TABLE `war_estimate` (
	`id` text PRIMARY KEY NOT NULL,
	`estimated_end_date` text,
	`estimated_duration_days` integer,
	`current_phase` text,
	`summary` text NOT NULL,
	`key_factors` text,
	`confidence_level` text NOT NULL,
	`generated_at` text DEFAULT (datetime('now')) NOT NULL
);
