/**
 * Exa AI Search Service
 * Direct integration with Exa AI API for real-time web search
 */

import Exa from "exa-js";
import type { SearchResult } from "../types.js";

// Use any type for Exa client to avoid import issues
type ExaClient = any;

export interface ExaSearchOptions {
  numResults?: number;
  type?: "neural" | "keyword" | "auto";
  useAutoprompt?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
  startPublishedDate?: string;
  endPublishedDate?: string;
  category?: string;
}

export interface ExaSearchResult {
  results: SearchResult[];
  autopromptString?: string;
}

/**
 * ExaService provides real-time web search capabilities
 */
export class ExaService {
  private client: ExaClient | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXA_API_KEY;
    if (this.apiKey) {
      this.client = new (Exa as any)(this.apiKey);
    }
  }

  /**
   * Check if Exa is configured
   */
  isConfigured(): boolean {
    return !!this.client;
  }

  /**
   * Search the web and get text contents
   */
  async searchAndContents(
    query: string,
    options: ExaSearchOptions = {}
  ): Promise<ExaSearchResult> {
    if (!this.client) {
      throw new Error("Exa API key not configured. Set EXA_API_KEY environment variable.");
    }

    const {
      numResults = 10,
      type = "auto",
      useAutoprompt = true,
      includeDomains,
      excludeDomains,
      startPublishedDate,
      endPublishedDate,
      category,
    } = options;

    try {
      const response = await this.client.searchAndContents(query, {
        numResults,
        type,
        useAutoprompt,
        includeDomains,
        excludeDomains,
        startPublishedDate,
        endPublishedDate,
        category,
        text: { maxCharacters: 2000 },
        highlights: true,
      });

      const results: SearchResult[] = response.results.map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
        snippet: r.highlights?.join(" ") || r.text?.substring(0, 500) || "",
        publishedDate: r.publishedDate,
        author: r.author,
        score: r.score,
      }));

      return {
        results,
        autopromptString: response.autopromptString,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      throw new Error(`Exa search failed: ${message}`);
    }
  }

  /**
   * Search for trending/recent content
   */
  async searchTrending(
    topic: string,
    options: ExaSearchOptions = {}
  ): Promise<ExaSearchResult> {
    // Search for content from the last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.searchAndContents(topic, {
      ...options,
      startPublishedDate: weekAgo.toISOString().split("T")[0],
      numResults: options.numResults || 15,
    });
  }

  /**
   * Search for content ideas and inspiration
   */
  async searchContentIdeas(
    topic: string,
    options: ExaSearchOptions = {}
  ): Promise<ExaSearchResult> {
    // Search for viral/popular content about the topic
    const queries = [
      `viral ${topic} content`,
      `${topic} trending tips`,
      `best ${topic} content ideas`,
    ];

    const allResults: SearchResult[] = [];

    for (const query of queries) {
      try {
        const response = await this.searchAndContents(query, {
          ...options,
          numResults: 5,
        });
        allResults.push(...response.results);
      } catch {
        // Continue with other queries if one fails
      }
    }

    // Deduplicate by URL
    const uniqueResults = allResults.filter(
      (result, index, self) => index === self.findIndex((r) => r.url === result.url)
    );

    return { results: uniqueResults };
  }

  /**
   * Find similar content to a URL
   */
  async findSimilar(
    url: string,
    options: { numResults?: number; excludeSourceDomain?: boolean } = {}
  ): Promise<ExaSearchResult> {
    if (!this.client) {
      throw new Error("Exa API key not configured. Set EXA_API_KEY environment variable.");
    }

    const { numResults = 10, excludeSourceDomain = true } = options;

    try {
      const response = await this.client.findSimilarAndContents(url, {
        numResults,
        excludeSourceDomain,
        text: { maxCharacters: 1500 },
        highlights: true,
      });

      const results: SearchResult[] = response.results.map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
        snippet: r.highlights?.join(" ") || r.text?.substring(0, 500) || "",
        publishedDate: r.publishedDate,
        author: r.author,
        score: r.score,
      }));

      return { results };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      throw new Error(`Exa find similar failed: ${message}`);
    }
  }

  /**
   * Format search results for LLM context
   */
  formatResultsForLLM(results: SearchResult[]): string {
    if (results.length === 0) {
      return "No search results found.";
    }

    return results
      .map((r, i) => {
        const date = r.publishedDate
          ? ` (${new Date(r.publishedDate).toLocaleDateString()})`
          : "";
        const author = r.author ? ` by ${r.author}` : "";
        return `[${i + 1}] ${r.title}${date}${author}\nURL: ${r.url}\n${r.snippet}\n`;
      })
      .join("\n---\n");
  }
}

// Singleton instance
let exaService: ExaService | null = null;

export function getExaService(): ExaService {
  if (!exaService) {
    exaService = new ExaService();
  }
  return exaService;
}
