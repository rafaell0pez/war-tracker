import CountryList from "./components/CountryList";
import LossCounters from "./components/LossCounters";
import TimelineView from "./components/TimelineView";
import TweetFeed from "./components/TweetFeed";
import WarEstimate from "./components/WarEstimate";
import { useDashboard, useTweets } from "./hooks/use-dashboard";
import { timeAgo } from "./lib/format";

export default function App() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const { data: tweetsData } = useTweets();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-100 tracking-tight">
              Middle East War Monitor
            </h1>
            <span className="text-xs text-gray-600 font-mono hidden sm:inline">
              wars.today
            </span>
          </div>
          <div className="flex items-center gap-2">
            {dashboard?.lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {timeAgo(dashboard.lastUpdated)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 live-pulse" />
              <span className="font-mono text-xs text-green-400">LIVE</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {isLoading && (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-gray-500">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-red-400">
              Failed to load data. Retrying...
            </p>
          </div>
        )}

        {dashboard && (
          <>
            {/* Loss Counters */}
            <LossCounters losses={dashboard.losses} />

            {/* War Estimate */}
            <WarEstimate estimate={dashboard.estimate} />

            {/* Two-column layout for countries + timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CountryList countries={dashboard.countries} />
              <TimelineView events={dashboard.timeline} />
            </div>

            {/* Tweet feed */}
            <TweetFeed tweets={tweetsData?.tweets ?? []} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-4 py-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-gray-600">
            Data aggregated from verified OSINT sources on X/Twitter.
            Extracted and scored by AI with confidence thresholds.
          </p>
          <p className="text-xs text-gray-700 mt-1">
            This is an automated intelligence feed, not editorial reporting.
          </p>
        </div>
      </footer>
    </div>
  );
}
