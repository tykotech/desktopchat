// src-deno/lib/clients/anthropic_sdk.ts
import Anthropic from "anthropic";
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class AnthropicSDKClient implements LLMClient {
  private client: Anthropic;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || "dummy-key", // API key required but not used for local endpoints
      baseURL: baseUrl || "https://api.anthropic.com",
      dangerouslyAllowBrowser: true, // Required for Deno
    });
    this.baseUrl = baseUrl || "https://api.anthropic.com";
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    // Anthropic doesn't have a native embeddings API
    // For now, we'll throw an error - in a real implementation you might want to
    // use a different provider for embeddings when using Anthropic for chat
    throw new Error("Anthropic does not provide native embeddings API");
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      console.log(`Streaming chat completion with model: ${payload.model}`);
      
      const stream = this.client.messages.stream({
        model: payload.model,
        messages: [{ role: "user", content: payload.prompt }],
        temperature: payload.temperature || 0.7,
        max_tokens: payload.maxTokens || 2048,
      });

      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta?.text) {
          yield {
            content: chunk.delta.text
          };
        }
      }
      
      console.log("Chat completion stream finished");
    } catch (error) {
      console.error("Error streaming chat completion from Anthropic SDK:", error);
      throw error;
    }
  }
}