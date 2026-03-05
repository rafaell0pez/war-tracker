import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "@vnedyalk0v/react19-simple-maps";
import type { CountryRecord } from "../lib/api";
import { categoryLabel } from "../lib/format";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO 3166-1 numeric → alpha-2 for tracked countries
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  "364": "IR", // Iran
  "376": "IL", // Israel
  "840": "US", // United States
  "826": "GB", // United Kingdom
  "422": "LB", // Lebanon
  "887": "YE", // Yemen
  "275": "PS", // Palestine
  "368": "IQ", // Iraq
  "760": "SY", // Syria
  "276": "DE", // Germany
  "250": "FR", // France
  "643": "RU", // Russia
  "156": "CN", // China
  "400": "JO", // Jordan
  "818": "EG", // Egypt
  "682": "SA", // Saudi Arabia
  "784": "AE", // UAE
  "634": "QA", // Qatar
  "512": "OM", // Oman
  "792": "TR", // Turkey
  "356": "IN", // India
};

const SIDE_COLORS: Record<string, string> = {
  iran_axis: "#dc2626",
  israel_coalition: "#2563eb",
  neutral: "#6b7280",
  affected: "#d97706",
};

const SIDE_HOVER: Record<string, string> = {
  iran_axis: "#ef4444",
  israel_coalition: "#3b82f6",
  neutral: "#9ca3af",
  affected: "#f59e0b",
};

interface Props {
  countries: Record<string, CountryRecord[]>;
}

interface TooltipState {
  x: number;
  y: number;
  country: CountryRecord;
}

export default function ConflictMap({ countries }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const countryByCode = useMemo(() => {
    const map = new Map<string, CountryRecord>();
    for (const list of Object.values(countries)) {
      for (const c of list) {
        map.set(c.code, c);
      }
    }
    return map;
  }, [countries]);

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 overflow-hidden relative">
      <h3 className="font-mono text-sm font-bold text-gray-300 p-4 uppercase tracking-wider border-b border-gray-800">
        Conflict Map
      </h3>

      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [45, 28],
            scale: 400,
          }}
          width={800}
          height={450}
          style={{ width: "100%", height: "auto", background: "#030712" }}
        >
          <ZoomableGroup>
            <Geographies
              geography={GEO_URL}
              fallback={
                <text
                  x={400}
                  y={225}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize={14}
                >
                  Loading map...
                </text>
              }
            >
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any, i: number) => {
                  const numericId = String(geo.id);
                  const alpha2 = NUMERIC_TO_ALPHA2[numericId];
                  const country = alpha2
                    ? countryByCode.get(alpha2)
                    : undefined;
                  const fill = country
                    ? (SIDE_COLORS[country.side] ?? "#1f2937")
                    : "#1f2937";
                  const hoverFill = country
                    ? (SIDE_HOVER[country.side] ?? "#374151")
                    : "#374151";

                  return (
                    <Geography
                      key={geo.rsmKey ?? geo.id ?? i}
                      geography={geo}
                      fill={fill}
                      stroke="#111827"
                      strokeWidth={0.5}
                      onMouseEnter={(evt: React.MouseEvent) => {
                        if (country) {
                          const target = evt.target as SVGElement;
                          target.style.fill = hoverFill;
                          setTooltip({
                            x: evt.clientX,
                            y: evt.clientY,
                            country,
                          });
                        }
                      }}
                      onMouseLeave={(evt: React.MouseEvent) => {
                        const target = evt.target as SVGElement;
                        target.style.fill = fill;
                        setTooltip(null);
                      }}
                      style={{
                        default: {
                          outline: "none",
                          cursor: country ? "pointer" : "default",
                        },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltip && (
          <div
            className="fixed z-50 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{tooltip.country.flagEmoji}</span>
              <span className="font-semibold text-gray-100">
                {tooltip.country.name}
              </span>
            </div>
            <div className="text-gray-400">
              {categoryLabel(tooltip.country.category)}
            </div>
            {tooltip.country.subCategory && (
              <div className="text-gray-500 mt-0.5">
                {tooltip.country.subCategory}
              </div>
            )}
            {tooltip.country.notes && (
              <div className="text-gray-500 mt-0.5 max-w-48">
                {tooltip.country.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-4 py-3 justify-center border-t border-gray-800">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-red-600" /> Iran Axis
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-blue-600" /> Israel Coalition
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-amber-600" /> Affected
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-sm bg-gray-500" /> Neutral /
          Mediating
        </span>
      </div>
    </div>
  );
}
