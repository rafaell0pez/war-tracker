import type { TweetRecord } from "../lib/api";
import { timeAgo } from "../lib/format";

interface Props {
  tweets: TweetRecord[];
}

export default function TweetFeed({ tweets }: Props) {
  if (tweets.length === 0) {
    return (
      <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
        <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
          Recent Sources
        </h3>
        <p className="text-sm text-gray-500 italic">No tweets ingested yet</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 p-4">
      <h3 className="font-mono text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
        Recent Sources
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="border-b border-gray-800/50 pb-2 last:border-0"
          >
            <div className="flex items-center gap-2 mb-1">
              <a
                href={tweet.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-400 hover:text-blue-300"
              >
                @{tweet.authorUsername}
              </a>
              {tweet.authorVerified && (
                <span className="text-xs text-blue-500">V</span>
              )}
              <span className="text-xs text-gray-600 ml-auto">
                {timeAgo(tweet.tweetCreatedAt)}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{tweet.text}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-gray-600">
                {tweet.likeCount ?? 0} likes
              </span>
              <span className="text-xs text-gray-600">
                {tweet.retweetCount ?? 0} RT
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
