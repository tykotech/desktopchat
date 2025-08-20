// src-deno/lib/clients/azure_openai.ts
import { LLMClient, ChatPayload, ChatChunk } from "../llm_factory.ts";

export class AzureOpenAIClient implements LLMClient {
  private baseUrl: string;

  constructor(private apiKey: string, baseUrl: string) {
    // Azure OpenAI requires a specific endpoint format
    this.baseUrl = baseUrl;
  }

  async generateEmbeddings(texts: string[], model: string): Promise<number[][]> {
    try {
      // Azure OpenAI embedding endpoint
      const response = await fetch(`${this.baseUrl}/embeddings?api-version=2023-05-15`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey
        },
        body: JSON.stringify({
          input: texts,
          model: model || "text-embedding-ada-002"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Embeddings API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error("Error generating embeddings with Azure OpenAI:", error);
      throw error;
    }
  }

  async *streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk> {
    try {
      // Extract deployment name from base URL or use model name
      const deploymentName = this.extractDeploymentName(payload.model);
      
      const response = await fetch(`${this.baseUrl}/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: payload.prompt }],
          temperature: payload.temperature || 0.7,
          max_tokens: payload.maxTokens || 2048,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Chat API error: ${response.status} ${response.statusText} - ${errorText}`);
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
      console.error("Error streaming chat completion from Azure OpenAI:", error);
      throw error;
    }
  }

  private extractDeploymentName(model: string): string {
    // In Azure OpenAI, the deployment name is part of the URL
    // If the model contains a URL-like structure, extract the deployment name
    // Otherwise, use the model name as the deployment name
    try {
      const url = new URL(this.baseUrl);
      // Extract deployment name from the URL path
      const pathParts = url.pathname.split('/');
      const deploymentsIndex = pathParts.indexOf('deployments');
      if (deploymentsIndex !== -1 && deploymentsIndex + 1 < pathParts.length) {
        return pathParts[deploymentsIndex + 1];
      }
    } catch {
      // If URL parsing fails, fall back to using model name
    }
    
    // Default to using the model name as deployment name
    return model;
  }
}