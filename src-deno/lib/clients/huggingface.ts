// src-deno/lib/clients/huggingface.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class HuggingFaceClient implements LLMClient {
  private baseUrl: string;

  constructor(private apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "https://api-inference.huggingface.co";
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      // Hugging Face inference API for embeddings
      const response = await fetch(`${this.baseUrl}/pipeline/feature-extraction/${model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: texts,
          options: {
            wait_for_model: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face Embeddings API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      // Hugging Face returns embeddings in different formats depending on the model
      // For sentence transformers, it's typically a 2D array
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        return data;
      } else if (Array.isArray(data)) {
        // Single embedding case
        return [data];
      } else {
        throw new Error("Unexpected response format from Hugging Face embeddings API");
      }
    } catch (error) {
      console.error("Error generating embeddings with Hugging Face:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      const response = await fetch(`${this.baseUrl}/models/${payload.model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          inputs: payload.prompt,
          parameters: {
            temperature: payload.temperature || 0.7,
            max_new_tokens: payload.maxTokens || 2048,
            return_full_text: false
          },
          options: {
            wait_for_model: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face Chat API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Hugging Face inference API doesn't stream by default
      // We'll return the full response as a single chunk
      if (data && data[0] && data[0].generated_text) {
        yield {
          content: data[0].generated_text,
          finishReason: "stop"
        };
      } else if (typeof data === "string") {
        yield {
          content: data,
          finishReason: "stop"
        };
      } else {
        throw new Error("Unexpected response format from Hugging Face chat API");
      }
    } catch (error) {
      console.error("Error with chat completion from Hugging Face:", error);
      throw error;
    }
  }
}