import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CountryRecord } from "../lib/api";
import { categoryLabel } from "../lib/format";

interface Props {
  countries: Record<string, CountryRecord[]>;
}

const CATEGORY_ORDER = [
  "direct_combatant",
  "active_military",
  "proxy_participant",
  "logistical_diplomatic",
  "affected_impacted",
  "neutral_mediating",
];

const SIDE_DOT: Record<string, string> = {
  iran_axis: "bg-red-500",
  israel_coalition: "bg-blue-500",
  neutral: "bg-gray-500",
  affected: "bg-gray-500",
};

export default function CountryList({ countries }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set<string>());

  function toggle(cat: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 overflow-hidden">
      <h3 className="font-mono text-sm font-bold text-gray-300 p-4 uppercase tracking-wider border-b border-gray-800">
        Countries by Role
      </h3>
      {CATEGORY_ORDER.map((cat) => {
        const list = countries[cat];
        if (!list?.length) return null;
        const isOpen = expanded.has(cat);
        return (
          <div key={cat}>
            <button
              type="button"
              onClick={() => toggle(cat)}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-800/50 border-b border-gray-800/50"
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-mono text-xs font-semibold text-gray-400 uppercase">
                {categoryLabel(cat)}
              </span>
              <span className="text-xs text-gray-600 ml-auto">
                {list.length}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 py-2 space-y-1">
                {list.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${SIDE_DOT[c.side] ?? "bg-gray-500"}`}
                    />
                    <span className="text-base">{c.flagEmoji}</span>
                    <span className="text-gray-200">{c.name}</span>
                    {c.subCategory && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                        {c.subCategory}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
