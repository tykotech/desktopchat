// src-deno/lib/clients/google.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class GoogleClient implements LLMClient {
  private baseUrl: string;

  constructor(private apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      // Google's embedding model
      const embeddingModel = model || "models/embedding-001";
      
      // For Google, we need to process each text individually
      const embeddings: number[][] = [];
      
      for (const text of texts) {
        const response = await fetch(`${this.baseUrl}/${embeddingModel}:embedContent?key=${this.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: embeddingModel,
            content: {
              parts: [{
                text: text
              }]
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Google Embeddings API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        embeddings.push(data.embedding.values);
      }
      
      return embeddings;
    } catch (error) {
      console.error("Error generating embeddings with Google:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      // Google's chat model
      const chatModel = payload.model || "models/gemini-pro";
      
      const response = await fetch(`${this.baseUrl}/${chatModel}:streamGenerateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: payload.prompt
            }]
          }],
          generationConfig: {
            temperature: payload.temperature || 0.7,
            maxOutputTokens: payload.maxTokens || 2048
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Chat API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

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
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              
              // Google's response format
              if (parsed.candidates && parsed.candidates.length > 0) {
                const candidate = parsed.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                  const text = candidate.content.parts[0].text;
                  if (text) {
                    yield {
                      content: text,
                      finishReason: candidate.finishReason
                    };
                  }
                }
              }
            } catch (parseError) {
              console.warn("Error parsing JSON line:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming chat completion from Google:", error);
      throw error;
    }
  }
}