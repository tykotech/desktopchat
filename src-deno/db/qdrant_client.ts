// src-deno/db/qdrant_client.ts
export class QdrantClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
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
        console.warn(`Qdrant API request failed with status ${response.status}, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`Qdrant API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      // For network errors, retry if we have attempts left
      if (retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Qdrant API request failed with network error, retrying in ${delayMs}ms...`, error);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  async upsertPoints(collectionName: string, points: any[]): Promise<void> {
    try {
      if (points.length === 0) {
        console.log(`No points to upsert for collection ${collectionName}`);
        return;
      }
      
      console.log(`Upserting ${points.length} points to collection ${collectionName}`);
      
      // Batch points in groups of 100 to avoid large payloads
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize);
        
        const response = await this.fetchWithRetry(`${this.baseUrl}/collections/${collectionName}/points`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          },
          body: JSON.stringify({
            points: batch
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Qdrant upsert error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Small delay between batches to avoid rate limits
        if (i + batchSize < points.length) {
          await this.delay(100);
        }
      }
      
      console.log(`Successfully upserted ${points.length} points to collection ${collectionName}`);
    } catch (error) {
      console.error("Error upserting points to Qdrant:", error);
      throw error;
    }
  }

  async searchCollections(collections: string[], queryVector: number[], options: any): Promise<any[]> {
    try {
      if (collections.length === 0) {
        console.log("No collections to search");
        return [];
      }
      
      console.log(`Searching in ${collections.length} collections with vector of size ${queryVector.length}`);
      
      // Search in each collection and collect results
      const results: any[] = [];
      
      for (const collection of collections) {
        try {
          const response = await this.fetchWithRetry(`${this.baseUrl}/collections/${collection}/points/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.apiKey
            },
            body: JSON.stringify({
              vector: queryVector,
              limit: options.limit || 10,
              with_payload: true,
              with_vector: false
            })
          });
          
          const data = await response.json();
          // Add collection info to each result for debugging
          const collectionResults = data.result.map((item: any) => ({
            ...item,
            collection: collection
          }));
          results.push(...collectionResults);
        } catch (error) {
          console.warn(`Qdrant search failed for collection ${collection}:`, error);
        }
      }
      
      // Sort results by score and return top results
      results.sort((a, b) => b.score - a.score);
      const finalResults = results.slice(0, options.limit || 10);
      console.log(`Search completed, found ${finalResults.length} results`);
      return finalResults;
    } catch (error) {
      console.error("Error searching Qdrant collections:", error);
      throw error;
    }
  }

  async createCollection(collectionName: string, vectorSize: number): Promise<void> {
    try {
      console.log(`Creating collection ${collectionName} with vector size ${vectorSize}`);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/collections/${collectionName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: "Cosine"
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qdrant create collection error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      console.log(`Successfully created collection ${collectionName}`);
    } catch (error) {
      console.error("Error creating Qdrant collection:", error);
      throw error;
    }
  }
  
  async deleteCollection(collectionName: string): Promise<void> {
    try {
      console.log(`Deleting collection ${collectionName}`);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/collections/${collectionName}`, {
        method: 'DELETE',
        headers: {
          'api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qdrant delete collection error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      console.log(`Successfully deleted collection ${collectionName}`);
    } catch (error) {
      console.error("Error deleting Qdrant collection:", error);
      throw error;
    }
  }
  
  async listCollections(): Promise<string[]> {
    try {
      console.log("Listing Qdrant collections");
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/collections`, {
        headers: {
          'api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qdrant list collections error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const collections = data.result.collections.map((c: any) => c.name);
      console.log(`Found ${collections.length} collections`);
      return collections;
    } catch (error) {
      console.error("Error listing Qdrant collections:", error);
      throw error;
    }
  }
  
  async getCollectionInfo(collectionName: string): Promise<any> {
    try {
      console.log(`Getting info for collection ${collectionName}`);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/collections/${collectionName}`, {
        headers: {
          'api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qdrant get collection info error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Retrieved info for collection ${collectionName}`);
      return data;
    } catch (error) {
      console.error("Error getting Qdrant collection info:", error);
      throw error;
    }
  }
  
  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      console.log(`Checking if collection ${collectionName} exists`);
      
      const response = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        headers: {
          'api-key': this.apiKey
        }
      });
      
      if (response.ok) {
        console.log(`Collection ${collectionName} exists`);
        return true;
      } else if (response.status === 404) {
        console.log(`Collection ${collectionName} does not exist`);
        return false;
      } else {
        const errorText = await response.text();
        throw new Error(`Qdrant API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error checking if Qdrant collection exists:", error);
      throw error;
    }
  }
}