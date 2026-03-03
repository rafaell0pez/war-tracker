const BASE = "/api";

export interface DashboardData {
  losses: Record<
    string,
    Record<string, { total: number; highConfidence: number; count: number }>
  >;
  countries: Record<string, CountryRecord[]>;
  countryCount: number;
  timeline: TimelineEvent[];
  estimate: WarEstimate | null;
  lastUpdated: string | null;
}

export interface CountryRecord {
  code: string;
  name: string;
  category: string;
  side: string;
  subCategory: string | null;
  notes: string | null;
  flagEmoji: string | null;
  eventCount: number | null;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  significance: number;
  confidence: number;
}

export interface WarEstimate {
  id: string;
  estimatedEndDate: string | null;
  estimatedDurationDays: number | null;
  currentPhase: string | null;
  summary: string;
  keyFactors: string | null;
  confidenceLevel: string;
  generatedAt: string;
}

export interface TweetRecord {
  id: string;
  tweetUrl: string;
  authorUsername: string;
  authorName: string;
  authorVerified: boolean | null;
  text: string;
  likeCount: number | null;
  retweetCount: number | null;
  tweetCreatedAt: string;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${BASE}/dashboard`);
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchTweets(): Promise<{ tweets: TweetRecord[] }> {
  const res = await fetch(`${BASE}/tweets?limit=20`);
  if (!res.ok) throw new Error(`Tweets fetch failed: ${res.status}`);
  return res.json();
}
