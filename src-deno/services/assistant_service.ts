// src-deno/services/assistant_service.ts
import { Assistant, AssistantConfig } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";

export class AssistantService {

  static async createAssistant(config: AssistantConfig): Promise<Assistant> {
    const assistantId = generateUUID();

    const assistant: Assistant = {
      id: assistantId,
      name: config.name,
      description: config.description,
      model: config.model,
      systemPrompt: config.systemPrompt,
      createdAt: new Date().toISOString(),
      knowledgeBaseIds: config.knowledgeBaseIds || []
    };

    // Save to file storage
    const fileStorage = FileStorageClient.getInstance();
    await fileStorage.createAssistant({ ...assistant, id: assistantId });

    if (assistant.knowledgeBaseIds.length > 0) {
      await fileStorage.setAssistantKnowledgeBases(assistantId, assistant.knowledgeBaseIds);
    }

    return assistant;
  }

  static async listAssistants(): Promise<Assistant[]> {
    const fileStorage = FileStorageClient.getInstance();
    return await fileStorage.listAssistants();
  }

  static async updateAssistant(
    assistantId: string,
    config: Partial<AssistantConfig>
  ): Promise<Assistant> {
    const fileStorage = FileStorageClient.getInstance();
    
    // Check if assistant exists
    const assistant = await fileStorage.getAssistant(assistantId);
    if (!assistant) {
      throw new Error(`Assistant with id ${assistantId} not found`);
    }
    
    // Update assistant
    const updates: any = {};
    if (config.name !== undefined) updates.name = config.name;
    if (config.description !== undefined) updates.description = config.description;
    if (config.model !== undefined) updates.model = config.model;
    if (config.systemPrompt !== undefined) updates.systemPrompt = config.systemPrompt;

    await fileStorage.updateAssistant(assistantId, updates);

    if (config.knowledgeBaseIds) {
      await fileStorage.setAssistantKnowledgeBases(assistantId, config.knowledgeBaseIds);
    }

    // Return updated assistant
    const updatedAssistant = await fileStorage.getAssistant(assistantId);
    if (!updatedAssistant) {
      throw new Error(`Failed to update assistant with id ${assistantId}`);
    }

    const knowledgeBaseIds = await fileStorage.getAssistantKnowledgeBases(assistantId);

    return { ...updatedAssistant, knowledgeBaseIds };
  }

  static async deleteAssistant(assistantId: string): Promise<void> {
    const fileStorage = FileStorageClient.getInstance();
    await fileStorage.deleteAssistant(assistantId);
  }

  static async getAssistant(assistantId: string): Promise<Assistant | null> {
    const fileStorage = FileStorageClient.getInstance();
    const assistant = await fileStorage.getAssistant(assistantId);
    if (!assistant) return null;
    const knowledgeBaseIds = await fileStorage.getAssistantKnowledgeBases(assistantId);
    return { ...assistant, knowledgeBaseIds };
  }
}