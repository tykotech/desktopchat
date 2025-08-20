// src-deno/lib/clients/cohere.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class CohereClient implements LLMClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(private apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "https://api.cohere.ai/v1";
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
        console.warn(`Cohere API request failed with status ${response.status}, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`Cohere API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      // For network errors, retry if we have attempts left
      if (retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Cohere API request failed with network error, retrying in ${delayMs}ms...`, error);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/embed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          texts: texts,
          model: model || "embed-english-v3.0",
          input_type: "search_document"
        })
      });

      const data = await response.json();
      return data.embeddings;
    } catch (error) {
      console.error("Error generating embeddings with Cohere:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          message: payload.prompt,
          model: payload.model,
          temperature: payload.temperature || 0.7,
          max_tokens: payload.maxTokens || 2048,
          stream: true
        })
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            if (data === "[DONE]") {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.event_type === "text-generation" && parsed.text) {
                yield {
                  content: parsed.text,
                  finishReason: undefined
                };
              } else if (parsed.event_type === "stream-end") {
                yield {
                  content: "",
                  finishReason: "stop"
                };
                return;
              }
            } catch (parseError) {
              console.warn("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming chat completion from Cohere:", error);
      throw error;
    }
  }
}