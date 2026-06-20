export type MediaType = "image" | "gif" | "video" | "hls";

export interface FeedPost {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string;
}

// Deprecated aliases kept for backward compatibility with older call sites.
// Prefer `mediaUrl` / `mediaType` going forward.
export interface LegacyFeedPost extends FeedPost {
  videoUrl?: string;
}