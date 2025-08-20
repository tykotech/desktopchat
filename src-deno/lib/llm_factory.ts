// src-deno/lib/llm_factory.ts
import { OpenAISDKClient } from "./clients/openai_sdk.ts";
import { AnthropicSDKClient } from "./clients/anthropic_sdk.ts";
import { OllamaSDKClient } from "./clients/ollama_sdk.ts";
import { CohereClient } from "./clients/cohere.ts";
import { MistralClient } from "./clients/mistral.ts";
import { GroqClient } from "./clients/groq.ts";
import { TogetherClient } from "./clients/together.ts";
import { GoogleClient } from "./clients/google.ts";
import { AzureOpenAIClient } from "./clients/azure_openai.ts";
import { HuggingFaceClient } from "./clients/huggingface.ts";
import { XAIClient } from "./clients/xai.ts";
import { DeepSeekClient } from "./clients/deepseek.ts";
import { SecretsService } from "../services/secrets_service.ts";

export interface LLMClient {
  generateEmbeddings(texts: string[], model: string): Promise<number[][]>;
  streamChatCompletion(payload: ChatPayload): AsyncGenerator<ChatChunk>;
}

export interface ChatPayload {
  prompt: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatChunk {
  content: string;
  finishReason?: string;
}

export class LLMFactory {
  static getClient(providerId: string, apiKey: string, baseUrl?: string): LLMClient {
    switch (providerId) {
      case "openai":
        return new OpenAISDKClient(apiKey, baseUrl);
      case "anthropic":
        return new AnthropicSDKClient(apiKey, baseUrl);
      case "cohere":
        return new CohereClient(apiKey, baseUrl);
      case "ollama":
        return new OllamaSDKClient(apiKey, baseUrl);
      case "mistral":
        return new MistralClient(apiKey, baseUrl);
      case "groq":
        return new GroqClient(apiKey, baseUrl);
      case "together":
        return new TogetherClient(apiKey, baseUrl);
      case "google":
        return new GoogleClient(apiKey, baseUrl);
      case "azure-openai":
        if (!baseUrl) {
          throw new Error("Azure OpenAI requires a base URL");
        }
        return new AzureOpenAIClient(apiKey, baseUrl);
      case "huggingface":
        return new HuggingFaceClient(apiKey, baseUrl);
      case "xai":
        return new XAIClient(apiKey, baseUrl);
      case "deepseek":
        return new DeepSeekClient(apiKey, baseUrl);
      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }
  
  static async getClientForModel(model: string): Promise<LLMClient> {
    try {
      // This determines the provider based on the model name
      if (model.startsWith("gpt-")) {
        // Retrieve the API key from secrets
        const apiKey = await SecretsService.getSecret("openai_api_key") || "";
        return this.getClient("openai", apiKey);
      } else if (model.startsWith("claude-")) {
        // Retrieve the API key from secrets
        const apiKey = await SecretsService.getSecret("anthropic_api_key") || "";
        return this.getClient("anthropic", apiKey);
      } else if (model.startsWith("command-") || model.startsWith("embed-")) {
        // Cohere models
        const apiKey = await SecretsService.getSecret("cohere_api_key") || "";
        return this.getClient("cohere", apiKey);
      } else if (model.includes("ollama") || model.includes("llama") || model.includes("mistral")) {
        // Ollama models (running locally)
        return this.getClient("ollama", "", "http://localhost:11434");
      } else if (model.startsWith("mistral-")) {
        // Mistral models
        const apiKey = await SecretsService.getSecret("mistral_api_key") || "";
        return this.getClient("mistral", apiKey);
      } else if (model.startsWith("groq-")) {
        // Groq models
        const apiKey = await SecretsService.getSecret("groq_api_key") || "";
        return this.getClient("groq", apiKey);
      } else if (model.includes("together")) {
        // Together models
        const apiKey = await SecretsService.getSecret("together_api_key") || "";
        return this.getClient("together", apiKey);
      } else if (model.includes("gemini-") || model.includes("text-embedding")) {
        // Google models
        const apiKey = await SecretsService.getSecret("google_api_key") || "";
        return this.getClient("google", apiKey);
      } else if (model.includes("grok")) {
        // xAI models
        const apiKey = await SecretsService.getSecret("xai_api_key") || "";
        return this.getClient("xai", apiKey);
      } else if (model.includes("deepseek")) {
        // DeepSeek models
        const apiKey = await SecretsService.getSecret("deepseek_api_key") || "";
        return this.getClient("deepseek", apiKey);
      }
      // ... other model to provider mappings
      throw new Error(`Unsupported model: ${model}`);
    } catch (error) {
      console.error(`Error getting client for model ${model}:`, error);
      throw error;
    }
  }
}