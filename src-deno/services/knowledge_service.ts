// src-deno/services/knowledge_service.ts
import { KnowledgeBase } from "../db/schema.ts";
import { generateUUID } from "../util/uuid.ts";
import { QdrantClient } from "../db/qdrant_client.ts";
import { processAndEmbedFile } from "../core/file_processor.ts";
import { FileStorageClient } from "../db/file_storage_client.ts";
import { SettingsService } from "./settings_service.ts";

export class KnowledgeService {
  
  private static async getQdrant(): Promise<QdrantClient> {
    // Get Qdrant configuration from settings
    const settings = await SettingsService.getAppSettings();
    return new QdrantClient(settings.qdrantUrl, settings.qdrantApiKey || "");
  }

  static async createKnowledgeBase(
    name: string,
    description: string,
    embeddingModel: string
  ): Promise<KnowledgeBase> {
    const kbId = generateUUID();
    
    // Determine vector size based on embedding model
    let vectorSize = 1536; // Default for OpenAI text-embedding-3-small
    
    // OpenAI models
    if (embeddingModel.includes("text-embedding-3-small")) {
      vectorSize = 1536;
    } else if (embeddingModel.includes("text-embedding-3-large")) {
      vectorSize = 3072;
    } else if (embeddingModel.includes("text-embedding-ada")) {
      vectorSize = 1536;
    } 
    // Cohere models
    else if (embeddingModel.includes("embed-english-v3.0") || embeddingModel.includes("embed-multilingual-v3.0")) {
      vectorSize = 1024;
    } else if (embeddingModel.includes("embed-english-light-v3.0") || embeddingModel.includes("embed-multilingual-light-v3.0")) {
      vectorSize = 384;
    }
    // Google models
    else if (embeddingModel.includes("embedding-001") || embeddingModel.includes("text-embedding-004")) {
      vectorSize = 768;
    }
    // Mistral models
    else if (embeddingModel.includes("mistral-embed")) {
      vectorSize = 1024;
    }
    // Other models - use defaults or try to determine from model name
    else if (embeddingModel.includes("large")) {
      vectorSize = 3072;
    } else if (embeddingModel.includes("small")) {
      vectorSize = 1536;
    }

    const kb: KnowledgeBase = {
      id: kbId,
      name,
      description,
      embeddingModel,
      vectorSize,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to file storage
      const fileStorage = FileStorageClient.getInstance();
      await fileStorage.createKnowledgeBase({ ...kb, id: kbId });
      
      // Create the Qdrant collection
      const qdrant = await this.getQdrant();
      await qdrant.createCollection(`knowledge_base_${kb.id}`, kb.vectorSize);
      
      return kb;
    } catch (error) {
      console.error("Error creating knowledge base:", error);
      // If we failed to create the Qdrant collection, clean up the database entry
      try {
        const fileStorage = FileStorageClient.getInstance();
        await fileStorage.deleteKnowledgeBase(kbId);
      } catch (cleanupError) {
        console.error("Error cleaning up knowledge base after failure:", cleanupError);
      }
      throw error;
    }
  }

  static async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const fileStorage = FileStorageClient.getInstance();
    return await fileStorage.listKnowledgeBases();
  }

  static async addFileToKnowledgeBase(kbId: string, fileId: string): Promise<void> {
    const fileStorage = FileStorageClient.getInstance();
    
    // Check if knowledge base exists
    const kb = await fileStorage.getKnowledgeBase(kbId);
    if (!kb) {
      throw new Error(`Knowledge base with id ${kbId} not found`);
    }
    
    // Add file to knowledge base
    await fileStorage.addFileToKnowledgeBase(kbId, fileId);
    
    // Trigger the file processing pipeline
    try {
      await processAndEmbedFile(fileId, kbId);
    } catch (error) {
      console.error("Error processing file for knowledge base:", error);
      // Update file status to error
      await fileStorage.updateFileStatus(fileId, "ERROR");
      throw error;
    }
  }
  
  static async deleteKnowledgeBase(kbId: string): Promise<void> {
    const fileStorage = FileStorageClient.getInstance();
    
    // Check if knowledge base exists
    const kb = await fileStorage.getKnowledgeBase(kbId);
    if (!kb) {
      throw new Error(`Knowledge base with id ${kbId} not found`);
    }
    
    try {
      // Delete the Qdrant collection
      const qdrant = await this.getQdrant();
      await qdrant.deleteCollection(`knowledge_base_${kbId}`);
    } catch (error) {
      console.warn(`Failed to delete Qdrant collection for knowledge base ${kbId}:`, error);
      // Continue with database deletion even if Qdrant deletion fails
    }
    
    // Delete from file storage
    await fileStorage.deleteKnowledgeBase(kbId);
  }
}