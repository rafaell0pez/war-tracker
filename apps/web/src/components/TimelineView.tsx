import type { TimelineEvent } from "../lib/api";
import { confidenceColor } from "../lib/format";

interface Props {
  events: TimelineEvent[];
}

const CATEGORY_ICON: Record<string, string> = {
  military_operation: "//",
  diplomatic: "~~",
  escalation: "!!",
  de_escalation: "--",
  humanitarian: "++",
  sanctions: "$$",
  infrastructure: "##",
};

export default function TimelineView({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
        <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
          Timeline
        </h3>
        <p className="text-sm text-gray-500 italic">No events yet</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
      <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
        Timeline
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <span className="font-mono text-xs text-gray-600">
                {CATEGORY_ICON[event.category] ?? "**"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs text-gray-500">
                  {event.eventDate}
                </span>
                <span
                  className={`text-xs font-mono ${confidenceColor(event.confidence)}`}
                >
                  {event.confidence.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-200 font-medium">{event.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {event.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div
                className="h-2 bg-gray-700 rounded-full overflow-hidden"
                style={{ width: "60px" }}
              >
                <div
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${(event.significance / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
