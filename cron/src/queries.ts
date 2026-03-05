export interface SearchQuery {
  id: string;
  query: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// Tier 1: Established OSINT analysts
const OSINT_CORE = [
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

// Tier 2: OSINT specialists
const OSINT_SPECIALIST = [
  "TheStudyofWar",
  "CalibreObscura",
  "Osinttechnical",
  "ArmchairW",
];

const ALL_OSINT = [...OSINT_CORE, ...OSINT_SPECIALIST];
const osintFrom = ALL_OSINT.map((a) => `from:${a}`).join(" OR ");

// Tier 3: Institutional / wire services
const INSTITUTIONAL = ["AJEnglish", "Reuters", "AP"];
const institutionalFrom = INSTITUTIONAL.map((a) => `from:${a}`).join(" OR ");

// Tier 4: Iran-side sources
const IRAN_SOURCES = ["PressTV", "IrnaEnglish", "Tasnimnews_EN"];
const iranFrom = IRAN_SOURCES.map((a) => `from:${a}`).join(" OR ");

// Tier 5: Israel-side sources
const ISRAEL_SOURCES = ["kann_news", "N12News", "Jerusalem_Post"];
const israelFrom = ISRAEL_SOURCES.map((a) => `from:${a}`).join(" OR ");

// Tier 6: Humanitarian organizations
const HUMANITARIAN = ["UNICEF", "UNRWA", "MSF"];
const humanitarianFrom = HUMANITARIAN.map((a) => `from:${a}`).join(" OR ");

export const SEARCH_QUERIES: SearchQuery[] = [
  {
    id: "osint_main",
    query: `(${osintFrom}) (Iran OR Israel OR IDF OR IRGC OR Hezbollah OR Houthi) (strike OR attack OR missile OR drone OR intercept OR casualties)`,
    description: "OSINT accounts reporting military events",
    priority: "high",
  },
  {
    id: "institutional",
    query: `(${institutionalFrom}) (Iran OR Israel OR Gaza OR Hezbollah OR Houthi) (strike OR attack OR killed OR ceasefire) -is:retweet`,
    description: "Al Jazeera, Reuters, AP conflict reports",
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
    id: "iran_perspective",
    query: `(${iranFrom}) (Israel OR IDF OR strike OR attack OR missile OR response) -is:retweet`,
    description: "Iran-side official/semi-official reporting",
    priority: "medium",
  },
  {
    id: "israel_perspective",
    query: `(${israelFrom}) (Iran OR Hezbollah OR Hamas OR Houthi OR strike OR rocket) -is:retweet`,
    description: "Israel-side media reporting",
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
  {
    id: "humanitarian",
    query: `(${humanitarianFrom}) (Gaza OR Lebanon OR Yemen OR casualties OR displaced OR humanitarian) -is:retweet`,
    description: "Humanitarian organization situation reports",
    priority: "low",
  },
];
