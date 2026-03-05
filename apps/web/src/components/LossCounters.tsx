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

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  military_killed: "Military personnel confirmed killed in action",
  military_wounded: "Military personnel reported wounded",
  military_captured: "Military personnel captured or taken prisoner",
  civilian_killed: "Civilian deaths from conflict-related violence",
  civilian_wounded: "Civilians injured in conflict zones",
  civilian_displaced: "People forced to flee their homes",
  equipment_destroyed:
    "Military vehicles, aircraft, or weapons systems destroyed",
  infrastructure_damaged:
    "Buildings, utilities, or facilities damaged or destroyed",
  economic_cost_usd: "Estimated economic losses in US dollars",
};

function LossCard({
  title,
  color,
  borderColor,
  accentColor,
  data,
}: {
  title: string;
  color: string;
  borderColor: string;
  accentColor: string;
  data: Record<string, LossData> | undefined;
}) {
  return (
    <div className={`border ${borderColor} border-l-2 ${accentColor} rounded-lg bg-gray-900/50 p-4`}>
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
            <div
              key={cat}
              className="flex items-center justify-between group/row relative"
            >
              <span className="text-xs text-gray-400">
                {categoryLabel(cat)}
              </span>
              <div className="text-right">
                <span className="font-mono text-sm font-semibold text-gray-100 tabular-nums count-animate">
                  {formatter(d.highConfidence)}
                </span>
                {d.total !== d.highConfidence && (
                  <span className="ml-2 font-mono text-xs text-gray-500">
                    ({formatter(d.total)})
                  </span>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/row:block z-10 w-56 p-2.5 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 pointer-events-none">
                <p className="mb-1.5">{CATEGORY_DESCRIPTIONS[cat]}</p>
                <div className="border-t border-gray-700 pt-1.5 space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">High confidence</span>
                    <span className="text-gray-200 font-mono">
                      {formatter(d.highConfidence)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total reported</span>
                    <span className="text-gray-200 font-mono">
                      {formatter(d.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source events</span>
                    <span className="text-gray-200 font-mono">{d.count}</span>
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
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
  const totalCost = Object.values(losses).reduce((sum, sideData) => {
    const econ = sideData?.economic_cost_usd;
    return sum + (econ?.highConfidence ?? 0);
  }, 0);

  const totalCostAll = Object.values(losses).reduce((sum, sideData) => {
    const econ = sideData?.economic_cost_usd;
    return sum + (econ?.total ?? 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LossCard
          title="Iran Axis"
          color="text-red-400"
          borderColor="border-red-900/50"
          accentColor="border-l-red-500"
          data={losses.iran_axis}
        />
        <LossCard
          title="Israel Coalition"
          color="text-blue-400"
          borderColor="border-blue-900/50"
          accentColor="border-l-blue-500"
          data={losses.israel_coalition}
        />
        <LossCard
          title="Civilians"
          color="text-amber-400"
          borderColor="border-amber-900/50"
          accentColor="border-l-amber-500"
          data={losses.civilian}
        />
      </div>

      {totalCost > 0 && (
        <div className="border border-gray-800 rounded-lg bg-gray-900/50 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">
            Estimated Total War Cost
          </span>
          <div className="text-right">
            <span className="font-mono text-lg font-bold text-gray-100">
              {formatCurrency(totalCost)}
            </span>
            {totalCostAll !== totalCost && (
              <span className="ml-2 font-mono text-sm text-gray-500">
                ({formatCurrency(totalCostAll)})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
