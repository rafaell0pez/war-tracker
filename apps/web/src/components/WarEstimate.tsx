import type { WarEstimate as WarEstimateType } from "../lib/api";
import { confidenceLabel, timeAgo } from "../lib/format";

interface Props {
  estimate: WarEstimateType | null;
}

const PHASE_COLORS: Record<string, string> = {
  escalation: "text-red-400",
  active_conflict: "text-orange-400",
  stalemate: "text-yellow-400",
  de_escalation: "text-green-400",
};

export default function WarEstimate({ estimate }: Props) {
  if (!estimate) {
    return (
      <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
        <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
          War Estimate
        </h3>
        <p className="text-sm text-gray-500 italic">
          Waiting for first analysis...
        </p>
      </div>
    );
  }

  const phaseColor =
    PHASE_COLORS[estimate.currentPhase ?? ""] ?? "text-gray-400";

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider">
          War Estimate
        </h3>
        <span className="text-xs text-gray-500">
          AI Confidence:{" "}
          <span className="font-mono font-semibold text-gray-400">
            {confidenceLabel(estimate.confidenceLevel)}
          </span>
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-3">
        {estimate.currentPhase && (
          <div>
            <span className="text-xs text-gray-500">Phase</span>
            <p className={`font-mono text-sm font-semibold ${phaseColor}`}>
              {estimate.currentPhase.replace(/_/g, " ").toUpperCase()}
            </p>
          </div>
        )}
        {estimate.estimatedDurationDays && (
          <div>
            <span className="text-xs text-gray-500">Est. Duration</span>
            <p className="font-mono text-sm font-semibold text-gray-200">
              {Math.round(estimate.estimatedDurationDays / 30)} months
            </p>
          </div>
        )}
        {estimate.estimatedEndDate && (
          <div>
            <span className="text-xs text-gray-500">Est. End</span>
            <p className="font-mono text-sm font-semibold text-gray-200">
              {estimate.estimatedEndDate}
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-400 leading-relaxed">
        {estimate.summary}
      </p>

      <p className="text-xs text-gray-600 mt-3 italic">
        Generated {timeAgo(estimate.generatedAt)}. This is AI speculation, not a
        prediction.
      </p>
    </div>
  );
}
