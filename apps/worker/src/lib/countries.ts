export interface CountryDefinition {
  code: string;
  name: string;
  category:
    | "direct_combatant"
    | "active_military"
    | "proxy_participant"
    | "logistical_diplomatic"
    | "affected_impacted"
    | "neutral_mediating";
  side: "iran_axis" | "israel_coalition" | "neutral" | "affected";
  subCategory?: string;
  flagEmoji: string;
  notes?: string;
}

export const COUNTRY_DATA: CountryDefinition[] = [
  // === DIRECT COMBATANTS ===
  {
    code: "IR",
    name: "Iran",
    category: "direct_combatant",
    side: "iran_axis",
    flagEmoji: "\u{1F1EE}\u{1F1F7}",
    notes: "IRGC, ballistic missile strikes, drone program",
  },
  {
    code: "IL",
    name: "Israel",
    category: "direct_combatant",
    side: "israel_coalition",
    flagEmoji: "\u{1F1EE}\u{1F1F1}",
    notes: "IDF operations in Gaza, Lebanon, Syria, strikes on Iran",
  },
  {
    code: "US",
    name: "United States",
    category: "direct_combatant",
    side: "israel_coalition",
    flagEmoji: "\u{1F1FA}\u{1F1F8}",
    notes: "CENTCOM forces, carrier groups, strikes on Houthis",
  },

  // === ACTIVE MILITARY ===
  {
    code: "GB",
    name: "United Kingdom",
    category: "active_military",
    side: "israel_coalition",
    flagEmoji: "\u{1F1EC}\u{1F1E7}",
    subCategory: "Naval operations",
    notes: "RAF strikes on Houthis, Royal Navy in Red Sea",
  },

  // === PROXY PARTICIPANTS ===
  {
    code: "LB",
    name: "Lebanon (Hezbollah)",
    category: "proxy_participant",
    side: "iran_axis",
    flagEmoji: "\u{1F1F1}\u{1F1E7}",
    subCategory: "Iran-backed militia",
    notes: "Hezbollah rocket/missile attacks on Israel",
  },
  {
    code: "YE",
    name: "Yemen (Houthis)",
    category: "proxy_participant",
    side: "iran_axis",
    flagEmoji: "\u{1F1FE}\u{1F1EA}",
    subCategory: "Iran-backed militia",
    notes: "Anti-ship missiles, Red Sea shipping disruption",
  },
  {
    code: "PS",
    name: "Palestine (Hamas/PIJ)",
    category: "proxy_participant",
    side: "iran_axis",
    flagEmoji: "\u{1F1F5}\u{1F1F8}",
    subCategory: "Iran-backed militia",
    notes: "Hamas in Gaza, Palestinian Islamic Jihad",
  },
  {
    code: "IQ",
    name: "Iraq (PMF/Militias)",
    category: "proxy_participant",
    side: "iran_axis",
    flagEmoji: "\u{1F1EE}\u{1F1F6}",
    subCategory: "Iran-backed militia",
    notes: "Popular Mobilization Forces, attacks on US bases",
  },
  {
    code: "SY",
    name: "Syria",
    category: "proxy_participant",
    side: "iran_axis",
    flagEmoji: "\u{1F1F8}\u{1F1FE}",
    subCategory: "Theater of operations",
    notes: "IRGC presence, Israeli strikes on Iranian assets",
  },

  // === LOGISTICAL / DIPLOMATIC ===
  {
    code: "DE",
    name: "Germany",
    category: "logistical_diplomatic",
    side: "israel_coalition",
    flagEmoji: "\u{1F1E9}\u{1F1EA}",
    subCategory: "Arms supplier",
  },
  {
    code: "FR",
    name: "France",
    category: "logistical_diplomatic",
    side: "israel_coalition",
    flagEmoji: "\u{1F1EB}\u{1F1F7}",
    subCategory: "Diplomatic support",
  },
  {
    code: "RU",
    name: "Russia",
    category: "logistical_diplomatic",
    side: "iran_axis",
    flagEmoji: "\u{1F1F7}\u{1F1FA}",
    subCategory: "Intelligence/diplomatic",
  },
  {
    code: "CN",
    name: "China",
    category: "logistical_diplomatic",
    side: "iran_axis",
    flagEmoji: "\u{1F1E8}\u{1F1F3}",
    subCategory: "Economic/diplomatic",
    notes: "Oil purchases, UN vetoes",
  },

  // === AFFECTED / IMPACTED ===
  {
    code: "JO",
    name: "Jordan",
    category: "affected_impacted",
    side: "affected",
    flagEmoji: "\u{1F1EF}\u{1F1F4}",
    subCategory: "Airspace/refugees",
  },
  {
    code: "EG",
    name: "Egypt",
    category: "affected_impacted",
    side: "affected",
    flagEmoji: "\u{1F1EA}\u{1F1EC}",
    subCategory: "Suez Canal/refugees",
    notes: "Rafah crossing, trade disruption",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    category: "affected_impacted",
    side: "affected",
    flagEmoji: "\u{1F1F8}\u{1F1E6}",
    subCategory: "Economic/regional stability",
  },
  {
    code: "AE",
    name: "UAE",
    category: "affected_impacted",
    side: "affected",
    flagEmoji: "\u{1F1E6}\u{1F1EA}",
    subCategory: "Economic",
  },

  // === NEUTRAL / MEDIATING ===
  {
    code: "QA",
    name: "Qatar",
    category: "neutral_mediating",
    side: "neutral",
    flagEmoji: "\u{1F1F6}\u{1F1E6}",
    subCategory: "Mediator",
    notes: "Hostage negotiations, Hamas political bureau host",
  },
  {
    code: "OM",
    name: "Oman",
    category: "neutral_mediating",
    side: "neutral",
    flagEmoji: "\u{1F1F4}\u{1F1F2}",
    subCategory: "Back-channel mediator",
  },
  {
    code: "TR",
    name: "Turkey",
    category: "neutral_mediating",
    side: "neutral",
    flagEmoji: "\u{1F1F9}\u{1F1F7}",
    subCategory: "Diplomatic",
    notes: "NATO member, vocal critic of Israel",
  },
  {
    code: "IN",
    name: "India",
    category: "neutral_mediating",
    side: "neutral",
    flagEmoji: "\u{1F1EE}\u{1F1F3}",
    subCategory: "Balancing act",
  },
];
