export interface TweetAuthor {
  userName: string;
  name: string;
  isBlueVerified: boolean;
  followers: number;
}

export interface RawTweet {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  author: TweetAuthor;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  lang: string;
}

interface SearchResponse {
  tweets: RawTweet[];
  has_next_page: boolean;
  next_cursor: string;
}

const BASE_URL = "https://api.twitterapi.io";

export async function searchTweets(
  apiKey: string,
  query: string,
  maxPages = 2,
): Promise<RawTweet[]> {
  const allTweets: RawTweet[] = [];
  let cursor = "";

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      query,
      queryType: "Latest",
    });
    if (cursor) params.set("cursor", cursor);

    const response = await fetch(
      `${BASE_URL}/twitter/tweet/advanced_search?${params}`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      },
    );

    if (!response.ok) {
      console.error(
        `Twitter API error: ${response.status} ${response.statusText}`,
      );
      break;
    }

    const data = (await response.json()) as SearchResponse;

    if (data.tweets?.length) {
      allTweets.push(...data.tweets);
    }

    if (!data.has_next_page || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return allTweets;
}
