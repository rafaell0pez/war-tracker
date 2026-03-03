import type { RawTweet } from "./twitter";

interface LossEvent {
  id: string;
  tweetId: string;
  side: "iran_axis" | "israel_coalition" | "civilian";
  country: string;
  category: string;
  value: number;
  unit: string | null;
  description: string | null;
  confidence: number;
  eventDate: string | null;
  location: string | null;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  significance: number;
  sourceTweetIds: string;
  confidence: number;
}

export interface ExtractionResult {
  lossEvents: LossEvent[];
  timelineEvents: TimelineEvent[];
}

const SYSTEM_PROMPT = `You are a military conflict data extraction system analyzing tweets about the Iran-Israel-USA conflict.

RULES:
- Only extract CONCRETE claims with numbers. Ignore opinions, predictions, speculation.
- Assign confidence based on source credibility and claim specificity:
  - 0.9-1.0: Official military/government statement with specific numbers
  - 0.7-0.89: Credible OSINT account with specific claim, photo/video evidence
  - 0.5-0.69: News report citing unnamed sources, single-source claim
  - 0.3-0.49: Unverified claim, vague numbers ("dozens"), partisan source
  - 0.0-0.29: Rumor, clearly propagandistic, contradicted by evidence
- Side assignment:
  - iran_axis: Iran, Hezbollah, Houthis, Hamas, PIJ, Iraqi PMF, Syrian forces
  - israel_coalition: Israel, USA, UK, allied forces
  - civilian: Civilian casualties on any side
- Return valid JSON only. No markdown, no explanation.`;

function buildPrompt(tweets: RawTweet[]): string {
  const tweetTexts = tweets
    .map(
      (t) =>
        `[ID:${t.id}] @${t.author.userName} (${t.author.followers} followers, verified:${t.author.isBlueVerified}): ${t.text}`,
    )
    .join("\n\n");

  return `Analyze these tweets and extract all war-related loss/event data.

TWEETS:
${tweetTexts}

Respond with JSON:
{
  "events": [
    {
      "tweetId": "...",
      "side": "iran_axis" | "israel_coalition" | "civilian",
      "country": "XX",
      "category": "military_killed" | "military_wounded" | "military_captured" | "civilian_killed" | "civilian_wounded" | "civilian_displaced" | "equipment_destroyed" | "infrastructure_damaged" | "economic_cost_usd",
      "value": 0,
      "unit": "..." | null,
      "description": "...",
      "confidence": 0.0,
      "eventDate": "YYYY-MM-DD" | null,
      "location": "..." | null
    }
  ],
  "timelineEvents": [
    {
      "title": "...",
      "description": "...",
      "eventDate": "YYYY-MM-DD",
      "category": "military_operation" | "diplomatic" | "escalation" | "de_escalation" | "humanitarian" | "sanctions" | "infrastructure",
      "significance": 1,
      "tweetIds": ["..."],
      "confidence": 0.0
    }
  ]
}`;
}

export async function extractFromTweets(
  tweets: RawTweet[],
): Promise<ExtractionResult> {
  if (tweets.length === 0) {
    return { lossEvents: [], timelineEvents: [] };
  }

  const prompt = buildPrompt(tweets);
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

  // Spawn claude -p subprocess
  const proc = Bun.spawn(
    ["claude", "-p", fullPrompt, "--output-format", "json"],
    {
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
      },
    },
  );

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error("Claude extraction failed:", stderr);
    return { lossEvents: [], timelineEvents: [] };
  }

  // Parse the Claude response — it returns JSON with a "result" field
  let parsed: { result?: string };
  try {
    parsed = JSON.parse(stdout);
  } catch {
    console.error("Failed to parse Claude output:", stdout.slice(0, 500));
    return { lossEvents: [], timelineEvents: [] };
  }

  // The actual JSON is inside the result string
  const resultText = parsed.result ?? stdout;
  let data: {
    events?: Array<{
      tweetId: string;
      side: string;
      country: string;
      category: string;
      value: number;
      unit: string | null;
      description: string | null;
      confidence: number;
      eventDate: string | null;
      location: string | null;
    }>;
    timelineEvents?: Array<{
      title: string;
      description: string;
      eventDate: string;
      category: string;
      significance: number;
      tweetIds: string[];
      confidence: number;
    }>;
  };

  try {
    // Try to extract JSON from the result
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      data = JSON.parse(jsonMatch[0]);
    } else {
      data = JSON.parse(resultText);
    }
  } catch {
    console.error(
      "Failed to parse extraction result:",
      resultText.slice(0, 500),
    );
    return { lossEvents: [], timelineEvents: [] };
  }

  const lossEvents: LossEvent[] = (data.events ?? []).map((e, i) => ({
    id: `${Date.now()}-${i}`,
    tweetId: e.tweetId,
    side: e.side as LossEvent["side"],
    country: e.country,
    category: e.category,
    value: e.value,
    unit: e.unit,
    description: e.description,
    confidence: e.confidence,
    eventDate: e.eventDate,
    location: e.location,
  }));

  const timelineEvents: TimelineEvent[] = (data.timelineEvents ?? []).map(
    (e, i) => ({
      id: `tl-${Date.now()}-${i}`,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      category: e.category,
      significance: e.significance,
      sourceTweetIds: JSON.stringify(e.tweetIds),
      confidence: e.confidence,
    }),
  );

  return { lossEvents, timelineEvents };
}
