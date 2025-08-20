// src-deno/lib/clients/ollama_sdk.ts
import ollama from "ollama/browser";
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class OllamaSDKClient implements LLMClient {
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.baseUrl = baseUrl || "http://localhost:11434";
    // The ollama client doesn't have a baseUrl property in the browser version
    // We'll need to handle this differently
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      console.log(`Generating embeddings for ${texts.length} texts using model: ${model}`);
      
      const embeddings = [];
      for (const text of texts) {
        const response = await ollama.embeddings({
          model: model || "nomic-embed-text",
          prompt: text
        });
        embeddings.push(response.embedding);
      }

      console.log(`Generated embeddings for ${embeddings.length} texts`);
      return embeddings;
    } catch (error) {
      console.error("Error generating embeddings with Ollama SDK:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      console.log(`Streaming chat completion with model: ${payload.model}`);
      
      const stream = await ollama.chat({
        model: payload.model,
        messages: [{ role: "user", content: payload.prompt }],
        stream: true,
        options: {
          temperature: payload.temperature || 0.7,
          num_predict: payload.maxTokens || 2048,
        }
      });

      for await (const chunk of stream) {
        if (chunk.message?.content) {
          yield {
            content: chunk.message.content
          };
        }
      }
      
      console.log("Chat completion stream finished");
    } catch (error) {
      console.error("Error streaming chat completion from Ollama SDK:", error);
      throw error;
    }
  }
}