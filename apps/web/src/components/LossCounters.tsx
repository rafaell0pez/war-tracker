import { categoryLabel, formatCurrency, formatNumber } from "../lib/format";

interface LossData {
  total: number;
  highConfidence: number;
  count: number;
}

interface Props {
  losses: Record<string, Record<string, LossData>>;
}

const LOSS_CATEGORIES = [
  "military_killed",
  "military_wounded",
  "military_captured",
  "civilian_killed",
  "civilian_wounded",
  "civilian_displaced",
  "equipment_destroyed",
  "infrastructure_damaged",
  "economic_cost_usd",
];

function LossCard({
  title,
  color,
  borderColor,
  data,
}: {
  title: string;
  color: string;
  borderColor: string;
  data: Record<string, LossData> | undefined;
}) {
  return (
    <div className={`border ${borderColor} rounded-lg bg-gray-900/50 p-4`}>
      <h3
        className={`font-mono text-sm font-bold ${color} mb-3 uppercase tracking-wider`}
      >
        {title}
      </h3>
      <div className="space-y-2">
        {LOSS_CATEGORIES.map((cat) => {
          const d = data?.[cat];
          if (!d || d.total === 0) return null;
          const isCurrency = cat === "economic_cost_usd";
          const formatter = isCurrency ? formatCurrency : formatNumber;
          return (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {categoryLabel(cat)}
              </span>
              <div className="text-right">
                <span className="font-mono text-sm font-semibold text-gray-100 count-animate">
                  {formatter(d.highConfidence)}
                </span>
                {d.total !== d.highConfidence && (
                  <span className="ml-2 font-mono text-xs text-gray-500">
                    ({formatter(d.total)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {(!data || Object.keys(data).length === 0) && (
          <p className="text-xs text-gray-600 italic">No data yet</p>
        )}
      </div>
    </div>
  );
}

export default function LossCounters({ losses }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <LossCard
        title="Iran Axis"
        color="text-red-400"
        borderColor="border-red-900/50"
        data={losses.iran_axis}
      />
      <LossCard
        title="Israel Coalition"
        color="text-blue-400"
        borderColor="border-blue-900/50"
        data={losses.israel_coalition}
      />
      <LossCard
        title="Civilians"
        color="text-amber-400"
        borderColor="border-amber-900/50"
        data={losses.civilian}
      />
    </div>
  );
}
