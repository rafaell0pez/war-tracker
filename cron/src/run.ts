import { cleanOld, isProcessed, markProcessed } from "./dedup";
import { extractFromTweets, generateWarEstimate } from "./extractor";
import { pushToWorker } from "./ingest";
import { SEARCH_QUERIES } from "./queries";
import { type RawTweet, searchTweets } from "./twitter";

const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const WORKER_INGEST_URL = process.env.WORKER_INGEST_URL;
const WORKER_INGEST_SECRET = process.env.WORKER_INGEST_SECRET;

if (!TWITTER_API_KEY || !WORKER_INGEST_URL || !WORKER_INGEST_SECRET) {
  console.error(
    "Missing env vars: TWITTER_API_KEY, WORKER_INGEST_URL, WORKER_INGEST_SECRET",
  );
  process.exit(1);
}

const runId = `run-${Date.now()}`;
const startedAt = new Date().toISOString();
let tweetsFound = 0;
let tweetsProcessed = 0;
let eventsExtracted = 0;
const errors: string[] = [];

console.log(`[${runId}] Starting cron run at ${startedAt}`);

// Determine which queries to run based on current hour
const hour = new Date().getHours();
const queriesToRun = SEARCH_QUERIES.filter((q) => {
  if (q.priority === "high") return true;
  if (q.priority === "medium") return hour % 2 === 0;
  return hour % 4 === 0;
});

console.log(`[${runId}] Running ${queriesToRun.length} queries (hour=${hour})`);

// Fetch tweets from all queries
const allTweets: RawTweet[] = [];
for (const query of queriesToRun) {
  try {
    console.log(`[${runId}] Searching: ${query.description}`);
    const results = await searchTweets(TWITTER_API_KEY, query.query, 2);
    console.log(`[${runId}]   Found ${results.length} tweets`);
    allTweets.push(...results);
  } catch (err) {
    const msg = `Query ${query.id} failed: ${err}`;
    console.error(`[${runId}] ${msg}`);
    errors.push(msg);
  }
}

tweetsFound = allTweets.length;

// Deduplicate against already-processed tweets
const newTweets = allTweets.filter((t) => !isProcessed(t.id));
console.log(
  `[${runId}] ${newTweets.length} new tweets after dedup (${allTweets.length - newTweets.length} duplicates)`,
);

if (newTweets.length === 0) {
  console.log(`[${runId}] No new tweets to process`);
  // Still push cron run status
  await pushToWorker(WORKER_INGEST_URL, WORKER_INGEST_SECRET, {
    cronRun: {
      id: runId,
      startedAt,
      completedAt: new Date().toISOString(),
      tweetsFound,
      tweetsProcessed: 0,
      eventsExtracted: 0,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
      status: "completed",
    },
  });
  process.exit(0);
}

// Format tweets for ingest
const tweetRecords = newTweets.map((t) => ({
  id: t.id,
  tweetUrl: t.url,
  authorUsername: t.author.userName,
  authorName: t.author.name,
  authorVerified: t.author.isBlueVerified,
  authorFollowers: t.author.followers,
  text: t.text,
  likeCount: t.likeCount,
  retweetCount: t.retweetCount,
  replyCount: t.replyCount,
  viewCount: t.viewCount,
  lang: t.lang,
  tweetCreatedAt: t.createdAt,
}));

// Batch tweets for Claude extraction (20 per batch)
const BATCH_SIZE = 20;
const allLossEvents: Array<Record<string, unknown>> = [];
const allTimelineEvents: Array<Record<string, unknown>> = [];

for (let i = 0; i < newTweets.length; i += BATCH_SIZE) {
  const batch = newTweets.slice(i, i + BATCH_SIZE);
  console.log(
    `[${runId}] Extracting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} tweets)`,
  );

  try {
    const result = await extractFromTweets(batch);
    allLossEvents.push(...result.lossEvents);
    allTimelineEvents.push(...result.timelineEvents);
    tweetsProcessed += batch.length;
    eventsExtracted += result.lossEvents.length + result.timelineEvents.length;
    console.log(
      `[${runId}]   Extracted ${result.lossEvents.length} loss events, ${result.timelineEvents.length} timeline events`,
    );
  } catch (err) {
    const msg = `Extraction batch failed: ${err}`;
    console.error(`[${runId}] ${msg}`);
    errors.push(msg);
  }
}

// Mark all new tweets as processed
markProcessed(newTweets.map((t) => t.id));

// Generate war estimate from accumulated data
let warEstimateData: Record<string, unknown> | undefined;
if (allLossEvents.length > 0 || allTimelineEvents.length > 0) {
  console.log(`[${runId}] Generating war estimate...`);
  try {
    const estimate = await generateWarEstimate(allLossEvents, allTimelineEvents);
    if (estimate) {
      warEstimateData = estimate;
      console.log(
        `[${runId}]   War estimate: phase=${estimate.currentPhase}`,
      );
    }
  } catch (err) {
    const msg = `War estimate generation failed: ${err}`;
    console.error(`[${runId}] ${msg}`);
    errors.push(msg);
  }
}

// Push everything to the Worker
console.log(
  `[${runId}] Pushing to worker: ${tweetRecords.length} tweets, ${allLossEvents.length} loss events, ${allTimelineEvents.length} timeline events`,
);

const ingestResult = await pushToWorker(
  WORKER_INGEST_URL,
  WORKER_INGEST_SECRET,
  {
    tweets: tweetRecords,
    lossEvents: allLossEvents,
    timelineEvents: allTimelineEvents,
    warEstimate: warEstimateData,
    cronRun: {
      id: runId,
      startedAt,
      completedAt: new Date().toISOString(),
      tweetsFound,
      tweetsProcessed,
      eventsExtracted,
      errors: errors.length > 0 ? JSON.stringify(errors) : null,
      status:
        errors.length > 0 && tweetsProcessed === 0 && eventsExtracted === 0
          ? "failed"
          : "completed",
    },
  },
);

console.log(`[${runId}] Ingest result:`, ingestResult);

// Clean old dedup entries
cleanOld(30);

console.log(
  `[${runId}] Done. Found=${tweetsFound} Processed=${tweetsProcessed} Extracted=${eventsExtracted} Errors=${errors.length}`,
);
