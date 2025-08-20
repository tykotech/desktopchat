// src/hooks/useTauriMutation.ts
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

// Dynamically import Tauri invoke to avoid issues in browser environments
let invoke: typeof import("@tauri-apps/api/core").invoke | null = null;

// Try to import invoke, but don't fail if it's not available
try {
  invoke = require("@tauri-apps/api/core").invoke;
} catch (e) {
  console.warn("Tauri invoke not available, using mock mode");
}

export function useTauriMutation<T = unknown, V = unknown>(
  command: string,
  options?: UseMutationOptions<V, unknown, T>
) {
  return useMutation<V, unknown, T>({
    mutationFn: async (variables) => {
      // Check if we're in a Tauri context
      if (invoke && typeof invoke === 'function') {
        const result = await invoke<string | void>(command, variables as any);
        // If the result is a string, try to parse it as JSON
        if (typeof result === 'string') {
          try {
            return JSON.parse(result);
          } catch (e) {
            // If parsing fails, return the string as-is
            return result as unknown as V;
          }
        }
        return result as V;
      } else {
        // Mock implementation for development outside of Tauri
        console.warn(`Tauri invoke not available, mocking mutation for command: ${command}`);
        return mockMutation<T, V>(command, variables);
      }
    },
    ...options,
  });
}

// Helper function to mock mutations for development
async function mockMutation<T, V>(command: string, variables: T): Promise<V> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  switch (command) {
    case "create_assistant":
      return {
        id: "mock-" + Date.now(),
        name: (variables as any).name,
        description: (variables as any).description,
        model: (variables as any).model,
        systemPrompt: (variables as any).systemPrompt,
        createdAt: new Date().toISOString()
      } as unknown as V;
    case "update_app_settings":
      return undefined as unknown as V;
    case "set_secret":
      return undefined as unknown as V;
    case "create_knowledge_base":
      const { name, description, embeddingModel } = variables as any;
      // Determine vector size based on embedding model
      let vectorSize = 1536; // Default for OpenAI text-embedding-3-small
      if (embeddingModel.includes("large")) {
        vectorSize = 3072; // For larger models
      }
      return {
        id: "kb-" + Date.now(),
        name,
        description,
        embeddingModel,
        vectorSize,
        createdAt: new Date().toISOString()
      } as unknown as V;
    case "update_knowledge_base":
      const { knowledgeBaseId, name: kbName, description: kbDescription, embeddingModel: kbEmbeddingModel } = variables as any;
      // Determine vector size based on embedding model
      let kbVectorSize = 1536; // Default for OpenAI text-embedding-3-small
      if (kbEmbeddingModel.includes("large")) {
        kbVectorSize = 3072; // For larger models
      }
      return {
        id: knowledgeBaseId,
        name: kbName,
        description: kbDescription,
        embeddingModel: kbEmbeddingModel,
        vectorSize: kbVectorSize,
        createdAt: new Date().toISOString()
      } as unknown as V;
    case "upload_file":
      return {
        id: "file-" + Date.now(),
        name: (variables as any).fileName,
        path: (variables as any).filePath,
        size: Math.floor(Math.random() * 1000000),
        mimeType: "text/plain",
        status: "PENDING",
        createdAt: new Date().toISOString()
      } as unknown as V;
    case "delete_file":
      return undefined as unknown as V;
    case "add_file_to_knowledge_base":
      return undefined as unknown as V;
    case "update_assistant":
      return {
        id: (variables as any).assistantId,
        name: (variables as any).config.name || "Updated Assistant",
        description: (variables as any).config.description || "Updated description",
        model: (variables as any).config.model || "gpt-4",
        systemPrompt: (variables as any).config.systemPrompt || "You are a helpful assistant.",
        createdAt: new Date().toISOString()
      } as unknown as V;
    case "test_qdrant_connection":
      return { success: true } as unknown as V;
    default:
      return {} as unknown as V;
  }
}