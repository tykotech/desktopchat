// src-deno/db/sqlite_storage_client.ts
import { DatabaseManager } from "./database_manager.ts";
import { 
  ManagedFile, 
  KnowledgeBase, 
  Assistant, 
  ChatSession, 
  ChatMessage 
} from "./schema.ts";

export class SqliteStorageClient {
  private databaseManager: DatabaseManager;

  constructor() {
    this.databaseManager = DatabaseManager.getInstance();
  }

  private async getSqliteClient() {
    return await this.databaseManager.getSqliteClient();
  }

  // Settings methods
  async getAppSettings(): Promise<Record<string, string>> {
    const client = await this.getSqliteClient();
    return client.getAppSettings();
  }

  async updateAppSettings(settings: Record<string, string>): Promise<void> {
    const client = await this.getSqliteClient();
    return client.updateAppSettings(settings);
  }

  // File methods
  async listFiles(): Promise<ManagedFile[]> {
    const client = await this.getSqliteClient();
    return client.listFiles();
  }

  async getFile(fileId: string): Promise<ManagedFile | null> {
    const client = await this.getSqliteClient();
    return client.getFile(fileId);
  }

  async createFile(file: Omit<ManagedFile, "id"> & { id: string }): Promise<void> {
    const client = await this.getSqliteClient();
    return client.createFile(file);
  }

  async updateFileStatus(fileId: string, status: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.updateFileStatus(fileId, status);
  }

  async deleteFile(fileId: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.deleteFile(fileId);
  }

  // Knowledge base methods
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const client = await this.getSqliteClient();
    return client.listKnowledgeBases();
  }

  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase | null> {
    const client = await this.getSqliteClient();
    return client.getKnowledgeBase(kbId);
  }

  async createKnowledgeBase(kb: Omit<KnowledgeBase, "id"> & { id: string }): Promise<void> {
    const client = await this.getSqliteClient();
    return client.createKnowledgeBase(kb);
  }

  async deleteKnowledgeBase(kbId: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.deleteKnowledgeBase(kbId);
  }

  // Knowledge base file methods
  async addFileToKnowledgeBase(knowledgeBaseId: string, fileId: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.addFileToKnowledgeBase(knowledgeBaseId, fileId);
  }

  async getKnowledgeBaseFiles(knowledgeBaseId: string): Promise<ManagedFile[]> {
    const client = await this.getSqliteClient();
    return client.getKnowledgeBaseFiles(knowledgeBaseId);
  }

  // Assistant methods
  async listAssistants(): Promise<Assistant[]> {
    const client = await this.getSqliteClient();
    return client.listAssistants();
  }

  async getAssistant(assistantId: string): Promise<Assistant | null> {
    const client = await this.getSqliteClient();
    return client.getAssistant(assistantId);
  }

  async createAssistant(assistant: Omit<Assistant, "id"> & { id: string }): Promise<void> {
    const client = await this.getSqliteClient();
    return client.createAssistant(assistant);
  }

  async updateAssistant(assistantId: string, updates: Partial<Assistant>): Promise<void> {
    const client = await this.getSqliteClient();
    return client.updateAssistant(assistantId, updates);
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.deleteAssistant(assistantId);
  }

  // Assistant knowledge base methods
  async addAssistantKnowledgeBase(assistantId: string, knowledgeBaseId: string): Promise<void> {
    const client = await this.getSqliteClient();
    return client.addAssistantKnowledgeBase(assistantId, knowledgeBaseId);
  }

  async getAssistantKnowledgeBases(assistantId: string): Promise<string[]> {
    const client = await this.getSqliteClient();
    return client.getAssistantKnowledgeBases(assistantId);
  }

  // Chat session methods
  async createChatSession(session: Omit<ChatSession, "id"> & { id: string }): Promise<void> {
    const client = await this.getSqliteClient();
    return client.createChatSession(session);
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    const client = await this.getSqliteClient();
    return client.getChatSession(sessionId);
  }

  // Chat message methods
  async saveMessage(message: Omit<ChatMessage, "id"> & { id: string }): Promise<void> {
    const client = await this.getSqliteClient();
    return client.saveMessage(message);
  }

  async getMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    const client = await this.getSqliteClient();
    return client.getMessagesForSession(sessionId);
  }
}