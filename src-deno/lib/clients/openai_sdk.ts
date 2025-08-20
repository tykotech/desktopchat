// src-deno/lib/clients/openai_sdk.ts
import OpenAI from "openai";
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class OpenAISDKClient implements LLMClient {
  private client: OpenAI;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || "dummy-key", // API key required but not used for local endpoints
      baseURL: baseUrl || "https://api.openai.com/v1",
      dangerouslyAllowBrowser: true, // Required for Deno
    });
    this.baseUrl = baseUrl || "https://api.openai.com/v1";
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      console.log(`Generating embeddings for ${texts.length} texts using model: ${model || "text-embedding-3-small"}`);
      
      const response = await this.client.embeddings.create({
        input: texts,
        model: model || "text-embedding-3-small"
      });

      console.log(`Generated embeddings for ${response.data.length} texts`);
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error("Error generating embeddings with OpenAI SDK:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      console.log(`Streaming chat completion with model: ${payload.model}`);
      
      const stream = await this.client.chat.completions.create({
        model: payload.model,
        messages: [{ role: "user", content: payload.prompt }],
        temperature: payload.temperature || 0.7,
        max_tokens: payload.maxTokens || 2048,
        stream: true
      });

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice?.delta?.content) {
          yield {
            content: choice.delta.content,
            finishReason: choice.finish_reason ?? undefined
          };
        }
      }
      
      console.log("Chat completion stream finished");
    } catch (error) {
      console.error("Error streaming chat completion from OpenAI SDK:", error);
      throw error;
    }
  }
}