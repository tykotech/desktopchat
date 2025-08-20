// src-deno/services/assistant_service.ts
import { Assistant, AssistantConfig } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";

function validateConfig(config: AssistantConfig) {
  if (!config.name?.trim()) {
    throw new Error("Assistant name is required");
  }
  if (!config.model?.trim()) {
    throw new Error("Assistant model is required");
  }
}

export class AssistantService {

  static async createAssistant(config: AssistantConfig): Promise<Assistant> {
    try {
      validateConfig(config);

      const assistantId = generateUUID();

      const assistant: Assistant = {
        id: assistantId,
        name: config.name.trim(),
        description: config.description?.trim() || "",
        model: config.model.trim(),
        systemPrompt: config.systemPrompt?.trim() || "",
        createdAt: new Date().toISOString()
      };

      const fileStorage = FileStorageClient.getInstance();
      await fileStorage.createAssistant({ ...assistant, id: assistantId });

      console.info({ level: "info", message: "Assistant created", assistantId });
      return assistant;
    } catch (error) {
      console.error({ level: "error", message: "Failed to create assistant", error });
      throw error;
    }
  }

  static async listAssistants(): Promise<Assistant[]> {
    try {
      const fileStorage = FileStorageClient.getInstance();
      const assistants = await fileStorage.listAssistants();
      return assistants.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.error({ level: "error", message: "Failed to list assistants", error });
      throw error;
    }
  }

  static async updateAssistant(
    assistantId: string,
    config: Partial<AssistantConfig>
  ): Promise<Assistant> {
    const fileStorage = FileStorageClient.getInstance();
    try {
      const assistant = await fileStorage.getAssistant(assistantId);
      if (!assistant) {
        throw new Error(`Assistant with id ${assistantId} not found`);
      }

      const updates: Partial<AssistantConfig> = {};
      if (config.name !== undefined) updates.name = config.name.trim();
      if (config.description !== undefined) updates.description = config.description.trim();
      if (config.model !== undefined) updates.model = config.model.trim();
      if (config.systemPrompt !== undefined) updates.systemPrompt = config.systemPrompt.trim();

      await fileStorage.updateAssistant(assistantId, updates);
      const updatedAssistant = await fileStorage.getAssistant(assistantId);
      if (!updatedAssistant) {
        throw new Error(`Failed to update assistant with id ${assistantId}`);
      }

      console.info({ level: "info", message: "Assistant updated", assistantId });
      return updatedAssistant;
    } catch (error) {
      console.error({ level: "error", message: "Failed to update assistant", assistantId, error });
      throw error;
    }
  }

  static async deleteAssistant(assistantId: string): Promise<void> {
    const fileStorage = FileStorageClient.getInstance();
    try {
      await fileStorage.deleteAssistant(assistantId);
      console.info({ level: "info", message: "Assistant deleted", assistantId });
    } catch (error) {
      console.error({ level: "error", message: "Failed to delete assistant", assistantId, error });
      throw error;
    }
  }
}