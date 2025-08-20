// src-deno/lib/clients/anthropic.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class AnthropicClient implements LLMClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(private apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "https://api.anthropic.com/v1";
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
        console.warn(`Anthropic API request failed with status ${response.status}, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      // For network errors, retry if we have attempts left
      if (retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Anthropic API request failed with network error, retrying in ${delayMs}ms...`, error);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    // Anthropic doesn't have a public embeddings API yet
    // For now, we'll return dummy embeddings
    console.warn("Anthropic embeddings API not available, returning dummy embeddings");
    return texts.map(() => Array(1536).fill(0).map(() => Math.random() - 0.5));
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: payload.model,
          messages: [{ role: "user", content: payload.prompt }],
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
              
              if (parsed.type === "content_block_delta" && parsed.delta && parsed.delta.text) {
                yield {
                  content: parsed.delta.text,
                  finishReason: undefined
                };
              } else if (parsed.type === "message_stop") {
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
      console.error("Error streaming chat completion from Anthropic:", error);
      throw error;
    }
  }
}