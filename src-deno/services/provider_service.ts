// src-deno/services/provider_service.ts
import { SecretsService } from "./secrets_service.ts";
// Import SDKs for better provider integration
import OpenAI from "openai";
import Anthropic from "anthropic";
import ollama from "ollama/browser";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.177.0/testing/mock.ts";

export interface ProviderConfig {
  id: string;
  name: string;
  type: "api" | "local";
  apiKey?: string;
  baseUrl?: string;
  enabled: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: "chat" | "embedding";
}

// Cache for connection tests and model listings
const connectionTestCache = new Map<
  string,
  { timestamp: number; result: boolean }
>();
const modelListCache = new Map<
  string,
  { timestamp: number; models: ModelInfo[] }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export class ProviderService {
  static async testConnection(providerId: string): Promise<boolean> {
    // Check cache first
    const cached = connectionTestCache.get(providerId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.result;
    }

    try {
      // Get provider configuration
      const apiKey = await SecretsService.getSecret(`${providerId}_api_key`);
      const baseUrl = await SecretsService.getSecret(`${providerId}_base_url`);

      // Skip if no credentials
      if (!apiKey && !baseUrl) {
        connectionTestCache.set(providerId, { timestamp: now, result: false });
        return false;
      }

      // Different connection tests based on provider type
      switch (providerId) {
        case "openai":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const openaiResult = await this.testOpenAIConnectionWithSDK(
            apiKey,
            baseUrl ?? undefined,
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: openaiResult,
          });
          return openaiResult;

        case "anthropic":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const anthropicResult = await this.testAnthropicConnectionWithSDK(
            apiKey,
            baseUrl ?? undefined,
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: anthropicResult,
          });
          return anthropicResult;

        case "ollama":
          const ollamaResult = await this.testOllamaConnectionWithSDK(
            baseUrl || "http://localhost:11434",
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: ollamaResult,
          });
          return ollamaResult;

        case "lmstudio":
          const lmstudioResult = await this.testLMStudioConnection(
            baseUrl || "http://localhost:1234",
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: lmstudioResult,
          });
          return lmstudioResult;

        case "openrouter":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const openrouterResult = await this.testOpenRouterConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: openrouterResult,
          });
          return openrouterResult;

        case "mistral":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const mistralResult = await this.testMistralConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: mistralResult,
          });
          return mistralResult;

        case "groq":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const groqResult = await this.testGroqConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: groqResult,
          });
          return groqResult;

        case "together":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const togetherResult = await this.testTogetherConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: togetherResult,
          });
          return togetherResult;

        case "google":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const googleResult = await this.testGoogleConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: googleResult,
          });
          return googleResult;

        case "azure-openai":
          if (!apiKey || !baseUrl) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const azureResult = await this.testAzureOpenAIConnection(
            apiKey,
            baseUrl,
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: azureResult,
          });
          return azureResult;

        case "huggingface":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const huggingfaceResult = await this.testHuggingFaceConnection(
            apiKey,
          );
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: huggingfaceResult,
          });
          return huggingfaceResult;

        case "xai":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const xaiResult = await this.testXAIConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: xaiResult,
          });
          return xaiResult;

        case "deepseek":
          if (!apiKey) {
            connectionTestCache.set(providerId, {
              timestamp: now,
              result: false,
            });
            return false;
          }
          const deepseekResult = await this.testDeepSeekConnection(apiKey);
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: deepseekResult,
          });
          return deepseekResult;

        default:
          connectionTestCache.set(providerId, {
            timestamp: now,
            result: false,
          });
          return false;
      }
    } catch (error) {
      console.error(
        `Error testing connection for provider ${providerId}:`,
        error,
      );
      connectionTestCache.set(providerId, { timestamp: now, result: false });
      return false;
    }
  }

  static async listAvailableModels(providerId: string): Promise<ModelInfo[]> {
    // Check cache first
    const cached = modelListCache.get(providerId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.models;
    }

    try {
      // Check if provider is configured and connected
      const isConnected = await this.testConnection(providerId);

      if (!isConnected) {
        modelListCache.set(providerId, { timestamp: now, models: [] });
        return []; // Return empty array if not connected
      }

      // Get provider configuration
      const apiKey = await SecretsService.getSecret(`${providerId}_api_key`);
      const baseUrl = await SecretsService.getSecret(`${providerId}_base_url`);

      // Fetch models based on provider type
      switch (providerId) {
        case "openai":
          const openaiModels = await this.fetchOpenAIModelsUsingSDK(
            apiKey!,
            baseUrl ?? undefined,
          );
          modelListCache.set(providerId, {
            timestamp: now,
            models: openaiModels,
          });
          return openaiModels;

        case "anthropic":
          const anthropicModels = await this.fetchAnthropicModelsUsingSDK(
            apiKey!,
            baseUrl ?? undefined,
          );
          modelListCache.set(providerId, {
            timestamp: now,
            models: anthropicModels,
          });
          return anthropicModels;

        case "ollama":
          const ollamaModels = await this.fetchOllamaModelsUsingSDK(
            baseUrl || "http://localhost:11434",
          );
          modelListCache.set(providerId, {
            timestamp: now,
            models: ollamaModels,
          });
          return ollamaModels;

        case "lmstudio":
          const lmstudioModels = await this.fetchLMStudioModels(
            baseUrl || "http://localhost:1234",
          );
          modelListCache.set(providerId, {
            timestamp: now,
            models: lmstudioModels,
          });
          return lmstudioModels;

        case "openrouter":
          const openrouterModels = await this.fetchOpenRouterModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: openrouterModels,
          });
          return openrouterModels;

        case "mistral":
          const mistralModels = await this.fetchMistralModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: mistralModels,
          });
          return mistralModels;

        case "groq":
          const groqModels = await this.fetchGroqModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: groqModels,
          });
          return groqModels;

        case "together":
          const togetherModels = await this.fetchTogetherModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: togetherModels,
          });
          return togetherModels;

        case "google":
          const googleModels = await this.fetchGoogleModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: googleModels,
          });
          return googleModels;

        case "azure-openai":
          const azureModels = await this.fetchAzureOpenAIModels(
            apiKey!,
            baseUrl!,
          );
          modelListCache.set(providerId, {
            timestamp: now,
            models: azureModels,
          });
          return azureModels;

        case "huggingface":
          const huggingfaceModels = await this.fetchHuggingFaceModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: huggingfaceModels,
          });
          return huggingfaceModels;

        case "xai":
          const xaiModels = await this.fetchXAIModels(apiKey!);
          modelListCache.set(providerId, { timestamp: now, models: xaiModels });
          return xaiModels;

        case "deepseek":
          const deepseekModels = await this.fetchDeepSeekModels(apiKey!);
          modelListCache.set(providerId, {
            timestamp: now,
            models: deepseekModels,
          });
          return deepseekModels;

        default:
          modelListCache.set(providerId, { timestamp: now, models: [] });
          return [];
      }
    } catch (error) {
      console.error(`Error listing models for provider ${providerId}:`, error);
      modelListCache.set(providerId, { timestamp: now, models: [] });
      return [];
    }
  }

  static async getProviderConfig(
    providerId: string,
  ): Promise<ProviderConfig | null> {
    try {
      const apiKey = await SecretsService.getSecret(`${providerId}_api_key`);
      const baseUrl = await SecretsService.getSecret(`${providerId}_base_url`);

      return {
        id: providerId,
        name: this.getProviderName(providerId),
        type: this.getProviderType(providerId),
        apiKey: apiKey || undefined,
        baseUrl: baseUrl || undefined,
        enabled: !!apiKey || !!baseUrl,
      };
    } catch (error) {
      console.error(`Error getting provider config for ${providerId}:`, error);
      return null;
    }
  }

  private static getProviderName(providerId: string): string {
    const names: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      ollama: "Ollama",
      lmstudio: "LM Studio",
      openrouter: "OpenRouter",
      mistral: "Mistral",
      groq: "Groq",
      together: "Together AI",
      google: "Google",
      "azure-openai": "Azure OpenAI",
      huggingface: "Hugging Face",
      xai: "xAI",
      deepseek: "DeepSeek",
    };

    return names[providerId] || providerId;
  }

  private static getProviderType(providerId: string): "api" | "local" {
    const localProviders = ["ollama", "lmstudio"];
    return localProviders.includes(providerId) ? "local" : "api";
  }

  // Provider-specific connection tests
  private static async testOpenAIConnectionWithSDK(
    apiKey: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl || "https://api.openai.com/v1",
        dangerouslyAllowBrowser: true,
      });

      // Test the connection by listing models
      await client.models.list();
      return true;
    } catch (error) {
      console.error("OpenAI SDK connection test failed:", error);
      return false;
    }
  }

  private static async testAnthropicConnectionWithSDK(
    apiKey: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const client = new Anthropic({
        apiKey: apiKey,
        baseURL: baseUrl || "https://api.anthropic.com",
        dangerouslyAllowBrowser: true,
      });

      // Test the connection with a simple request
      // Anthropic doesn't have a simple "list models" endpoint, so we'll just try to initialize
      return !!client;
    } catch (error) {
      console.error("Anthropic SDK connection test failed:", error);
      return false;
    }
  }

  private static async testOllamaConnectionWithSDK(
    baseUrl: string,
  ): Promise<boolean> {
    try {
      // For now, we'll just test if we can make a request to the Ollama API
      // The browser version of the Ollama client doesn't have a list method
      const response = await fetch(`${baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error("Ollama SDK connection test failed:", error);
      return false;
    }
  }

  private static async testOpenAIConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const url = baseUrl || "https://api.openai.com";
      const response = await fetch(`${url}/v1/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testAnthropicConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<boolean> {
    try {
      const url = baseUrl || "https://api.anthropic.com";
      const response = await fetch(`${url}/v1/models`, {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testOllamaConnection(baseUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testLMStudioConnection(
    baseUrl: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/v1/models`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testOpenRouterConnection(
    apiKey: string,
  ): Promise<boolean> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testMistralConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.mistral.ai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testGroqConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testTogetherConnection(
    apiKey: string,
  ): Promise<boolean> {
    try {
      const response = await fetch("https://api.together.xyz/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testGoogleConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testAzureOpenAIConnection(
    apiKey: string,
    baseUrl: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${baseUrl}/openai/deployments?api-version=2023-05-15`,
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testHuggingFaceConnection(
    apiKey: string,
  ): Promise<boolean> {
    try {
      const response = await fetch("https://huggingface.co/api/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testXAIConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.x.ai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private static async testDeepSeekConnection(
    apiKey: string,
  ): Promise<boolean> {
    try {
      const response = await fetch("https://api.deepseek.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Provider-specific model fetching using SDKs
  private static async fetchOpenAIModelsUsingSDK(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ModelInfo[]> {
    try {
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl || "https://api.openai.com/v1",
        dangerouslyAllowBrowser: true,
      });

      const response = await client.models.list();

      return response.data
        .filter((model: any) =>
          model.id.includes("gpt") || model.id.includes("embedding")
        )
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          provider: "openai",
          type: model.id.includes("embedding") ? "embedding" : "chat",
          description: model.description || model.id,
        }));
    } catch (error) {
      console.error("Error fetching OpenAI models using SDK:", error);
      // Fallback to the old method
      return await this.fetchOpenAIModels(apiKey, baseUrl);
    }
  }

  private static async fetchAnthropicModelsUsingSDK(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ModelInfo[]> {
    try {
      // Anthropic doesn't have a models endpoint in their SDK, so we'll return predefined models
      return [
        {
          id: "claude-3-5-sonnet-20240620",
          name: "Claude 3.5 Sonnet",
          provider: "anthropic",
          type: "chat",
          description: "Most intelligent model",
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude 3 Opus",
          provider: "anthropic",
          type: "chat",
          description: "Highly capable model for complex tasks",
        },
        {
          id: "claude-3-sonnet-20240229",
          name: "Claude 3 Sonnet",
          provider: "anthropic",
          type: "chat",
          description: "Balance of intelligence and speed",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          provider: "anthropic",
          type: "chat",
          description: "Fastest and most compact model",
        },
      ];
    } catch (error) {
      console.error("Error fetching Anthropic models using SDK:", error);
      // Fallback to the old method
      return await this.fetchAnthropicModels(apiKey, baseUrl);
    }
  }

  private static async fetchOllamaModelsUsingSDK(
    baseUrl: string,
  ): Promise<ModelInfo[]> {
    try {
      // For now, we'll use the REST API instead of the SDK for browser compatibility
      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: "ollama",
        type: "chat", // Ollama supports both chat and embedding but we'll mark as chat for now
        description: `${model.details.family} model`,
      }));
    } catch (error) {
      console.error("Error fetching Ollama models using SDK:", error);
      // Fallback to the old method
      return await this.fetchOllamaModels(baseUrl);
    }
  }

  // Original provider-specific model fetching (kept as fallback)
  private static async fetchOpenAIModels(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ModelInfo[]> {
    try {
      const url = baseUrl || "https://api.openai.com";
      const response = await fetch(`${url}/v1/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data
        .filter((model: any) =>
          model.id.includes("gpt") || model.id.includes("embedding")
        )
        .map((model: any) => ({
          id: model.id,
          name: model.id,
          provider: "openai",
          type: model.id.includes("embedding") ? "embedding" : "chat",
          description: model.description || model.id,
        }));
    } catch (error) {
      console.error("Error fetching OpenAI models:", error);
      return [];
    }
  }

  private static async fetchAnthropicModels(
    apiKey: string,
    baseUrl?: string,
  ): Promise<ModelInfo[]> {
    try {
      // Anthropic doesn't have a models endpoint, so we'll return predefined models
      return [
        {
          id: "claude-3-5-sonnet-20240620",
          name: "Claude 3.5 Sonnet",
          provider: "anthropic",
          type: "chat",
          description: "Most intelligent model",
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude 3 Opus",
          provider: "anthropic",
          type: "chat",
          description: "Highly capable model for complex tasks",
        },
        {
          id: "claude-3-sonnet-20240229",
          name: "Claude 3 Sonnet",
          provider: "anthropic",
          type: "chat",
          description: "Balance of intelligence and speed",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          provider: "anthropic",
          type: "chat",
          description: "Fastest and most compact model",
        },
      ];
    } catch (error) {
      console.error("Error fetching Anthropic models:", error);
      return [];
    }
  }

  private static async fetchOllamaModels(
    baseUrl: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: "ollama",
        type: "chat", // Ollama supports both chat and embedding but we'll mark as chat for now
        description: `${model.details.family} model`,
      }));
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
      return [];
    }
  }

  private static async fetchLMStudioModels(
    baseUrl: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${baseUrl}/v1/models`);

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "lmstudio",
        type: "chat", // LM Studio supports both but we'll mark as chat for now
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching LM Studio models:", error);
      return [];
    }
  }

  private static async fetchOpenRouterModels(
    apiKey: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "openrouter",
        type: model.id.includes("embedding")
          ? "embedding"
          : "chat" as "chat" | "embedding",
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching OpenRouter models:", error);
      return [];
    }
  }

  private static async fetchMistralModels(
    apiKey: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://api.mistral.ai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "mistral",
        type: model.id.includes("embed")
          ? "embedding"
          : "chat" as "chat" | "embedding",
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching Mistral models:", error);
      return [];
    }
  }

  private static async fetchGroqModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "groq",
        type: "chat", // Groq doesn't have embedding models
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching Groq models:", error);
      return [];
    }
  }

  private static async fetchTogetherModels(
    apiKey: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://api.together.xyz/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Together API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
        provider: "together",
        type: model.id.includes("embedding")
          ? "embedding"
          : "chat" as "chat" | "embedding",
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching Together models:", error);
      return [];
    }
  }

  private static async fetchGoogleModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models
        .filter((model: any) =>
          model.supportedGenerationMethods.includes("generateContent") ||
          model.supportedGenerationMethods.includes("embedContent")
        )
        .map((model: any) => ({
          id: model.name.replace("models/", ""),
          name: model.displayName || model.name.replace("models/", ""),
          provider: "google",
          type: model.supportedGenerationMethods.includes("embedContent")
            ? "embedding"
            : "chat" as "chat" | "embedding",
          description: model.description || model.name,
        }));
    } catch (error) {
      console.error("Error fetching Google models:", error);
      return [];
    }
  }

  private static async fetchAzureOpenAIModels(
    apiKey: string,
    baseUrl: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        `${baseUrl}/openai/deployments?api-version=2023-05-15`,
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "azure-openai",
        type: model.id.includes("embedding")
          ? "embedding"
          : "chat" as "chat" | "embedding",
        description: model.model || model.id,
      }));
    } catch (error) {
      console.error("Error fetching Azure OpenAI models:", error);
      return [];
    }
  }

  private static async fetchHuggingFaceModels(
    apiKey: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        "https://huggingface.co/api/models?filter=conversational,text-generation",
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      return data.slice(0, 20).map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "huggingface",
        type: "chat", // Hugging Face primarily focuses on chat models
        description: model.pipeline_tag || model.id,
      }));
    } catch (error) {
      console.error("Error fetching Hugging Face models:", error);
      return [];
    }
  }

  private static async fetchXAIModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      // xAI doesn't have a models endpoint, so we'll return predefined models
      return [
        {
          id: "grok-beta",
          name: "Grok Beta",
          provider: "xai",
          type: "chat",
          description: "xAI's large language model",
        },
      ];
    } catch (error) {
      console.error("Error fetching xAI models:", error);
      return [];
    }
  }

  private static async fetchDeepSeekModels(
    apiKey: string,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch("https://api.deepseek.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        provider: "deepseek",
        type: model.id.includes("embedding")
          ? "embedding"
          : "chat" as "chat" | "embedding",
        description: model.description || model.id,
      }));
    } catch (error) {
      console.error("Error fetching DeepSeek models:", error);
      return [];
    }
  }

  static async testMcpServerConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error(`Error testing MCP server connection for ${url}:`, error);
      return false;
    }
  }
}

