// src-deno/db/file_storage_client.ts
import { SqliteStorageClient } from "./sqlite_storage_client.ts";
import { 
  ManagedFile, 
  KnowledgeBase, 
  Assistant, 
  ChatSession, 
  ChatMessage 
} from "./schema.ts";

export class FileStorageClient {
  private static instance: FileStorageClient | null = null;
  private sqliteStorage: SqliteStorageClient;

  private constructor() {
    this.sqliteStorage = new SqliteStorageClient();
  }

  static getInstance(): FileStorageClient {
    if (!FileStorageClient.instance) {
      FileStorageClient.instance = new FileStorageClient();
    }
    return FileStorageClient.instance;
  }

  // Settings methods
  async getAppSettings(): Promise<Record<string, string>> {
    return await this.sqliteStorage.getAppSettings();
  }

  async updateAppSettings(settings: Record<string, string>): Promise<void> {
    return await this.sqliteStorage.updateAppSettings(settings);
  }

  // File methods
  async listFiles(): Promise<ManagedFile[]> {
    return await this.sqliteStorage.listFiles();
  }

  async getFile(fileId: string): Promise<ManagedFile | null> {
    return await this.sqliteStorage.getFile(fileId);
  }

  async createFile(file: Omit<ManagedFile, "id"> & { id: string }): Promise<void> {
    return await this.sqliteStorage.createFile(file);
  }

  async updateFileStatus(fileId: string, status: string): Promise<void> {
    return await this.sqliteStorage.updateFileStatus(fileId, status);
  }

  async deleteFile(fileId: string): Promise<void> {
    return await this.sqliteStorage.deleteFile(fileId);
  }

  // Knowledge base methods
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    return await this.sqliteStorage.listKnowledgeBases();
  }

  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase | null> {
    return await this.sqliteStorage.getKnowledgeBase(kbId);
  }

  async createKnowledgeBase(kb: Omit<KnowledgeBase, "id"> & { id: string }): Promise<void> {
    return await this.sqliteStorage.createKnowledgeBase(kb);
  }

  async deleteKnowledgeBase(kbId: string): Promise<void> {
    return await this.sqliteStorage.deleteKnowledgeBase(kbId);
  }

  // Knowledge base file methods
  async addFileToKnowledgeBase(knowledgeBaseId: string, fileId: string): Promise<void> {
    return await this.sqliteStorage.addFileToKnowledgeBase(knowledgeBaseId, fileId);
  }

  async removeFileFromKnowledgeBase(knowledgeBaseId: string, fileId: string): Promise<void> {
    return await this.sqliteStorage.removeFileFromKnowledgeBase(knowledgeBaseId, fileId);
  }

  async getKnowledgeBaseFiles(knowledgeBaseId: string): Promise<ManagedFile[]> {
    return await this.sqliteStorage.getKnowledgeBaseFiles(knowledgeBaseId);
  }

  // Assistant methods
  async listAssistants(): Promise<Assistant[]> {
    return await this.sqliteStorage.listAssistants();
  }

  async getAssistant(assistantId: string): Promise<Assistant | null> {
    return await this.sqliteStorage.getAssistant(assistantId);
  }

  async createAssistant(assistant: Omit<Assistant, "id"> & { id: string }): Promise<void> {
    return await this.sqliteStorage.createAssistant(assistant);
  }

  async updateAssistant(assistantId: string, updates: Partial<Assistant>): Promise<void> {
    return await this.sqliteStorage.updateAssistant(assistantId, updates);
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    return await this.sqliteStorage.deleteAssistant(assistantId);
  }

  // Assistant knowledge base methods
  async addAssistantKnowledgeBase(assistantId: string, knowledgeBaseId: string): Promise<void> {
    return await this.sqliteStorage.addAssistantKnowledgeBase(assistantId, knowledgeBaseId);
  }

  async getAssistantKnowledgeBases(assistantId: string): Promise<string[]> {
    return await this.sqliteStorage.getAssistantKnowledgeBases(assistantId);
  }

  async setAssistantKnowledgeBases(assistantId: string, knowledgeBaseIds: string[]): Promise<void> {
    return await this.sqliteStorage.setAssistantKnowledgeBases(assistantId, knowledgeBaseIds);
  }

  // Chat session methods
  async createChatSession(session: Omit<ChatSession, "id"> & { id: string }): Promise<void> {
    return await this.sqliteStorage.createChatSession(session);
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return await this.sqliteStorage.getChatSession(sessionId);
  }

  // Chat message methods
  async saveMessage(message: Omit<ChatMessage, "id"> & { id: string }): Promise<void> {
    return await this.sqliteStorage.saveMessage(message);
  }

  async getMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    return await this.sqliteStorage.getMessagesForSession(sessionId);
  }
}