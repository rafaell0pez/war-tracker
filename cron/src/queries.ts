export interface SearchQuery {
  id: string;
  query: string;
  description: string;
  priority: "high" | "medium" | "low";
}

const OSINT_ACCOUNTS = [
  "IntelCrab",
  "Liveuamap",
  "sentdefender",
  "AuroraIntel",
  "OSINTdefender",
  "ELINTNews",
  "WarMonitor3",
  "Tendar",
  "JasonMBrodsky",
  "CharlesBLister",
  "IranIntl_En",
  "IsraelRadar_com",
  "GeoConfirmed",
];

const osintFrom = OSINT_ACCOUNTS.map((a) => `from:${a}`).join(" OR ");

export const SEARCH_QUERIES: SearchQuery[] = [
  {
    id: "osint_main",
    query: `(${osintFrom}) (Iran OR Israel OR IDF OR IRGC OR Hezbollah OR Houthi) (strike OR attack OR missile OR drone OR intercept OR casualties)`,
    description: "OSINT accounts reporting military events",
    priority: "high",
  },
  {
    id: "casualties",
    query: `(Israel OR IDF OR Iran OR IRGC OR Hezbollah OR Hamas OR Houthi) (killed OR wounded OR casualties OR KIA OR WIA) -is:retweet min_faves:50`,
    description: "Casualty reports with engagement filter",
    priority: "high",
  },
  {
    id: "equipment",
    query: `(Israel OR Iran) (destroyed OR shot down OR intercepted) (tank OR aircraft OR drone OR missile OR air defense) -is:retweet min_faves:20`,
    description: "Equipment loss reports",
    priority: "medium",
  },
  {
    id: "proxies",
    query: `(Hezbollah OR Houthi OR "Islamic Jihad" OR "PMF") (attack OR strike OR launch OR fire) -is:retweet min_faves:30`,
    description: "Proxy force activity",
    priority: "medium",
  },
  {
    id: "diplomatic",
    query: `(Iran OR Israel OR "United States") (ceasefire OR negotiations OR sanctions OR escalation OR retaliation) -is:retweet min_faves:100`,
    description: "Diplomatic and escalation events",
    priority: "low",
  },
  {
    id: "red_sea",
    query: `("Red Sea" OR "Bab el-Mandeb") (Houthi OR attack OR ship OR missile) -is:retweet min_faves:20`,
    description: "Red Sea shipping disruption",
    priority: "medium",
  },
];
