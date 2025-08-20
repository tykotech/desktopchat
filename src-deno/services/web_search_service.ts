// src-deno/services/web_search_service.ts
import { SettingsService } from "./settings_service.ts";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export class WebSearchService {
  private static maxRetries: number = 3;
  private static baseDelay: number = 1000; // 1 second

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = this.maxRetries
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // If the response is successful, return it
      if (response.ok) {
        return response;
      }
      
      // For rate limiting (429) or server errors (5xx), retry if we have attempts left
      if ((response.status === 429 || response.status >= 500) && retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Web search API request failed with status ${response.status}, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`Web search API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      // For network errors, retry if we have attempts left
      if (retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Web search API request failed with network error, retrying in ${delayMs}ms...`, error);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  static async testConnection(provider: string): Promise<boolean> {
    try {
      const settings = await SettingsService.getAppSettings();

      switch (provider) {
        case "brave":
          if (!settings.braveApiKey) return false;
          return (await this.fetchWithRetry(
            "https://api.search.brave.com/res/v1/web/search?q=test",
            {
              headers: {
                "Accept": "application/json",
                "X-Subscription-Token": settings.braveApiKey,
              },
            },
            1,
          )).ok;
        case "google":
          if (!settings.googleApiKey || !settings.googleCseId) return false;
          return (await this.fetchWithRetry(
            `https://www.googleapis.com/customsearch/v1?key=${settings.googleApiKey}&cx=${settings.googleCseId}&q=test`,
            { headers: { "Accept": "application/json" } },
            1,
          )).ok;
        case "serp":
          if (!settings.serpApiKey) return false;
          return (await this.fetchWithRetry(
            `https://serpapi.com/search.json?q=test&api_key=${settings.serpApiKey}`,
            { headers: { "Accept": "application/json" } },
            1,
          )).ok;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing web search provider ${provider}:`, error);
      return false;
    }
  }

  static async search(query: string, provider?: string, maxResults: number = 10): Promise<SearchResult[]> {
    try {
      const settings = await SettingsService.getAppSettings();
      const searchProvider = provider || settings.defaultWebSearchProvider;
      
      let results: SearchResult[] = [];
      
      switch (searchProvider) {
        case "brave":
          results = await this.searchWithBrave(query, settings.braveApiKey);
          break;
        case "google":
          results = await this.searchWithGoogle(query, settings.googleApiKey, settings.googleCseId);
          break;
        case "serp":
          results = await this.searchWithSerp(query, settings.serpApiKey);
          break;
        default:
          throw new Error(`Unsupported web search provider: ${searchProvider}`);
      }
      
      // Filter and rank results
      return this.filterAndRankResults(results, query, maxResults);
    } catch (error) {
      console.error("Error performing web search:", error);
      // Return empty array instead of throwing to prevent breaking the RAG pipeline
      return [];
    }
  }
  
  private static filterAndRankResults(results: SearchResult[], query: string, maxResults: number): SearchResult[] {
    try {
      // Remove duplicates based on URL
      const uniqueResults = results.filter((result, index, self) =>
        index === self.findIndex(r => r.url === result.url)
      );
      
      // Rank results based on relevance to query
      const rankedResults = uniqueResults.map(result => {
        try {
          // Calculate a more sophisticated relevance score
          const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
          
          const title = (result.title || "").toLowerCase();
          const snippet = (result.snippet || "").toLowerCase();
          
          // Count exact matches and partial matches
          let relevanceScore = 0;
          
          for (const term of queryTerms) {
            // Exact matches in title (weighted highest)
            const titleExactMatches = (title.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
            relevanceScore += titleExactMatches * 3;
            
            // Partial matches in title
            const titlePartialMatches = (title.match(new RegExp(term, 'g')) || []).length;
            relevanceScore += titlePartialMatches * 1;
            
            // Exact matches in snippet
            const snippetExactMatches = (snippet.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
            relevanceScore += snippetExactMatches * 2;
            
            // Partial matches in snippet
            const snippetPartialMatches = (snippet.match(new RegExp(term, 'g')) || []).length;
            relevanceScore += snippetPartialMatches * 0.5;
          }
          
          return {
            ...result,
            relevanceScore
          };
        } catch (error) {
          console.warn("Error calculating relevance score for result:", error);
          return {
            ...result,
            relevanceScore: 0
          };
        }
      });
      
      // Sort by relevance score (descending)
      rankedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      // Return top results
      return rankedResults.slice(0, maxResults);
    } catch (error) {
      console.error("Error filtering and ranking search results:", error);
      // Return original results if filtering fails
      return results.slice(0, maxResults);
    }
  }
  
  private static async searchWithBrave(query: string, apiKey?: string): Promise<SearchResult[]> {
    if (!apiKey) {
      throw new Error("Brave Search API key is not configured");
    }
    
    try {
      const response = await this.fetchWithRetry(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=20`,
        {
          headers: {
            "Accept": "application/json",
            "X-Subscription-Token": apiKey
          }
        }
      );
      
      const data = await response.json();
      // deno-lint-ignore no-explicit-any
      return (data.web?.results || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.description
      }));
    } catch (error) {
      console.error("Error searching with Brave:", error);
      throw error;
    }
  }
  
  private static async searchWithGoogle(query: string, apiKey?: string, cx?: string): Promise<SearchResult[]> {
    if (!apiKey || !cx) {
      throw new Error("Google Search API key or Custom Search Engine ID is not configured");
    }
    
    try {
      const response = await this.fetchWithRetry(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=20`,
        {
          headers: {
            "Accept": "application/json"
          }
        }
      );
      
      const data = await response.json();
      // deno-lint-ignore no-explicit-any
      return (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet
      }));
    } catch (error) {
      console.error("Error searching with Google:", error);
      throw error;
    }
  }
  
  private static async searchWithSerp(query: string, apiKey?: string): Promise<SearchResult[]> {
    if (!apiKey) {
      throw new Error("SERP API key is not configured");
    }
    
    try {
      const response = await this.fetchWithRetry(
        `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=20`,
        {
          headers: {
            "Accept": "application/json"
          }
        }
      );
      
      const data = await response.json();
      // deno-lint-ignore no-explicit-any
      return (data.organic_results || []).map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet
      }));
    } catch (error) {
      console.error("Error searching with SERP:", error);
      throw error;
    }
  }
}

export function testWebSearchConnection(
  provider: string,
): Promise<boolean> {
  return WebSearchService.testConnection(provider);
}