// src-deno/lib/clients/ollama.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class OllamaClient implements LLMClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(private apiKey: string, baseUrl?: string) {
    // Ollama typically runs locally, default to localhost
    this.baseUrl = baseUrl || "http://localhost:11434";
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
        console.warn(`Ollama API request failed with status ${response.status}, retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      // For other errors, throw immediately
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      // For network errors, retry if we have attempts left
      if (retries > 0) {
        const delayMs = this.baseDelay * Math.pow(2, this.maxRetries - retries);
        console.warn(`Ollama API request failed with network error, retrying in ${delayMs}ms...`, error);
        await this.delay(delayMs);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      console.log(`Generating embeddings for ${texts.length} texts using Ollama model: ${model || "nomic-embed-text"}`);
      
      const embeddings: number[][] = [];
      
      // Ollama embeddings endpoint processes one text at a time
      for (const text of texts) {
        const response = await this.fetchWithRetry(`${this.baseUrl}/api/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model || "nomic-embed-text",
            prompt: text
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama Embeddings API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        embeddings.push(data.embedding);
      }
      
      console.log(`Generated embeddings for ${embeddings.length} texts`);
      return embeddings;
    } catch (error) {
      console.error("Error generating embeddings with Ollama:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      console.log(`Streaming chat completion with Ollama model: ${payload.model}`);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: payload.model,
          messages: [{ role: "user", content: payload.prompt }],
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama Chat API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let hasReceivedData = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        hasReceivedData = true;
        const text = decoder.decode(value);
        const lines = text.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              
              if (parsed.message && parsed.message.content) {
                yield {
                  content: parsed.message.content,
                  finishReason: parsed.done ? "stop" : undefined
                };
              }
              
              if (parsed.done) {
                console.log("Ollama chat completion stream finished");
                return;
              }
            } catch (parseError) {
              console.warn("Error parsing JSON line:", parseError);
            }
          }
        }
      }
      
      // If we never received any data, log a warning
      if (!hasReceivedData) {
        console.warn("No data received from Ollama streaming response");
      }
    } catch (error) {
      console.error("Error streaming chat completion from Ollama:", error);
      throw error;
    }
  }
}