// src-deno/lib/clients/deepseek.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class DeepSeekClient implements LLMClient {
  private baseUrl: string;

  constructor(private apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "https://api.deepseek.com/v1";
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          input: texts,
          model: model || "deepseek-embedding"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek Embeddings API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error("Error generating embeddings with DeepSeek:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek Chat API error: ${response.status} ${response.statusText} - ${errorText}`);
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
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            if (data === "[DONE]") {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const choice = parsed.choices[0];
              
              if (choice.delta && choice.delta.content) {
                yield {
                  content: choice.delta.content,
                  finishReason: choice.finish_reason
                };
              }
            } catch (parseError) {
              console.warn("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming chat completion from DeepSeek:", error);
      throw error;
    }
  }
}