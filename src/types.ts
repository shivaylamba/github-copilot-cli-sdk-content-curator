/**
 * Type definitions for content-curator CLI
 */

/**
 * Supported platforms for short-form content
 */
export type Platform = "instagram" | "youtube" | "tiktok" | "all";

/**
 * Content types that can be generated
 */
export type ContentType =
  | "search"
  | "ideas"
  | "script"
  | "trending"
  | "hooks"
  | "full";

/**
 * Search result from Exa AI
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
  score?: number;
}

/**
 * A curated content idea based on search results
 */
export interface ContentIdea {
  title: string;
  angle: string;
  targetAudience: string;
  keyPoints: string[];
  trendingScore?: number;
  sources: string[];
}

/**
 * A complete short-form video script
 */
export interface ReelScript {
  /** Catchy title for the content */
  title: string;
  /** Opening hook (first 3 seconds) */
  hook: string;
  /** Main content points */
  body: string[];
  /** Call to action */
  cta: string;
  /** Recording suggestions (camera angles, b-roll, etc.) */
  recordingSuggestion: string;
  /** Visual style recommendations */
  style: string;
  /** Target platform */
  platform: Platform;
  /** Estimated duration in seconds */
  duration: number;
  /** Suggested hashtags */
  hashtags: string[];
  /** Audio/music suggestions */
  audioSuggestion?: string;
}

/**
 * Result from content generation
 */
export interface GenerationResult {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Session context for tracking generation state
 */
export interface SessionContext {
  topic: string;
  platform: Platform;
  searchResults?: SearchResult[];
  ideas?: ContentIdea[];
  scripts?: ReelScript[];
  generatedContent: Map<ContentType, string>;
}

/**
 * Quota information from Copilot
 */
export interface QuotaInfo {
  model?: string;
  usedRequests: number;
  totalRequests: number;
  remainingPercentage: number;
  resetDate?: string;
  isUnlimited: boolean;
}