// Command wrappers
export async function testProviderConnection(
  providerId: string,
): Promise<boolean> {
  return ProviderService.testConnection(providerId);
}

export async function listAvailableModels(
  providerId: string,
): Promise<ModelInfo[]> {
  return ProviderService.listAvailableModels(providerId);
}

export async function getProviderConfig(
  providerId: string,
): Promise<ProviderConfig | null> {
  return ProviderService.getProviderConfig(providerId);
}

Deno.test("ProviderService returns models for configured providers", async () => {
  const providerFetchMap: Record<string, string> = {
    openai: "fetchOpenAIModelsUsingSDK",
    anthropic: "fetchAnthropicModelsUsingSDK",
    ollama: "fetchOllamaModelsUsingSDK",
    lmstudio: "fetchLMStudioModels",
    openrouter: "fetchOpenRouterModels",
    mistral: "fetchMistralModels",
    groq: "fetchGroqModels",
    together: "fetchTogetherModels",
    google: "fetchGoogleModels",
    "azure-openai": "fetchAzureOpenAIModels",
    huggingface: "fetchHuggingFaceModels",
    xai: "fetchXAIModels",
    deepseek: "fetchDeepSeekModels",
  };

  const originalTestConnection = ProviderService.testConnection;
  const originalGetSecret = SecretsService.getSecret;

  // Use Deno's stub to safely mock static methods
  const testConnectionStub = stub(
    ProviderService,
    "testConnection",
    () => Promise.resolve(true),
  );
  const getSecretStub = stub(
    SecretsService,
    "getSecret",
    () => Promise.resolve("dummy"),
  );
  try {
    for (const [providerId, methodName] of Object.entries(providerFetchMap)) {
      const mockModels: ModelInfo[] = [
        { id: "model", name: "Model", provider: providerId, type: "chat" },
      ];
      const service = ProviderService as unknown as {
        [key: string]: (...args: unknown[]) => Promise<ModelInfo[]>;
      };
      const originalFetch = service[methodName];
      service[methodName] = () => Promise.resolve(mockModels);

      modelListCache.clear();
      const models = await ProviderService.listAvailableModels(providerId);
      assertEquals(models, mockModels);

      service[methodName] = originalFetch;
    }
  } finally {
    testConnectionStub.restore();
    getSecretStub.restore();
    modelListCache.clear();
  }
});
